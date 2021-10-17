import {Injectable} from '@nestjs/common';
import {DiagnosticRelatedInformation} from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {Diagnostic, DiagnosticSeverity} from 'vscode-languageserver/node';
import {Annotation, Snippet} from '../assignments-api/annotation';
import {AssignmentsApiService} from '../assignments-api/assignments-api.service';
import {ConfigService} from '../config/config.service';
import {ConnectionService} from '../connection/connection.service';
import {DocumentService} from '../document/document.service';

@Injectable()
export class ValidationService {
  constructor(
    private connectionService: ConnectionService,
    private documentService: DocumentService,
    private configService: ConfigService,
    private assignmentsApiService: AssignmentsApiService,
  ) {
    this.connectionService.connection.onDidChangeConfiguration(() => {
      this.documentService.documents.all().forEach(d => this.validateTextDocument(d));
    });
    this.documentService.documents.onDidChangeContent(change => {
      this.validateTextDocument(change.document);
    });
  }

  async validateTextDocument(textDocument: TextDocument): Promise<void> {
    const uri = textDocument.uri;
    const config = await this.configService.getDocumentConfig(uri);
    const {github, file} = await this.assignmentsApiService.getFileAndGithub(config, uri);
    const solution = await this.assignmentsApiService.getSolution(config, github);
    const annotations = await this.assignmentsApiService.getAnnotations(config, solution._id, {file});
    const document = this.documentService.documents.get(uri);
    if (!document) {
      return;
    }

    const diagnostics: Diagnostic[] = [];
    this.addAnnotationDiagnostics(annotations, document, diagnostics);

    this.connectionService.connection.sendDiagnostics({uri, diagnostics});
  }

  private addAnnotationDiagnostics(annotations: Annotation[], document: TextDocument, diagnostics: Diagnostic[]) {
    const {uri} = document;
    for (const annotation of annotations) {
      for (const snippet of annotation.snippets) {
        if (!uri.endsWith(snippet.file)) {
          continue;
        }

        diagnostics.push(this.createSnippetDiagnostic(annotation, snippet, document));
      }
    }
  }

  private createSnippetDiagnostic(annotation: Annotation, snippet: Snippet, document: TextDocument) {
    const relatedInformation = this.connectionService.hasDiagnosticRelatedInformationCapability ? annotation.snippets.filter(other => other !== snippet).map((other): DiagnosticRelatedInformation => ({
      location: {
        uri: document.uri.slice(0, -snippet.file.length) + other.file,
        range: {start: other.from, end: other.to},
      },
      message: other.comment,
    })) : undefined;

    const diagnostic: Diagnostic = {
      message: `${annotation.remark}: ${snippet.comment} ~${annotation.author}`,
      range: this.findRange(document, snippet),
      source: 'Feedback',
      severity: annotation.points === 0 ? DiagnosticSeverity.Error : DiagnosticSeverity.Information,
      code: annotation.points + 'P',
      relatedInformation,
    };
    return diagnostic;
  }

  private findRange(document: TextDocument, snippet: Snippet) {
    const range = {start: snippet.from, end: snippet.to};
    const currentCode = document.getText(range);
    if (currentCode === snippet.code) {
      return range;
    }

    const text = document.getText();
    const offset = document.offsetAt(snippet.from);
    let index = text.indexOf(snippet.code, offset);
    if (index < 0) {
      // TODO find both indices and rank based on distance to original location
      index = text.lastIndexOf(snippet.code, offset);
    }
    if (index >= 0) {
      range.start = document.positionAt(index);
      range.end = document.positionAt(index + snippet.code.length);
    }
    return range;
  }
}

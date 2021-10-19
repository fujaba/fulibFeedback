import {Injectable} from '@nestjs/common';
import {DiagnosticRelatedInformation} from 'vscode-languageserver';
import {Range, TextDocument} from 'vscode-languageserver-textdocument';
import {Diagnostic, DiagnosticSeverity} from 'vscode-languageserver/node';
import {feedbackPattern} from '../action/action.service';
import {Annotation, Snippet} from '../assignments-api/annotation';
import {Assignment, Task} from '../assignments-api/assignment';
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
    const {assignment, github, file} = await this.assignmentsApiService.getFileAndGithub(config, uri);
    const solution = await this.assignmentsApiService.getSolution(config, github);
    const annotations = await this.assignmentsApiService.getAnnotations(config, solution._id, {file});
    const document = this.documentService.documents.get(uri);
    if (!document) {
      return;
    }

    const diagnostics: Diagnostic[] = [];
    this.addPendingFeedbackDiagnostics(document, diagnostics);
    this.addAnnotationDiagnostics(assignment, annotations, document, diagnostics);

    this.connectionService.connection.sendDiagnostics({uri, diagnostics});
  }

  private addPendingFeedbackDiagnostics(document: TextDocument, diagnostics: Diagnostic[]) {
    const text = document.getText();
    const pattern = new RegExp(feedbackPattern, 'g');
    let match: RegExpExecArray | null;
    while (match = pattern.exec(text)) {
      const range: Range = {
        start: document.positionAt(match.index),
        end: document.positionAt(match.index + match[0].length),
      };
      diagnostics.push({
        range,
        severity: DiagnosticSeverity.Warning,
        message: 'Unsubmitted Feedback\nEnter a comment and press Alt+Enter to submit the Feedback.',
        source: 'Feedback',
      });
    }
  }

  private addAnnotationDiagnostics(assignment: Assignment, annotations: Annotation[], document: TextDocument, diagnostics: Diagnostic[]) {
    const {uri} = document;
    for (const annotation of annotations) {
      for (const snippet of annotation.snippets) {
        if (!uri.endsWith(snippet.file)) {
          continue;
        }

        diagnostics.push(this.createSnippetDiagnostic(assignment, annotation, snippet, document));
      }
    }
  }

  private createSnippetDiagnostic(assignment: Assignment, annotation: Annotation, snippet: Snippet, document: TextDocument) {
    const relatedInformation = this.connectionService.hasDiagnosticRelatedInformationCapability ? annotation.snippets.filter(other => other !== snippet).map((other): DiagnosticRelatedInformation => ({
      location: {
        uri: document.uri.slice(0, -snippet.file.length) + other.file,
        range: {start: other.from, end: other.to},
      },
      message: other.comment,
    })) : undefined;

    const task = this.assignmentsApiService.findTask(assignment.tasks, annotation.task);
    const diagnostic: Diagnostic = {
      message: `${task?.description}: ${snippet.comment} ~${annotation.author}`,
      range: this.findRange(document, snippet),
      source: 'Feedback',
      severity: task ? this.getSeverity(task, annotation) : DiagnosticSeverity.Warning,
      code: annotation.points + 'P',
      relatedInformation,
      // TODO not necessary when fetching annotations/snippets in ActionService
      data: {
        assignment: annotation.assignment,
        solution: annotation.solution,
        annotation: annotation._id,
        snippet: annotation.snippets.indexOf(snippet),
      },
    };
    return diagnostic;
  }

  private getSeverity(task: Task, {points}: Annotation) {
    const min = Math.min(task.points, 0);
    const max = Math.max(task.points, 0);
    switch (points) {
      case min:
        return DiagnosticSeverity.Error;
      case max:
        return DiagnosticSeverity.Information;
      default:
        return DiagnosticSeverity.Warning;
    }
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

import {Injectable} from '@nestjs/common';
import {Subscription} from 'rxjs';
import {DiagnosticRelatedInformation} from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {Diagnostic, DiagnosticSeverity} from 'vscode-languageserver/node';
import {Assignment, Task} from '../assignments-api/assignment';
import {AssignmentsApiService} from '../assignments-api/assignments-api.service';
import {Evaluation, Snippet} from '../assignments-api/evaluation';
import {ConfigService} from '../config/config.service';
import {ConnectionService} from '../connection/connection.service';
import {DocumentService} from '../document/document.service';

@Injectable()
export class ValidationService {
  private subscription?: Subscription;
  private openDocuments: TextDocument[] = [];

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

    this.documentService.documents.onDidOpen(async event => {
      this.openDocuments.push(event.document);

      if (!this.subscription) {
        await this.initStream(event.document);
      }
    });
    this.documentService.documents.onDidClose(event => {
      const index = this.openDocuments.findIndex(t => t.uri === event.document.uri);
      if (index >= 0) {
        this.openDocuments.splice(index, 1);
      }

      if (this.openDocuments.length === 0) {
        this.subscription?.unsubscribe();
        delete this.subscription;
      }
    });
  }

  private async initStream(document: TextDocument) {
    const config = await this.configService.getDocumentConfig(document.uri);
    const {assignment, solution} = await this.assignmentsApiService.getContext(config, document.uri);
    if (!assignment || !solution) {
      return;
    }

    this.subscription = this.assignmentsApiService.streamEvaluations(config, solution._id).subscribe(({evaluation}) => {
      for (const openDocument of this.openDocuments) {
        if (evaluation.snippets.find(s => openDocument.uri.endsWith(s.file))) {
          this.validateTextDocument(openDocument);
        }
      }
    });
  }

  async validateTextDocument(textDocument: TextDocument): Promise<void> {
    const uri = textDocument.uri;
    const config = await this.configService.getDocumentConfig(uri);
    const {assignment, solution, file} = await this.assignmentsApiService.getContext(config, uri);
    if (!assignment || !solution) {
      return;
    }

    const evaluations = await this.assignmentsApiService.getEvaluations(config, solution._id, {file});
    const document = this.documentService.documents.get(uri);
    if (!document) {
      return;
    }

    const diagnostics: Diagnostic[] = [];
    this.addEvaluationDiagnostics(assignment, evaluations, document, diagnostics);

    this.connectionService.connection.sendDiagnostics({uri, diagnostics});
  }

  private addEvaluationDiagnostics(assignment: Assignment, evaluations: Evaluation[], document: TextDocument, diagnostics: Diagnostic[]) {
    const {uri} = document;
    for (const evaluation of evaluations) {
      for (const snippet of evaluation.snippets) {
        if (!uri.endsWith(snippet.file)) {
          continue;
        }

        diagnostics.push(this.createSnippetDiagnostic(assignment, evaluation, snippet, document));
      }
    }
  }

  private createSnippetDiagnostic(assignment: Assignment, evaluation: Evaluation, snippet: Snippet, document: TextDocument) {
    const relatedInformation = this.connectionService.hasDiagnosticRelatedInformationCapability ? evaluation.snippets.filter(other => other !== snippet).map((other): DiagnosticRelatedInformation => ({
      location: {
        uri: document.uri.slice(0, -snippet.file.length) + other.file,
        range: {start: other.from, end: other.to},
      },
      message: other.comment,
    })) : undefined;

    const task = this.assignmentsApiService.findTask(assignment.tasks, evaluation.task);
    const diagnostic: Diagnostic = {
      message: `${task?.description}: ${snippet.comment} ~${evaluation.author}`,
      range: this.findRange(document, snippet),
      source: 'Feedback',
      severity: task ? this.getSeverity(task, evaluation) : DiagnosticSeverity.Warning,
      code: evaluation.points + 'P',
      relatedInformation,
    };
    return diagnostic;
  }

  private getSeverity(task: Task, {points}: Evaluation) {
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

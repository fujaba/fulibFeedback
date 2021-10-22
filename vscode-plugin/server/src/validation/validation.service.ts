import {Injectable} from '@nestjs/common';
import {DiagnosticRelatedInformation} from 'vscode-languageserver';
import {Range, TextDocument} from 'vscode-languageserver-textdocument';
import {Diagnostic, DiagnosticSeverity} from 'vscode-languageserver/node';
import {feedbackPattern} from '../action/action.service';
import {Evaluation, Snippet} from '../assignments-api/evaluation';
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
    const evaluations = await this.assignmentsApiService.getEvaluations(config, solution._id, {file});
    const document = this.documentService.documents.get(uri);
    if (!document) {
      return;
    }

    const diagnostics: Diagnostic[] = [];
    this.addPendingFeedbackDiagnostics(document, diagnostics);
    this.addEvaluationDiagnostics(assignment, evaluations, document, diagnostics);

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
      // TODO not necessary when fetching evaluations/snippets in ActionService
      data: {
        assignment: evaluation.assignment,
        solution: evaluation.solution,
        evaluation: evaluation._id,
        snippet: evaluation.snippets.indexOf(snippet),
      },
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

import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {CodeAction, CodeActionParams, WorkspaceEdit} from 'vscode-languageserver';
import {Position, Range} from 'vscode-languageserver-textdocument';
import {Snippet} from '../assignments-api/annotation';
import {AssignmentsApiService} from '../assignments-api/assignments-api.service';
import {ConfigService} from '../config/config.service';
import {ConnectionService} from '../connection/connection.service';
import {DocumentService} from '../document/document.service';

export const feedbackPattern = /\/\/ Feedback:(\d+):(\d+):(\d+)-(\d+):(\d+):Comment:(.*)/;

interface PrepareData {
  type: 'prepare';
  uri: string;
  task: number;
  range: Range;
}

interface SubmitData {
  type: 'submit';
  uri: string;
  currentLine: number;
  solution: string;
  annotation: {
    remark: string;
    points: number;
    task: number;
  };
  snippet: {
    file: string;
    from: Position;
    to: Position;
    comment: string;
  };
}

interface CancelData {
  type: 'cancel';
  uri: string;
  currentLine: number;
}

@Injectable()
export class ActionService {
  constructor(
    private connectionService: ConnectionService,
    private configService: ConfigService,
    private documentService: DocumentService,
    private httpService: HttpService,
    private assignmentsApiService: AssignmentsApiService,
  ) {
    this.connectionService.connection.onCodeAction((params) => this.provideActions(params));
    this.connectionService.connection.onCodeActionResolve(params => this.resolveAction(params));
  }

  private async provideActions(params: CodeActionParams): Promise<CodeAction[]> {
    const uri = params.textDocument.uri;
    const config = await this.configService.getDocumentConfig(uri);
    const {assignment, github, file} = await this.assignmentsApiService.getFileAndGithub(config, uri);
    const range = params.range;
    const document = this.documentService.documents.get(uri);
    if (!document) {
      return [];
    }

    const currentLine: Range = this.lineToRange(range.start.line);
    const line = document.getText(currentLine);
    const match = feedbackPattern.exec(line);

    if (match) {
      const solution = await this.assignmentsApiService.getSolution(config, github);
      const [, taskIndex, startLine, startChar, endLine, endChar, comment] = match;
      const data: SubmitData = {
        type: 'submit',
        uri,
        currentLine: range.start.line,
        solution: solution._id,
        annotation: {
          task: +taskIndex,
          remark: assignment.tasks[+taskIndex].description,
          points: 0,
        },
        snippet: {
          file,
          from: {line: +startLine, character: +startChar},
          to: {line: +endLine, character: +endChar},
          comment: comment.trim(),
        },
      };
      return [
        {
          title: 'Submit Feedback',
          data,
        },
        {
          title: 'Cancel Feedback',
          data: {
            type: 'cancel',
            uri,
            currentLine: range.start.line,
          },
        },
      ];
    }

    return assignment.tasks.map((task, i): CodeAction => ({
      title: `Feedback: ${task.description} (${task.points}P)`,
      data: {
        type: 'prepare',
        task: i,
        uri,
        range,
      } as PrepareData,
    }));
  }

  private lineToRange(line: number): Range {
    return {
      start: {line, character: 0},
      end: {line: line + 1, character: 0},
    };
  }

  private async resolveAction(params: CodeAction): Promise<CodeAction> {
    if (!params.data || !('type' in (params.data as any))) {
      return params;
    }
    switch ((params.data as any).type) {
      case 'prepare':
        return this.resolvePrepareAction(params);
      case 'submit':
        return this.resolveSubmitAction(params);
      case 'cancel':
        return this.resolveCancelAction(params);
    }
    return params;
  }

  private async resolvePrepareAction(params: CodeAction): Promise<CodeAction> {
    const {task, uri, range} = params.data as PrepareData;
    const pos: Position = {line: range.start.line, character: 0};
    params.edit = {
      documentChanges: [{
        textDocument: {uri, version: null},
        edits: [{
          range: {start: pos, end: pos},
          newText: `// Feedback:${task}:${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}:Comment: \n`,
        }],
      }],
    };
    return params;
  }

  private async resolveSubmitAction(params: CodeAction): Promise<CodeAction> {
    const {uri, currentLine} = params.data as SubmitData;
    params.edit = this.createDeleteLineEdit(uri, currentLine);

    const {solution, snippet: snippetBase, annotation: annotationBase} = params.data as SubmitData;
    const config = await this.configService.getDocumentConfig(uri);
    const document = this.documentService.documents.get(uri);
    const snippet: Snippet = {
      ...snippetBase,
      code: document?.getText({start: snippetBase.from, end: snippetBase.to}) ?? '',
    };

    const existing = await this.assignmentsApiService.getAnnotations(config, solution, {
      task: annotationBase.task,
    });
    if (existing.length) {
      const first = existing[0];
      await this.assignmentsApiService.updateAnnotation(config, solution, first._id, {
        ...first,
        ...annotationBase,
        snippets: [...first.snippets, snippet],
      });
    } else {
      await this.assignmentsApiService.createAnnotation(config, solution, {
        ...annotationBase,
        author: config.user.name,
        snippets: [snippet],
      });
    }
    return params;
  }

  private resolveCancelAction(params: CodeAction): CodeAction {
    const {uri, currentLine} = params.data as CancelData;
    params.edit = this.createDeleteLineEdit(uri, currentLine);
    return params;
  }

  private createDeleteLineEdit(uri: string, line: number): WorkspaceEdit {
    return {
      documentChanges: [{
        textDocument: {uri, version: null},
        edits: [{
          range: this.lineToRange(line),
          newText: '',
        }],
      }],
    };
  }
}

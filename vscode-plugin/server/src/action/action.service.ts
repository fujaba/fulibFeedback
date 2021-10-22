import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {CodeAction, CodeActionParams, WorkspaceEdit} from 'vscode-languageserver';
import {Position, Range} from 'vscode-languageserver-textdocument';
import {Snippet} from '../assignments-api/evaluation';
import {Task} from '../assignments-api/assignment';
import {AssignmentsApiService} from '../assignments-api/assignments-api.service';
import {ConfigService} from '../config/config.service';
import {ConnectionService} from '../connection/connection.service';
import {DocumentService} from '../document/document.service';

export const feedbackPattern = /\/\/ Feedback:([a-zA-Z0-9]+):(\d+):(\d+)-(\d+):(\d+):Comment:(.*)/;

interface PrepareData {
  type: 'prepare';
  uri: string;
  task: string;
  range: Range;
}

interface SubmitData {
  type: 'submit';
  uri: string;
  currentLine: number;
  solution: string;
  evaluation: {
    points: number;
    task: string;
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

interface DeleteData {
  type: 'delete';
  uri: string;
  assignment: string;
  solution: string;
  evaluation: string;
  snippet: number;
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
    const document = this.documentService.documents.get(uri);
    if (!document) {
      return [];
    }

    const config = await this.configService.getDocumentConfig(uri);
    if (!config.assignment.token) {
      return [];
    }

    const {assignment, github, file} = await this.assignmentsApiService.getFileAndGithub(config, uri);
    const solution = await this.assignmentsApiService.getSolution(config, github);
    const range = params.range;
    const currentLine: Range = this.lineToRange(range.start.line);
    const line = document.getText(currentLine);
    const match = feedbackPattern.exec(line);

    if (match) {
      const [, taskId, startLine, startChar, endLine, endChar, comment] = match;
      const task = this.assignmentsApiService.findTask(assignment.tasks, taskId);
      if (!task) {
        return [];
      }

      const min = Math.min(task.points, 0);
      const max = Math.max(task.points, 0);
      const data: SubmitData = {
        type: 'submit',
        uri,
        currentLine: range.start.line,
        solution: solution._id,
        evaluation: {
          task: taskId,
          points: min,
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
          title: `✅ Submit Feedback (${max}P)`,
          data: {
            ...data,
            evaluation: {
              ...data.evaluation,
              points: max,
            },
          },
        },
        {
          title: `⛔️ Submit Feedback (${min}P)`,
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

    // TODO: It's better to fetch the overlapping evaluations/snippets ourselves
    //       because the diagnostics may not be up-to-date
    const diagnostics = params.context.diagnostics.filter(d => d.data);
    if (diagnostics.length) {
      return diagnostics.map(d => {
        return {
          title: 'Delete Snippet',
          data: {
            type: 'delete',
            uri,
            ...(d.data as any),
          },
        };
      })
    }

    const actions: CodeAction[] = [];
    this.addActions(assignment.tasks, uri, range, 0, actions);
    return actions;
  }

  private addActions(tasks: Task[], uri: string, range: Range, depth: number, actions: CodeAction[]): void {
    for (const task of tasks) {
      actions.push(this.createAction(task, uri, range, depth));
      this.addActions(task.children, uri, range, depth + 1, actions);
    }
  }

  private createAction(task: Task, uri: string, range: Range, depth: number): CodeAction {
    return {
      title: `${depth ? '- ' + '\t'.repeat(depth) : 'Feedback:'} ${task.description} (${task.points}P)`,
      data: {
        type: 'prepare',
        task: task._id,
        uri,
        range,
      } as PrepareData,
    };
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
      case 'delete':
        return this.resolveDeleteAction(params);
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

    const {solution, snippet: snippetBase, evaluation: evaluationBase} = params.data as SubmitData;
    const config = await this.configService.getDocumentConfig(uri);
    const document = this.documentService.documents.get(uri);
    const snippet: Snippet = {
      ...snippetBase,
      code: document?.getText({
        // line numbers need to be shifted by one because the 'Feedback:' line is still there
        start: {line: snippetBase.from.line + 1, character: snippetBase.from.character},
        end: {line: snippetBase.to.line + 1, character: snippetBase.to.character},
      }) ?? '',
    };

    const existing = await this.assignmentsApiService.getEvaluations(config, solution, {
      task: evaluationBase.task,
    });
    if (existing.length) {
      const first = existing[0];
      await this.assignmentsApiService.updateEvaluation(config, solution, first._id, {
        ...first,
        ...evaluationBase,
        snippets: [...first.snippets, snippet],
      });
    } else {
      await this.assignmentsApiService.createEvaluation(config, solution, {
        ...evaluationBase,
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

  private async resolveDeleteAction(action: CodeAction): Promise<CodeAction> {
    const {uri, solution, evaluation, snippet} = action.data as DeleteData;
    const config = await this.configService.getDocumentConfig(uri);
    const existing = await this.assignmentsApiService.getEvaluation(config, solution, evaluation);
    existing.snippets.splice(snippet, 1);
    await this.assignmentsApiService.updateEvaluation(config, solution, evaluation, {
      snippets: existing.snippets,
    });
    return action;
  }
}

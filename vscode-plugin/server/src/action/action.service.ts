import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {CodeAction, CodeActionParams} from 'vscode-languageserver';
import {Snippet} from '../assignments-api/annotation';
import {AssignmentsApiService} from '../assignments-api/assignments-api.service';
import {ConfigService} from '../config/config.service';
import {ConnectionService} from '../connection/connection.service';
import {DocumentService} from '../document/document.service';

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
    const solution = await this.assignmentsApiService.getSolution(config, github);

    return assignment.tasks.map((task): CodeAction => ({
      title: `Feedback: ${task.description}`,
      data: {
        uri,
        file,
        task,
        range: params.range,
        solution: solution._id,
      },
    }));
  }

  private async resolveAction(params: CodeAction): Promise<CodeAction> {
    const {task, uri, solution, file, range} = params.data as any;
    const config = await this.configService.getDocumentConfig(uri);
    const document = this.documentService.documents.get(uri);
    const snippet: Snippet = {
      file,
      from: range.start,
      to: range.end,
      code: document?.getText(range) ?? '',
      comment: '',
    };

    const existing = await this.assignmentsApiService.getAnnotations(config, solution, {remark: task.description});
    if (existing.length) {
      const first = existing[0];
      await this.assignmentsApiService.updateAnnotation(config, solution, first._id, {
        ...first,
        snippets: [...first.snippets, snippet],
      });
    } else {
      await this.assignmentsApiService.createAnnotation(config, solution, {
        author: '',
        remark: task.description,
        points: task.points,
        snippets: [snippet],
      });
    }
    return params;
  }
}

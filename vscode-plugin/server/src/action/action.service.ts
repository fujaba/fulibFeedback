import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {CodeAction, CodeActionParams} from 'vscode-languageserver';
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
    const {github, file} = await this.assignmentsApiService.getFileAndGithub(config, uri);
    const solution = await this.assignmentsApiService.getSolution(config, github);
    const action: CodeAction = {
      title: 'Feedback',
      data: {
        uri,
        file,
        range: params.range,
        solution: solution._id,
      },
    };
    return [action];
  }

  private async resolveAction(params: CodeAction): Promise<CodeAction> {
    const {uri, solution, file, range} = params.data as any;
    const config = await this.configService.getDocumentConfig(uri);
    const document = this.documentService.documents.get(uri);
    await this.assignmentsApiService.createAnnotation(config, solution, {
      author: '',
      remark: '',
      points: 0,
      snippets: [{
        file,
        from: range.start,
        to: range.end,
        code: document?.getText(range) ?? '',
        comment: '',
      }],
    });
    return params;
  }
}

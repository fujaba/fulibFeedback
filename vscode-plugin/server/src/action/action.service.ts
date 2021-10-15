import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {firstValueFrom} from 'rxjs';
import {CodeAction, CodeActionParams} from 'vscode-languageserver';
import {Config} from '../config/config';
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
  ) {
    this.connectionService.connection.onCodeAction((params) => this.provideActions(params));
    this.connectionService.connection.onCodeActionResolve(params => this.resolveAction(params));
  }

  private async provideActions(params: CodeActionParams): Promise<CodeAction[]> {
    const uri = params.textDocument.uri;
    const config = await this.configService.getDocumentConfig(uri);
    const assignment = await this.getAssignment(config);
    const prefix = assignment.classroom.prefix;
    const prefixIndex = uri.indexOf(prefix);
    const slashIndex = uri.indexOf('/', prefixIndex + prefix.length);
    const studentGithub = uri.substring(prefixIndex + prefix.length + 1, slashIndex);
    const file = uri.substring(slashIndex + 1);
    const solution = await this.getSolution(config, studentGithub);
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

  private async getAssignment(config: Config) {
    const {data: assignment} = await firstValueFrom(this.httpService.get(`${config.apiServer}/api/v1/assignments/${config.assignment.id}`, {
      headers: {
        'Assignment-Token': config.assignment.token,
      },
    }));
    return assignment;
  }

  private async getSolution(config: Config, github: string) {
    const {data: solutions} = await firstValueFrom(this.httpService.get(`${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions`, {
      params: {
        'author.github': github,
      },
      headers: {
        'Assignment-Token': config.assignment.token,
      },
    }));
    return solutions[0];
  }

  private async resolveAction(params: CodeAction): Promise<CodeAction> {
    const {uri, solution, file, range} = params.data as any;
    const config = await this.configService.getDocumentConfig(uri);
    const document = this.documentService.documents.get(uri);
    const body = {
      author: '',
      remark: '',
      points: 0,
      snippets: [{
        file,
        from: range.start,
        to: range.end,
        code: document?.getText(range),
        comment: '',
      }],
    };
    this.httpService.post(`${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions/${solution}/annotations`, body, {
      headers: {
        'Assignment-Token': config.assignment.token,
      },
    }).subscribe();
    return params;
  }
}

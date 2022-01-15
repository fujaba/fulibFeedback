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
    private assignmentsApiService: AssignmentsApiService,
  ) {
    this.connectionService.connection.onCodeAction((params) => this.provideActions(params));
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

    const {assignment, solution, file} = await this.assignmentsApiService.getContext(config, uri);
    if (!assignment || !solution || !file) {
      return [];
    }
    const range = params.range;

    await this.assignmentsApiService.setSelection(config, solution._id, {
      author: config.user.name,
      snippet: {
        file,
        comment: '(fulibFeedback Selection)',
        from: range.start,
        to: range.end,
        code: document.getText(range),
      },
    });
    return [];
  }
}

import {Injectable} from '@nestjs/common';
import {CodeAction, CodeActionParams} from 'vscode-languageserver';
import {Range} from 'vscode-languageserver-textdocument';
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
    this.updateSelection(params.textDocument.uri, params.range);
    return [];
  }

  private async updateSelection(uri: string, range: Range): Promise<void> {
    if (range.start.line === range.end.line && range.start.character === range.end.character) {
      // simple cursor, no selection
      return;
    }

    const document = this.documentService.documents.get(uri);
    if (!document) {
      return;
    }

    const code = document.getText(range);
    if (!code.trim()) {
      // whitespace-only selection, ignore
      return;
    }

    const config = await this.configService.getDocumentConfig(uri);
    if (!config.assignment.token) {
      return;
    }

    const {assignment, solution, file} = await this.assignmentsApiService.getContext(config, uri);
    if (!assignment || !solution || !file) {
      return;
    }

    this.assignmentsApiService.setSelection(config, solution._id, {
      author: config.user.name,
      snippet: {
        file,
        comment: '(fulibFeedback Selection)',
        from: range.start,
        to: range.end,
        code,
      },
    }).catch(err => console.warn('Selection Error:', err.message));
  }
}

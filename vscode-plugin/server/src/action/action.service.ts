import { Injectable } from '@nestjs/common';
import {CodeAction, CodeActionParams} from 'vscode-languageserver';
import {ConnectionService} from '../connection/connection.service';

@Injectable()
export class ActionService {
  constructor(
    private connectionService: ConnectionService,
  ) {
    this.connectionService.connection.onCodeAction(params => this.provideActions(params));
    this.connectionService.connection.onCodeActionResolve(params => this.resolveAction(params));
  }

  private provideActions(params: CodeActionParams): CodeAction[] {
    const action: CodeAction = {
      title: 'fulibFeedback',
    }
    return [action];
  }

  private resolveAction(params: CodeAction): CodeAction {
    return params;
  }
}

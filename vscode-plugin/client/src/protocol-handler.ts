import * as querystring from 'querystring';
import * as vscode from 'vscode';
import {ConfigurationTarget, Disposable, Uri, UriHandler, window} from 'vscode';

export class FeedbackProtocolHandler implements UriHandler, Disposable {
  private disposables: Disposable[] = [];

  constructor() {
    this.disposables.push(window.registerUriHandler(this));
  }

  handleUri(uri: Uri): void {
    switch (uri.path) {
      case '/configure':
        this.configure(uri);
    }
  }

  private configure(uri: Uri): void {
    const data = querystring.parse(uri.query);
    const {assignment, solution, token, api_server} = data;
    const config = vscode.workspace.getConfiguration('fulibFeedback');
    let changed: string[] = [];
    if (api_server) {
      config.update('apiServer', api_server, ConfigurationTarget.Global);
      changed.push('API Server: ' + api_server);
    }
    if (assignment) {
      config.update('assignment.id', assignment, ConfigurationTarget.Global);
      changed.push('Assignment ID: ' + assignment);
      if (token) {
        config.update('assignment.token', token, ConfigurationTarget.Global);
        changed.push('Assignment Token: ' + token);
      }
    }
    if (solution) {
      config.update('solution.id', solution, ConfigurationTarget.Workspace);
      changed.push('Solution ID: ' + solution);
      if (token) {
        config.update('solution.token', token, ConfigurationTarget.Workspace);
        changed.push('Solution Token: ' + token);
      }
    }
    if (changed.length) {
      vscode.window.showInformationMessage('fulibFeedback configured:\n' + changed.join('\n'));
    }
  }

  dispose(): void {
    for (let disposable of this.disposables) {
      disposable.dispose();
    }
    this.disposables = [];
  }
}

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
        break;
      case '/open':
        this.open(uri);
        break;
    }
  }

  private configure(uri: Uri): void {
    const data = querystring.parse(uri.query);
    const {assignment, solution, token, api_server} = data;
    const config = vscode.workspace.getConfiguration('fulibFeedback');
    const target = solution ? ConfigurationTarget.Workspace : ConfigurationTarget.Global;
    let changed: string[] = [];
    if (api_server) {
      config.update('apiServer', api_server, target);
      changed.push('API Server: ' + api_server);
    }
    if (assignment) {
      config.update('assignment.id', assignment, target);
      changed.push('Assignment ID: ' + assignment);
    }
    if (solution) {
      config.update('solution.id', solution, target);
      changed.push('Solution ID: ' + solution);
    }
    if (token) {
      if (solution) {
        config.update('solution.token', token, target);
        changed.push('Solution Token: ' + token);
      } else {
        config.update('assignment.token', token, target);
        changed.push('Assignment Token: ' + token);
      }
    }
    if (changed.length) {
      vscode.window.showInformationMessage('fulibFeedback configured:\n' + changed.join('\n'));
    }
  }

  private open(uri: Uri) {
    const {file, line, endline} = querystring.parse(uri.query);
    // open file relative to workspace root
    const fileUri = Uri.file(vscode.workspace.workspaceFolders[0].uri.fsPath + '/' + file);
    vscode.window.showTextDocument(fileUri, {
      selection: new vscode.Range(
        Number(line),
        0,
        Number(endline),
        0,
      ),
    });
  }

  dispose(): void {
    for (let disposable of this.disposables) {
      disposable.dispose();
    }
    this.disposables = [];
  }
}

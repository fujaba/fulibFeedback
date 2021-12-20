import * as path from 'path';
import {ExtensionContext, ExtensionMode} from 'vscode';
import {LanguageClient, LanguageClientOptions, ServerOptions, TransportKind} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const module = context.asAbsolutePath(
    path.join('server', context.extensionMode === ExtensionMode.Development ? 'out' : 'dist', 'main.js'),
  );
  const transport = TransportKind.ipc;
  const serverOptions: ServerOptions = {
    run: {
      module,
      transport,
    },
    debug: {
      module,
      transport,
      options: {execArgv: ['--nolazy', '--inspect=6009']},
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      {scheme: 'file'},
    ],
    synchronize: {
      configurationSection: 'fulibFeedback',
    },
  };

  client = new LanguageClient(
    'fulibFeedback',
    'fulibFeedback',
    serverOptions,
    clientOptions,
  );

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

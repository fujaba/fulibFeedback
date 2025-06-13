import {ExtensionContext, ExtensionMode} from 'vscode';
import {LanguageClient, LanguageClientOptions, ServerOptions, TransportKind} from 'vscode-languageclient/node';
import {FeedbackProtocolHandler} from './protocol-handler';

let client: LanguageClient;
let protocolHandler: FeedbackProtocolHandler;

export function activate(context: ExtensionContext) {
  protocolHandler = new FeedbackProtocolHandler();

  const devMode = context.extensionMode === ExtensionMode.Development;
  const module = context.asAbsolutePath(devMode
    ? '../language-server/main.js'
    : './server.js',
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
  protocolHandler.dispose();
  if (!client) {
    return undefined;
  }
  return client.stop();
}

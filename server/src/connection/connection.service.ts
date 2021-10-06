import {Injectable, OnModuleInit} from '@nestjs/common';
import {
  _Connection,
  createConnection,
  DidChangeConfigurationNotification,
  InitializeParams,
  InitializeResult,
  ProposedFeatures,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node';

@Injectable()
export class ConnectionService implements OnModuleInit {
  connection!: _Connection;
  hasConfigurationCapability!: boolean;
  hasWorkspaceFolderCapability!: boolean;
  hasDiagnosticRelatedInformationCapability!: boolean;

  async onModuleInit() {
    this.connection = createConnection(ProposedFeatures.all);
    this.connection.onInitialize((params: InitializeParams) => {
      const capabilities = params.capabilities;

      this.hasConfigurationCapability = !!capabilities.workspace?.configuration;
      this.hasWorkspaceFolderCapability = !!capabilities.workspace?.workspaceFolders;
      this.hasDiagnosticRelatedInformationCapability = !!capabilities.textDocument?.publishDiagnostics?.relatedInformation;

      const result: InitializeResult = {
        capabilities: {
          textDocumentSync: TextDocumentSyncKind.Incremental,
          // Tell the client that this server supports code completion.
          completionProvider: {
            resolveProvider: true,
          },
        },
      };
      if (this.hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
          workspaceFolders: {
            supported: true,
          },
        };
      }
      return result;
    });
    this.connection.onInitialized(() => {
      if (this.hasConfigurationCapability) {
        this.connection.client.register(DidChangeConfigurationNotification.type, undefined);
      }
    });
  }
}

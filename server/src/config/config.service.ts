import {Injectable, OnModuleInit} from '@nestjs/common';
import {ConnectionService} from '../connection/connection.service';
import {DocumentService} from '../document/document.service';
import {Config} from './config';

export const DEFAULT_SETTINGS: Config = {
  maxNumberOfProblems: 1000,
};

@Injectable()
export class ConfigService implements OnModuleInit {
  globalSettings: Config = DEFAULT_SETTINGS;
  documentConfigs: Map<string, Thenable<Config>> = new Map();

  constructor(
    private documentService: DocumentService,
    private connectionService: ConnectionService,
  ) {
  }

  async onModuleInit() {
    this.connectionService.connection.onDidChangeConfiguration(change => {
      if (this.connectionService.hasConfigurationCapability) {
        this.documentConfigs.clear();
      } else {
        this.globalSettings = change.settings.languageServerExample as Config || DEFAULT_SETTINGS;
      }
    });

    this.documentService.documents.onDidClose(e => {
      this.documentConfigs.delete(e.document.uri);
    });
  }

  getDocumentConfig(resource: string): Thenable<Config> {
    if (!this.connectionService.hasConfigurationCapability) {
      return Promise.resolve(DEFAULT_SETTINGS);
    }
    let result = this.documentConfigs.get(resource);
    if (!result) {
      result = this.connectionService.connection.workspace.getConfiguration({
        scopeUri: resource,
        section: 'fulibFeedback',
      });
      this.documentConfigs.set(resource, result);
    }
    return result;
  }
}

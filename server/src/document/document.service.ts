import {Injectable, OnModuleInit} from '@nestjs/common';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {TextDocuments} from 'vscode-languageserver/node';
import {ConnectionService} from '../connection/connection.service';

@Injectable()
export class DocumentService implements OnModuleInit {
  documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

  constructor(
    private connectionService: ConnectionService,
  ) {
  }

  onModuleInit() {
    this.documents.listen(this.connectionService.connection);
  }
}

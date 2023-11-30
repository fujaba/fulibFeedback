import {TextDocument} from 'vscode-languageserver-textdocument';
import {TextDocuments} from 'vscode-languageserver/node';
import {ConnectionService} from '../connection/connection.service';

export class DocumentService {
  documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

  constructor(
    private connectionService: ConnectionService,
  ) {
    this.documents.listen(this.connectionService.connection);
  }
}

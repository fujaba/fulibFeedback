import {ConnectionService} from './connection/connection.service';
import {createConnection, ProposedFeatures} from "vscode-languageserver/node";
import {ActionService} from "./action/action.service";
import {ConfigService} from "./config/config.service";
import {DocumentService} from "./document/document.service";
import {AssignmentsApiService} from "./assignments-api/assignments-api.service";
import {ValidationService} from "./validation/validation.service";

async function bootstrap() {
  const connection = createConnection(ProposedFeatures.all);
  const connectionService = new ConnectionService(connection);
  const documentService = new DocumentService(connectionService);
  const configService = new ConfigService(documentService, connectionService);
  const assignmentsApiService = new AssignmentsApiService();
  new ActionService(connectionService, configService, documentService, assignmentsApiService);
  new ValidationService(connectionService, documentService, configService, assignmentsApiService);
  connectionService.connection.listen();
}

bootstrap();

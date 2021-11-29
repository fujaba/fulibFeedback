import {HttpModule} from '@nestjs/axios';
import {Module} from '@nestjs/common';
import {ConfigService} from './config/config.service';
import {ConnectionService} from './connection/connection.service';
import {DocumentService} from './document/document.service';
import {ValidationService} from './validation/validation.service';
import { ActionService } from './action/action.service';
import { AssignmentsApiService } from './assignments-api/assignments-api.service';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [],
  providers: [
    ConnectionService,
    ConfigService,
    DocumentService,
    ValidationService,
    ActionService,
    AssignmentsApiService,
  ],
})
export class AppModule {
}

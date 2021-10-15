import {Module} from '@nestjs/common';
import {ConfigService} from './config/config.service';
import {ConnectionService} from './connection/connection.service';
import {DocumentService} from './document/document.service';
import {ValidationService} from './validation/validation.service';
import { ActionService } from './action/action.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    ConnectionService,
    ConfigService,
    DocumentService,
    ValidationService,
    ActionService,
  ],
})
export class AppModule {
}

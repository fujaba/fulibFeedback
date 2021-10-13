import {Module} from '@nestjs/common';
import {ConfigService} from './config/config.service';
import {ConnectionService} from './connection/connection.service';
import {DocumentService} from './document/document.service';
import {ValidationService} from './validation/validation.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    ConnectionService,
    ConfigService,
    DocumentService,
    ValidationService,
  ],
})
export class AppModule {
}

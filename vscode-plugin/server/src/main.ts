import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ConnectionService} from './connection/connection.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const connectionService = app.get(ConnectionService);
  connectionService.connection.listen();
}

bootstrap();

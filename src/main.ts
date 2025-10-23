import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as config from 'config';

async function bootstrap() {
  const serverConfig = require('config').get('server')  as { port: number };
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
    logger.log('CORS enabled for development');
  }

  const port = process.env.PORT || serverConfig.port;
  await app.listen(port);
  logger.log(`Application is running on port: ${port}`);
}
bootstrap();


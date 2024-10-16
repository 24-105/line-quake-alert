import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { HttpExceptionFilter } from './application/filters/httpExceptionFilter';

/**
 * NestJS application bootstrap
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  await app.listen(3000);
}
bootstrap();

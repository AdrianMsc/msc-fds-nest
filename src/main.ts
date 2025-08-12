import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const start = Date.now();
  console.log(
    `[Bootstrap] Starting Nest app… NODE_ENV=${process.env.NODE_ENV ?? 'undefined'}`,
  );
  await app.listen(port);
  const listenMs = Date.now() - start;
  try {
    // getUrl is available after listen in Nest; fallback to port if unavailable
    const url = (app as any).getUrl ? await (app as any).getUrl() : `http://localhost:${port}`;
    console.log(`[Bootstrap] App listening on ${url} (port ${port}) in ${listenMs}ms`);
  } catch (e) {
    console.log(`[Bootstrap] App started on port ${port} in ${listenMs}ms`);
  }
}
bootstrap();

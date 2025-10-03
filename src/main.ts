import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👉 Aquí activas validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,   // elimina campos no definidos en DTOs
      forbidNonWhitelisted: false, // si quieres que lance error, pon true
      transform: true,   // convierte tipos (string → number, date, etc.)
    }),
  );

  app.setGlobalPrefix('api'); // <<—— agrega el prefijo /api

  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT || 8090, '0.0.0.0');
}
bootstrap();

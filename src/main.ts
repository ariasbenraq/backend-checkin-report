import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 👇 Permite CORS en dev y prod, pero restringiendo orígenes
  const ALLOWED_ORIGINS = [
    'http://localhost:5173',   // Vite local
    'http://127.0.0.1:5173',
    'https://checkin-report.vercel.app/',
    // 'https://tu-front.vercel.app',
  ];

  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);                         // curl/Postman
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,                  // ponlo en false si no usas cookies
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  logger.log('CORS enabled');

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port, '0.0.0.0');    // importante para Render y para evitar bind solo a localhost
  logger.log(`Application is running on port: ${port}`);
}
bootstrap();

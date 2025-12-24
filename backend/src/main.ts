import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for admin panel
  app.enableCors({
    origin: true, // Allow all origins for development
    credentials: true,
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import * as process from 'process';

async function bootstrap() {
  process.on('uncaughtExceptionMonitor', (err, org) => {
    // your custom logic to deal with uncaughtException information...
  });

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {},
    },
  );
  app.listen();
}
bootstrap();

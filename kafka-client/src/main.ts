import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';

async function bootstrap() {
  process.on('uncaughtExceptionMonitor', (err, origin) => {
    // your custom logic to deal with uncaughtException information...
  });

  const app = await NestFactory.create(AppModule);
  // module에서 'KAFKA'라고 토큰 이름을 붙였으니 bootstrap에서 직접 객체에 접근해서 조정하고 싶다면 app.get('KAFKA')로 접근하면 됩니다.
  await app.listen(3000);
}
bootstrap();

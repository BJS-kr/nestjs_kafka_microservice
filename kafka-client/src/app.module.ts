import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import dependencyChain, { clientModule } from './providers';

@Module({
  imports: [clientModule],
  controllers: [AppController],
  providers: [...dependencyChain],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { mongooseProvider, testSchemaProvider } from './providers';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [mongooseProvider, testSchemaProvider],
})
export class AppModule {}

import { Controller, Inject } from '@nestjs/common';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { Model } from 'mongoose';
import { testSchema } from './models/metric';

@Controller()
export class AppController {
  constructor(
    @Inject('METRICS')
    private readonly metrics: Model<typeof testSchema>,
  ) {}

  @MessagePattern('TXT_ELAPSED')
  async kafkaEventHandler(@Payload() message: any, @Ctx() ctx: KafkaContext) {
    const MESSAGE = ctx.getMessage();
    this.metrics.create(MESSAGE.value);
    console.log((await this.metrics.find()).length);
  }

  @MessagePattern('FIRST_TOPIC')
  async kafkaEventHandler2(@Payload() message: any, @Ctx() ctx: KafkaContext) {
    const MESSAGE = ctx.getMessage();
    this.metrics.create(MESSAGE.value);
    console.log((await this.metrics.find()).length);
  }

  // 클라이언트의 클로저 함수가 잘 분리되서 작동하는지 검증하기 위한 두 번째 이벤트
  @MessagePattern('SECOND_TOPIC')
  async kafkaEventHandler3(@Payload() message: any, @Ctx() ctx: KafkaContext) {
    const MESSAGE = ctx.getMessage();
    this.metrics.create(MESSAGE.value);
    console.log((await this.metrics.find()).length);
  }
}

import { Kafka } from 'kafkajs';
import { kafkaBatchSend } from './providers';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { KafkaBatchSender } from './kafkaSender';
import { kafkaEventDecoratorFactory } from './factory';

// dependency injection으로 controller에서 사용하지 않습니다.
// this가 method decorator로써 사용될 경우 this는 possibly undefined이기 때문입니다.
// 그러므로 KafkaBatchSender와 Kafka를 instantiate해 데코레이터에 직접 주입합니다.
const kafkaBatchSender = new KafkaBatchSender(
  new Kafka({
    clientId: 'testClient',
    brokers: ['localhost:9092'],
  }).producer(),
).on(kafkaBatchSend,() => kafkaBatchSender.sendBatch());

export const KafkaFirstTopic = kafkaEventDecoratorFactory(
  'FIRST_TOPIC',
  kafkaBatchSender,
  kafkaBatchSend,
);

export const Text = createParamDecorator(
  (data: unknown, ctx: ExecutionContext):string => {
    return ctx.switchToHttp().getRequest().body.text;
  },
);

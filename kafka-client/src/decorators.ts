import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { kafkaBatchSender } from './kafkaSender';
import { kafkaEventDecoratorFactory } from './factory';
import { KafkaTopics } from './topics';
import { getTextLengthAndElapsed } from './specifiers';
import { kafkaEvents } from './events';

// dependency injection으로 controller에서 사용하지 않습니다.
// this가 method decorator로써 사용될 경우 this는 possibly undefined이기 때문입니다.
// 그러므로 KafkaBatchSender와 Kafka를 instantiate해 데코레이터에 직접 주입합니다.
export const FirstTopicDecorator = kafkaEventDecoratorFactory(
  KafkaTopics.textAndElapsed,
  kafkaBatchSender,
  kafkaEvents.batchSend,
  getTextLengthAndElapsed
);

export const Text = createParamDecorator(
  (data: unknown, ctx: ExecutionContext):string => {
    return ctx.switchToHttp().getRequest().body.text;
  },
);

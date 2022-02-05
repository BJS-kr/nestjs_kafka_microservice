import { Controller, Inject, Post } from '@nestjs/common';
import { eventReceiverFactory } from './factory';
import { Text, KafkaFirstTopic } from './decorators';
@Controller()
export class AppController {
  constructor(
    @Inject('FIRST_TOPIC_RECEIVER')
    private readonly firstTopicReceiver: ReturnType<
      typeof eventReceiverFactory
    >,

    @Inject('SECOND_TOPIC_RECEIVER')
    private readonly secondTopicReceiver: ReturnType<
      typeof eventReceiverFactory
    >,
  ) {}

  @Post('FIRST_TOPIC_DECORATED')
  @KafkaFirstTopic()
  async someAsynchronousHandler_1(@Text() text) {
    // some async task....
    await new Promise((res) => {
      setTimeout(() => res(text), 500);
    });
  }

  @Post('FIRST_TOPIC')
  @KafkaFirstTopic()
  async someAsynchronousHandler_2(@Text() text) {
    const endTimeReceiver = this.firstTopicReceiver(text.length, Date.now());

    // some async task....
    await new Promise((res) => {
      setTimeout(() => res(text), 600);
    });

    endTimeReceiver(Date.now());
  }

  @Post('SECOND_TOPIC')
  async someAsynchronousHandler_3(@Text() text) {
    const endTimeReceiver = this.secondTopicReceiver(text.length, Date.now());

    // some async task...
    await new Promise((res) => {
      setTimeout(() => res(text), 700);
    });

    endTimeReceiver(Date.now());
  }
}

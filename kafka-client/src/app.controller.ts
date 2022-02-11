import { Controller, Inject, Post } from '@nestjs/common';
import { eventReceiverFactory } from './factory';
import { Text, FirstTopicDecorator } from './decorators';
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

  // 사용해보고 나니 가장 깔끔한 방법은 데코레이터 사용
  @Post('FIRST_TOPIC_DECORATED')
  @FirstTopicDecorator()
  async someAsynchronousHandler_1(@Text() text) {
    // some async task....
    await new Promise((res) => {
      setTimeout(() => res(text), 500);
    });
  }

  @Post('FIRST_TOPIC')
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

import { Controller, Get, Inject } from '@nestjs/common';
import { eventReceiverFactory } from './factory';

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

  @Get('FIRST_TOPIC')
  async someAsynchronousHandler_1() {
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    const endTimeReceiver = this.firstTopicReceiver(text.length, Date.now());

    // some async task....
    await new Promise((res) => {
      setTimeout(() => res('done!'), 500);
    });

    endTimeReceiver(Date.now());
  }

  @Get('SECOND_TOPIC')
  async someAsynchronousHandler_2() {
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    const endTimeReceiver = this.secondTopicReceiver(text.length, Date.now());

    // some async task... which takes long time...
    await new Promise((res) => {
      setTimeout(() => res('done!'), 1000);
    });

    endTimeReceiver(Date.now());
  }
}

import { Controller, Get, Inject } from '@nestjs/common';
import { dataGatherer } from './functions';

@Controller()
export class AppController {
  constructor(
    @Inject('FIRST_EVENT_RECEIVER')
    private readonly firstEventReceiver: ReturnType<typeof dataGatherer>,

    @Inject('SECOND_EVENT_RECEIVER')
    private readonly secondEventReceiver: ReturnType<typeof dataGatherer>,
  ) {}

  @Get('EVENT_NAME_FIRST')
  async someAsyncronousHandler_1() {
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    const endTimeReceiver = this.firstEventReceiver(text.length, Date.now());

    // some async task....
    await new Promise((res) => {
      setTimeout(() => res('done!'), 500);
    });

    endTimeReceiver(Date.now());
  }

  @Get('EVENT_NAME_SECOND')
  async someAsyncronousHandler_2() {
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    const endTimeReceiver = this.secondEventReceiver(text.length, Date.now());

    // some async task... which takes long time...
    await new Promise((res) => {
      setTimeout(() => res('done!'), 1000);
    });

    endTimeReceiver(Date.now());
  }
}

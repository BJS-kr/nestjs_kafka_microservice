import { ClientKafka, ClientsModule, Transport } from '@nestjs/microservices';
import { Producer } from 'kafkajs';
import { eventReceiverFactory } from './factory';
import { KafkaSender } from './kafkaSender';

// KafkaSender의 sendBatch event를 등록 및 발생 시키기 위한 event name 정의
const kafkaSend = Symbol.for('KAFKA_SEND');

export const clientModule = ClientsModule.register([
  {
    name: 'KAFKA',
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'Client',
        brokers: ['localhost:9092'],
      },
    },
  },
]);

const producer = {
  provide: 'PRODUCER',
  useFactory: async (clientKafka: ClientKafka): Promise<Producer> => {
    return await clientKafka.connect();
  },
  inject: ['KAFKA'],
};

const kafkaSender = {
  provide: 'KAFKA_SENDER',
  useFactory: (producer: Producer) => {
    const kafkaSender = new KafkaSender(producer);
    // event 등록. KafkaSender가 EventEmitter를 extends해 작성한 class이기 때문에 가능
    kafkaSender.on(kafkaSend, () => kafkaSender.sendBatch());

    return kafkaSender;
  },
  inject: ['PRODUCER'],
};

const firstEventReceiver = {
  provide: 'FIRST_TOPIC_RECEIVER',
  useFactory: (kafkaSender: KafkaSender) => {
    return eventReceiverFactory('FIRST_TOPIC', kafkaSender, kafkaSend);
  },
  inject: ['KAFKA_SENDER'],
};

const secondEventReceiver = {
  provide: 'SECOND_TOPIC_RECEIVER',
  useFactory: (kafkaSender: KafkaSender) => {
    return eventReceiverFactory('SECOND_TOPIC', kafkaSender, kafkaSend);
  },
  inject: ['KAFKA_SENDER'],
};

export default [producer, kafkaSender, firstEventReceiver, secondEventReceiver];

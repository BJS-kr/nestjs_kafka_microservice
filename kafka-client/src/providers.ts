import { ClientKafka, ClientsModule, Transport } from '@nestjs/microservices';
import { Producer } from 'kafkajs';
import { kafkaEvents } from './events';
import { eventReceiverFactory } from './factory';
import { KafkaBatchSender } from './kafkaSender';

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

const kafkaBatchSender = {
  provide: 'KAFKA_BATCH_SENDER',
  useFactory: (producer: Producer) => {
    const kafkaBatchSender = new KafkaBatchSender(producer);
    // event 등록. KafkaSender가 EventEmitter를 extends해 작성한 class이기 때문에 가능
    kafkaBatchSender.on(kafkaEvents.batchSend, () =>
      kafkaBatchSender.sendBatch(),
    );

    return kafkaBatchSender;
  },
  inject: ['PRODUCER'],
};

const firstEventReceiver = {
  provide: 'FIRST_TOPIC_RECEIVER',
  useFactory: (kafkaBatchSender: KafkaBatchSender) => {
    return eventReceiverFactory(
      'FIRST_TOPIC',
      kafkaBatchSender,
      kafkaEvents.batchSend,
    );
  },
  inject: ['KAFKA_BATCH_SENDER'],
};

const secondEventReceiver = {
  provide: 'SECOND_TOPIC_RECEIVER',
  useFactory: (kafkaBatchSender: KafkaBatchSender) => {
    return eventReceiverFactory(
      'SECOND_TOPIC',
      kafkaBatchSender,
      kafkaEvents.batchSend,
    );
  },
  inject: ['KAFKA_BATCH_SENDER'],
};

export default [
  producer,
  kafkaBatchSender,
  firstEventReceiver,
  secondEventReceiver,
];

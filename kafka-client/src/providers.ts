import { ClientKafka, ClientsModule, Transport } from '@nestjs/microservices';
import { Producer } from 'kafkajs';
import { eventReceiverFactory } from './functions';
import { KafkaSender } from './kafkaSender';

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
    return new KafkaSender(producer);
  },
  inject: ['PRODUCER'],
};

const firstEventReceiver = {
  provide: 'FIRST_EVENT_RECEIVER',
  useFactory: (kafkaSender: KafkaSender) => {
    return eventReceiverFactory('FIRST_EVENT', kafkaSender);
  },
  inject: ['KAFKA_SENDER'],
};

const secondEventReceiver = {
  provide: 'SECOND_EVENT_RECEIVER',
  useFactory: (kafkaSender: KafkaSender) => {
    return eventReceiverFactory('SECOND_EVENT', kafkaSender);
  },
  inject: ['KAFKA_SENDER'],
};

export default [producer, kafkaSender, firstEventReceiver, secondEventReceiver];

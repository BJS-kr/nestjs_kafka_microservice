import { Kafka } from 'kafkajs';

export const producer = new Kafka({
  clientId: 'testClient',
  brokers: ['localhost:9092'],
}).producer();

import { CompressionTypes, Producer, ProducerBatch } from 'kafkajs';

export class KafkaSender {
  constructor(private readonly producer: Producer) {}
  private batchForm: ProducerBatch = {
    compression: CompressionTypes.GZIP,
    topicMessages: [],
  };

  set topicMessages(messages) {
    this.batchForm.topicMessages.push(messages);
    this.sendBatch();
  }

  private sendBatch() {
    queueMicrotask(async () => {
      await this.producer.connect();
      await this.producer.sendBatch(this.batchForm);
      await this.producer.disconnect();
    });
    this.batchForm.topicMessages = [];
  }
}

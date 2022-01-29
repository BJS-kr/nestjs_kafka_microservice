import { CompressionTypes, Producer, ProducerBatch } from 'kafkajs';
import EventEmitter from 'events';

// eventReceiverFactory와 KafkaSender는 이벤트로 소통합니다.
// 이를 위해 events를 extends한 클래스로 작성합니다.
export class KafkaSender extends EventEmitter {
  constructor(private readonly producer: Producer) {
    super();
  }
  private batchForm: ProducerBatch = {
    compression: CompressionTypes.GZIP,
    topicMessages: [],
  };

  set topicMessages(messages) {
    this.batchForm.topicMessages.push(messages);
  }

  public sendBatch() {
    queueMicrotask(async () => {
      await this.producer.connect();
      await this.producer.sendBatch(this.batchForm);
      await this.producer.disconnect();
    });
    this.batchForm.topicMessages = [];
  }
}

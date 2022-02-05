import { CompressionTypes, Producer, ProducerBatch } from 'kafkajs';
import * as EventEmitter from 'events';

// eventReceiverFactory와 KafkaSender는 이벤트로 소통합니다.
// 이를 위해 events를 extends한 클래스로 작성합니다.
export class KafkaBatchSender extends EventEmitter {
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
    /**
     * @description
     * queueMicrotask를 사용한 이유
     * process.nextTick은 JS stack이 complete되고 event loop이 계속되기 직전에 실행됩니다.
     * queueMicrotask는 nextTick queue가 fully drained된 직 후 실행됩니다.
     * queueMicrotask는 nextTick보다 선호되어야 합니다(For most userland use cases, the queueMicrotask() API provides a portable and reliable mechanism for deferring execution that works across multiple JavaScript platform environments and should be favored over process.nextTick())
     *
     * 전체 설명은 공식문서를 참조해주세요
     * https://nodejs.org/dist/latest-v16.x/docs/api/process.html#when-to-use-queuemicrotask-vs-processnexttick
     * */

    // 이벤트 전송은 비즈니스 로직 진행에 영향을 주어선 안됩니다(에러의 발생 가능성 혹은 비즈니스 로직 수행 시간 등)
    // 즉, 이벤트 전송은 항상 현재의 event loop이 종료되는 시점(최후순위)에 이뤄져야합니다.
    queueMicrotask(async () => {
      await this.producer.connect();
      await this.producer.sendBatch(this.batchForm);
      await this.producer.disconnect();
      // topicMessages 초기화는 queueMicrotask callback내에서 실행되어야 합니다.
      // queueMicrotask는 항상 최후순위에 실행되기 때문에, topicMessages 초기화가 외부에서 이루어진다면 항상 빈 배열만 참조하게 됩니다.
      this.batchForm.topicMessages = [];
    });
  }
}

import {
  CompressionTypes,
  Producer,
  ProducerBatch,
  TopicMessages,
} from 'kafkajs';
import * as EventEmitter from 'events';
import { producer } from './producer';
import { kafkaEvents } from './events';

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

  // 토픽 메세지를 채워넣습니다
  set topicMessages(topicMessages: TopicMessages) {
    // batchForm 기본 값이 존재하므로 언제나 undefined가 아닙니다.
    this.batchForm.topicMessages
      ? this.batchForm.topicMessages.push(topicMessages)
      : // 이 부분은 사실상 실행될 일이 없습니다만, ProducerBatch에서 topicMessages가 optional이기 때문에 possibly undefined에러가 발생하므로 처리해주어야합니다.
        Object.defineProperty(this.batchForm, 'topicMessages', {
          writable: true,
          value: [],
        }) &&
        (this.batchForm.topicMessages as any as Array<TopicMessages>).push(
          topicMessages,
        );
  }

  public sendBatch() {
    // topicMessages의 길이가 10이라는 뜻은 데코레이터 팩토리에서 정의된 길이 10과는 다른 값입니다.
    // 데코레이터 팩토리에서 정의된 길이 10은 하나의 토픽에 메세지 10개가 적재되었음을 의미하고,
    // topicMessages의 길이가 10은 그 토픽과 10개의 메세지가 10개 적재되었음을 의미합니다.
    // 즉, topicMessages의 길이가 10이라면 토픽의 갯수 10개, 메세지의 갯수는 100개 입니다.
    if (
      this.batchForm.topicMessages &&
      this.batchForm.topicMessages.length >= 10
    ) {
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
}

export const kafkaBatchSender = new KafkaBatchSender(producer).on(
  kafkaEvents.batchSend,
  () => kafkaBatchSender.sendBatch(),
);

import { KafkaBatchSender } from './kafkaSender';

// 이중 클로저를 활용합니다. 시작시간과 완료시간을 재는 인자는 curring형식입니다.
// 이벤트 메세지큐 활용을 위한 topic과 sender instance를 클로저로 지니는 고차함수입니다.
// sender객체는 원하는 컨텍스트에 따라 다르게 구현해서 인자로 받을 수 있도록 의존성을 가지게 했습니다.
// 최상위에 messages 배열 클로저가 존재합니다. asynchronous handler의 처리 시간을 재기 위해
// 시작 시간과 문자열의 길이를 첫 번째 return의 클로저로 지니고, 완료시점을 두번째 리턴으로 가집니다.
// topic을 분리하고 정의해둔 kafkaSender setter를 활용하기 위해 이와 같은 형식을 사용했습니다.
export function eventReceiverFactory(
  topic: string,
  kafkaSender: KafkaBatchSender,
  kafkaSendEvent: symbol,
) {
  let messages = [];
  // curring 시작
  return function (textLength: number, startTime: number) {
    // asynchronous task가 완료된 시간
    return function (endTime: number) {
      // 클로저 messages에 push
      messages.push({
        value: JSON.stringify({
          textLength: textLength,
          responseTime: endTime - startTime,
        }),
      });

      if (messages.length >= 10) {
        // setter
        // message closure에 적재된 데이터를 kafkaSender instance에 set합니다.
        // 기존에는 setter가 sendBatch까지 call했으나, setter의 목적에 부합하게 사용하기 위하여 이벤트로 분리했습니다.
        kafkaSender.topicMessages = { topic, messages };
        // KafkaSender의 sendBatch를 call하기 위한 이벤트 발생
        kafkaSender.emit(kafkaSendEvent);
        // 클로저 초기화
        messages = [];
      }
    };
  };
}

// 위의 eventReceiverFactory은 비즈니스 로직에 eventReceiver가 자리를 차지해야한다는 점이 문제입니다.
// method parameter와 execution time을 알고 싶다면 데코레이터로 구현이 가능합니다.
// 비즈니스 로직이 외관상으로도 변경되지 않고 가독성이 향상된다는 것이 장점입니다.
export function kafkaEventDecoratorFactory(
  kafkaSender: KafkaBatchSender,
  kafkaSenderMethodEvent: symbol,
) {
  let messages = [];
  return function kafkaTopicDecorator(topic: string) {
    return function (
      target: any,
      prop: string,
      descriptor: PropertyDescriptor,
    ) {
      const preservedMethod = descriptor.value;

      descriptor.value = async function () {
        // eslint-disable-next-line prefer-rest-params
        const text: string = arguments[0];
        const [textLength, startTime] = [text?.length, Date.now()];
        const result = await preservedMethod();

        messages.push({
          value: JSON.stringify({
            textLength: textLength,
            responseTime: Date.now() - startTime,
          }),
        });

        if (messages.length >= 10) {
          kafkaSender.topicMessages = { topic, messages };
          kafkaSender.emit(kafkaSenderMethodEvent);
          messages = [];
        }

        return result;
      };
    };
  };
}

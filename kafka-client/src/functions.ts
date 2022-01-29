import { KafkaSender } from './kafkaSender';

// 이중 클로저를 활용합니다. 시작시간과 완료시간을 재는 인자는 curring형식입니다.
// 이벤트 메세지큐 활용을 위한 topic과 sender instance를 클로저로 지니는 고차함수입니다.
// sender객체는 원하는 컨텍스트에 따라 다르게 구현해서 인자로 받을 수 있도록 의존성을 가지게 했습니다.
// 최상위에 messages 배열 클로저가 존재합니다. asynchronous handler의 처리 시간을 재기 위해
// 시작 시간과 문자열의 길이를 첫 번째 return의 클로저로 지니고, 완료시점을 두번째 리턴으로 가집니다.
// topic을 분리하고 정의해둔 kafkaSender setter를 활용하기 위해 이와 같은 형식을 사용했습니다.
export function eventReceiverFactory(topic: string, kafkaSender: KafkaSender) {
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
        // kafkaSender는 kafka server(microservice)로 set된 데이터를 보냅니다.
        kafkaSender.topicMessages = { topic, messages };
        // 클로저 초기화
        messages = [];
      }
    };
  };
}

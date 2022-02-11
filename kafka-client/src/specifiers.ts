import { AppController } from './app.controller';

// Specifier는 데코레이터 팩토리에서 각 이벤트 수집별로 다를 수 밖에 없는 로직을 구현하기 위한 함수입니다.
// 이를 통해 중복된 코드를 없애고, 좀 더 직관적으로 팩토리의 구조를 이해할 수 있습니다.

// descriptor.value의 타입이 any이기 때문에 어쩔 수 없이 any로 지정해야합니다.
export async function getTextLengthAndElapsed(
  args: IArguments,
  methodToBeCollected: any,
) {
  const text = args[0];
  if (!(typeof text === 'string')) {
    throw new Error('first argument must be a string');
  }

  const startTime = Date.now();

  const preservedResult = await (
    methodToBeCollected as typeof AppController.prototype.someAsynchronousHandler_1
  )(text);

  const message = {
    value: JSON.stringify({
      textLength: text.length,
      duration: Date.now() - startTime,
    }),
  };

  return { preservedResult, message };
}

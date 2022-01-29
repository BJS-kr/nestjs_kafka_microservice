# Nest.js_Kafka_Microservice
practical examples of both client and server for building Kafka-microservice using Nest.js.
This full implementation can run in an instant, provided Docker already installed your machine.
After environment all be set, run 'npm i' and './starter' bash script on the root. 

# Core implementations
## What I've tried to solve
#### 1. How to collect data before and after asynchronous tasks done?
#### 2. How to inject topic-specific function as dependency?
#### 3. How to produce those functions effectively?
#### 4. How to encapsulate collected datas?
#### 5. How to make commuicate between data collecting function and Kafka sender object?

## Here's the architecture and code
![explained](https://user-images.githubusercontent.com/78771384/151597884-99cf4d8b-2d6f-4d52-b798-f595a9fb641e.png)

## Topic-specific closure func Factory
```typescript
export function eventReceiverFactory(
  topic: string,
  kafkaSender: KafkaSender,
  kafkaSendEvent: symbol,
) {
  let messages = [];

  return function (textLength: number, startTime: number) {
    return function (endTime: number) {
      messages.push({
        value: JSON.stringify({
          textLength: textLength,
          responseTime: endTime - startTime,
        }),
      });

      if (messages.length >= 10) {
        // use setter and emitter
        kafkaSender.topicMessages = { topic, messages };
        kafkaSender.emit(kafkaSendEvent);

        messages = [];
      }
    };
  };
}
```
## EventEmitter extdended Kafka sender
uses queueMicrotask function to execute send method
```typescript
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

      this.batchForm.topicMessages = [];
    });
  }
}
```

## Chaining dependencies by token to inject only end of the chain(produced func from factory)
```typescript
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
    const kafkaSender = new KafkaSender(producer);
    // register event
    kafkaSender.on(kafkaSend, () => kafkaSender.sendBatch());

    return kafkaSender;
  },
  inject: ['PRODUCER'],
};

const firstEventReceiver = {
  provide: 'FIRST_TOPIC_RECEIVER',
  useFactory: (kafkaSender: KafkaSender) => {
    return eventReceiverFactory('FIRST_TOPIC', kafkaSender, kafkaSend);
  },
  inject: ['KAFKA_SENDER'],
};

const secondEventReceiver = {
  provide: 'SECOND_TOPIC_RECEIVER',
  useFactory: (kafkaSender: KafkaSender) => {
    return eventReceiverFactory('SECOND_TOPIC', kafkaSender, kafkaSend);
  },
  inject: ['KAFKA_SENDER'],
};

export default [producer, kafkaSender, firstEventReceiver, secondEventReceiver];
```
exported default above will spread in module 'provides'...

## Then inject only produced functions..
```typescript
constructor(
    @Inject('FIRST_TOPIC_RECEIVER')
    private readonly firstTopicReceiver: ReturnType<typeof eventReceiverFactory>,

    @Inject('SECOND_TOPIC_RECEIVER')
    private readonly secondTopicReceiver: ReturnType<typeof eventReceiverFactory>,
  ) {}
```

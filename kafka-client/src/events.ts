// KafkaSender의 sendBatch event를 등록 및 발생 시키기 위한 event name 정의
export const kafkaEvents = { batchSend: Symbol.for('KAFKA_BATCH_SEND') };


// Create all topics used by the system (dev convenience)
const { Kafka } = require('kafkajs');

const topics = [
  'outbox.v1.events',
  'inventory.v1.commands.reserve','inventory.v1.commands.release',
  'inventory.v1.events.reserved','inventory.v1.events.released','inventory.v1.events.failed',
  'payment.v1.commands.authorize','payment.v1.commands.refund',
  'payment.v1.events.authorized','payment.v1.events.failed','payment.v1.events.refunded',
  'shipping.v1.commands.prepare',
  'shipping.v1.events.prepared','shipping.v1.events.failed',
  'order.v1.commands.confirm',
  'order.v1.events.confirmed','order.v1.events.failed',
];

(async () => {
  const brokers = process.env.KAFKA_BROKERS || 'kafka:9092';
  const kafka = new Kafka({ clientId: 'topics-init', brokers: brokers.split(',') });
  const admin = kafka.admin();
  await admin.connect();
  try {
    await admin.createTopics({
      topics: [...new Set(topics)].map(topic => ({ topic, numPartitions: 1, replicationFactor: 1 })),
      waitForLeaders: true,
    });
    console.log('Topics ensured');
  } catch (err) {
    console.error('createTopics error:', err.message);
  } finally {
    await admin.disconnect();
  }
})().catch(e => { console.error(e); process.exit(1); });

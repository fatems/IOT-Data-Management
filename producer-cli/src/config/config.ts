export default () => ({
  rabbitmq: {
    uri: process.env.RABBITMQ_URI || 'amqp://user:password@192.168.65.128:5672',
    exchange: 'panto_exchange',
    routingKey: 'xray_data_queue',
  },
});

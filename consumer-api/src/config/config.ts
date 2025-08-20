import { rabbitmq } from './constants';

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    uri:
      process.env.MONGO_URI ||
      'mongodb://root:password@192.168.60.128:27017/panto-db?authSource=admin',
  },
  rabbitmq: {
    uri: process.env.RABBITMQ_URI || 'amqp://user:password@192.168.60.130:5672',
    exchange: rabbitmq.exchange,
    queue: rabbitmq.queue,
  },
  swagger: {
    title: 'PANTOhealth IoT Data Management API',
    description: 'API for processing and retrieving x-ray signal data.',
    version: '1.0',
  },
});

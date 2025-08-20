import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ProducerService {
  private readonly logger = new Logger(ProducerService.name);

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService,
  ) {}

  async publishSampleData() {
    this.logger.log('Reading sample data file...');

    try {
      const dataPath = path.join(process.cwd(), 'src', 'sample-data.json');
      const fileContent = await fs.readFile(dataPath, 'utf-8');

      const dataObject = JSON.parse(fileContent);
      const deviceIds = Object.keys(dataObject);

      if (deviceIds.length === 0) {
        this.logger.warn('Data file is empty. No messages to publish.');
        return; // Exit gracefully if there's nothing to do.
      }

      const exchange = this.configService.get<string>('rabbitmq.exchange');
      const routingKey = this.configService.get<string>('rabbitmq.routingKey');

      this.logger.log(`Found ${deviceIds.length} device records to publish.`);

      for (const deviceId of deviceIds) {
        const payload = {
          [deviceId]: dataObject[deviceId],
        };

        this.logger.log(`Publishing data for device ${deviceId}...`);
        await this.amqpConnection.publish(exchange, routingKey, payload);
      }

      this.logger.log('✅ All data published successfully!');
    } catch (error) {
      // If any part of the process fails, this block will execute.
      this.logger.error(
        'Failed to publish sample data. An error occurred:',
        error.stack,
      );

      // We re-throw the error to ensure the command-line process exits with a
      // non-zero status code, signaling that the task has failed.
      throw error;
    }
  }
}

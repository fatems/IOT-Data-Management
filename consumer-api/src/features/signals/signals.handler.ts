import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { rabbitmq } from '../../config/constants'; // Import our static queue names
import { SignalsService, XRayDataPayload } from './signals.service';

@Injectable()
export class SignalsHandler {
  private readonly logger = new Logger(SignalsHandler.name);

  constructor(private readonly signalsService: SignalsService) {}

  // This decorator subscribes this method to the specified RabbitMQ queue.
  @RabbitSubscribe({
    exchange: rabbitmq.exchange,
    routingKey: rabbitmq.queue,
    queue: rabbitmq.queue,
  })
  public async handle(payload: XRayDataPayload) {
    this.logger.log(
      `Received new x-ray message from queue '${rabbitmq.queue}'.`,
    );

    try {
      // We delegate the actual work to our robust, unit-tested service.
      await this.signalsService.processAndSave(payload);

      this.logger.log('Successfully processed and saved x-ray data.');
    } catch (error) {
      // CRITICAL: This catch block ensures that if one message is malformed or causes
      // an error during processing, the entire consumer service WILL NOT crash.
      // It will log the error and be ready for the next message.
      this.logger.error(
        `Failed to process x-ray message. Error: ${error.message}`,
        error.stack, // Stack for detailed debugging.
      );
      // In a production system, we might also send the failed payload to a
      // separate "dead-letter-queue" for later inspection. For this assessment,
      // logging suffices ig.
    }
  }
}

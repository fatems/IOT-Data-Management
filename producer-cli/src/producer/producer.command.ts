import { Command, CommandRunner } from 'nest-commander';
import { ProducerService } from './producer.service';
import { Logger } from '@nestjs/common';

@Command({
  name: 'send:xray',
  description: 'Sends sample x-ray data to RabbitMQ',
})
export class ProducerCommand extends CommandRunner {
  private readonly logger = new Logger(ProducerCommand.name);

  constructor(private readonly producerService: ProducerService) {
    super();
  }

  /**
   * The main execution method for the command.
   * We prefix the unused 'inputs' and 'options' parameters with an underscore
   * to satisfy the abstract class's signature while keeping our code clean.
   */
  async run(_inputs: string[], _options: Record<string, any>): Promise<void> {
    this.logger.log('Executing send:xray command...');
    await this.producerService.publishSampleData();
    // nest-commander handles the application exit gracefully.
  }
}

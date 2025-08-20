import { Module } from '@nestjs/common';
import { ProducerCommand } from './producer.command';
import { ProducerService } from './producer.service';
import { MessagingModule } from 'src/common/messaging.module';

@Module({
  imports: [MessagingModule],

  providers: [ProducerService, ProducerCommand],
})
export class ProducerModule {}

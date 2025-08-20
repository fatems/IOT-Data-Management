import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessagingModule } from './common/messaging.module';
import { ProducerModule } from './producer/producer.module';
import config from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    MessagingModule,
    ProducerModule,
  ],
})
export class AppModule {}

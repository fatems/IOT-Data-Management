import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        exchanges: [
          {
            name: configService.get<string>('rabbitmq.exchange'),
            type: 'topic',
          },
        ],
        uri: configService.get<string>('rabbitmq.uri'),
        connectionInitOptions: { wait: false },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [RabbitMQModule], // We only need to export the main module
})
export class MessagingModule {}

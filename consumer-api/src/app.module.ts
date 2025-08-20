import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database.module';
import { MessagingModule } from './common/messaging.module';
import { SignalsModule } from './features/signals/signals.module';
import config from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    DatabaseModule,
    MessagingModule,
    SignalsModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagingModule } from '../../common/messaging.module';
import { XRay, XRaySchema } from './schemas/xray.schema';
import { SignalsController } from './signals.controller';
import { SignalsHandler } from './signals.handler';
import { SignalsService } from './signals.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: XRay.name, schema: XRaySchema }]),
    MessagingModule,
  ],
  controllers: [SignalsController],
  providers: [SignalsService, SignalsHandler],
})
export class SignalsModule {}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class XRay {
  @Prop({ required: true, index: true })
  deviceId: string;

  @Prop({ required: true })
  time: Date;

  @Prop({ required: true })
  dataLength: number;

  @Prop({ required: true })
  dataVolume: number; // Size in bytes
}

export type XRayDocument = XRay & Document;
export const XRaySchema = SchemaFactory.createForClass(XRay);

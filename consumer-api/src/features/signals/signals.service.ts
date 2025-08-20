import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';
import { XRay, XRayDocument } from './schemas/xray.schema';

// This interface defines the expected shape of a single message payload from RabbitMQ.
export interface XRayDataPayload {
  [deviceId: string]: { data: any[][]; time: number };
}

@Injectable()
export class SignalsService {
  private readonly logger = new Logger(SignalsService.name);

  constructor(
    @InjectModel(XRay.name) private readonly xrayModel: Model<XRayDocument>,
  ) {}

  /**
   * Processes a raw data payload from RabbitMQ. This is the primary internal method
   * for data ingestion. It uses `this.xrayModel.create()` for testability.
   */
  async processAndSave(payload: XRayDataPayload): Promise<XRay> {
    const deviceId = Object.keys(payload)[0];

    // Validate the payload structure.
    if (!deviceId) {
      throw new Error('Invalid payload format: missing deviceId');
    }

    const xrayData = payload[deviceId];
    const dataToSave = {
      deviceId,
      time: new Date(xrayData.time),
      dataLength: xrayData.data.length,
      dataVolume: Buffer.byteLength(JSON.stringify(xrayData), 'utf8'),
    };

    this.logger.log(
      `Processing data for device ${dataToSave.deviceId}: length=${dataToSave.dataLength}, volume=${dataToSave.dataVolume} bytes`,
    );

    return this.xrayModel.create(dataToSave);
  }

  /**
   * Creates a new signal document from the public API (POST /signals).
   * This is part of the explicit CRUD requirement.
   */
  async create(createSignalDto: CreateSignalDto): Promise<XRay> {
    const newSignal = new this.xrayModel(createSignalDto);
    this.logger.log(
      `Creating new signal manually for device ${newSignal.deviceId}`,
    );
    return newSignal.save();
  }

  /**
   * Retrieves all signal documents from the database.
   */
  async findAll(): Promise<XRay[]> {
    return this.xrayModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Retrieves all signal documents for a specific deviceId.
   */
  async findByDeviceId(deviceId: string): Promise<XRay[]> {
    const signals = await this.xrayModel
      .find({ deviceId })
      .sort({ createdAt: -1 })
      .exec();

    if (!signals.length) {
      throw new NotFoundException(`No signals found for deviceId: ${deviceId}`);
    }
    return signals;
  }

  /**
   * Updates a signal document by its ID.
   */
  async update(id: string, updateSignalDto: UpdateSignalDto): Promise<XRay> {
    const existingSignal = await this.xrayModel
      .findByIdAndUpdate(id, updateSignalDto, { new: true }) // {new: true} returns the updated document.
      .exec();

    if (!existingSignal) {
      throw new NotFoundException(`Signal with ID "${id}" not found`);
    }
    this.logger.log(`Updated signal with ID ${id}`);
    return existingSignal;
  }

  /**
   * Deletes a signal document by its ID.
   */
  async remove(id: string): Promise<{ deleted: boolean; _id: string }> {
    const result = await this.xrayModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Signal with ID "${id}" not found`);
    }
    this.logger.log(`Deleted signal with ID ${id}`);
    return { deleted: true, _id: id };
  }
}

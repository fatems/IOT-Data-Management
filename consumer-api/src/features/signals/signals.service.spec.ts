import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

import { SignalsService } from './signals.service';
import { XRay, XRayDocument } from './schemas/xray.schema';

// This is a simple, reusable mock of a signal object.
// It's what we'll use as the return value for our database operations.
const mockSignal = {
  _id: 'validMongoId',
  deviceId: 'testDevice',
  time: new Date(),
  dataLength: 10,
  dataVolume: 1024,
};

// This is our mock of the Mongoose Model. It's a plain object where each key
// is a method we expect to call on the real Model. This approach is clean,
// TypeScript-friendly, and easy to read.
const mockSignalModel = {
  // Mock the static `create` method for saving new documents
  create: jest.fn().mockResolvedValue(mockSignal),
  // Mock the static `find` method
  find: jest.fn(),
  // Mock the static `findByIdAndUpdate` method
  findByIdAndUpdate: jest.fn(),
  // Mock the static `findByIdAndDelete` method
  findByIdAndDelete: jest.fn(),
};

// We need to mock the constructor for the `create` method that uses `new`
const mockModelConstructor = jest.fn().mockImplementation(() => ({
  save: jest.fn().mockResolvedValue(mockSignal),
}));

describe('SignalsService', () => {
  let service: SignalsService;
  let model: Model<XRayDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalsService,
        {
          provide: getModelToken(XRay.name),
          // We provide our plain object mock here.
          // For the `create` test, we will provide the constructor mock.
          useValue: mockSignalModel,
        },
      ],
    }).compile();

    service = module.get<SignalsService>(SignalsService);
    model = module.get<Model<XRayDocument>>(getModelToken(XRay.name));

    // Clear all mock history before each test to ensure they are isolated.
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Message Processing', () => {
    it('processAndSave should correctly process a valid payload', async () => {
      // Arrange
      const payload = {
        testDevice: { data: new Array(10), time: Date.now() },
      };

      // Act
      await service.processAndSave(payload);

      // Assert
      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({ deviceId: 'testDevice' }),
      );
    });

    it('processAndSave should throw an error for a malformed payload', async () => {
      const invalidPayload = {};
      await expect(service.processAndSave(invalidPayload)).rejects.toThrow(
        'Invalid payload format: missing deviceId',
      );
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(() => {
      // Since `create` uses the constructor, we provide the constructor mock here
      (service as any).xrayModel = mockModelConstructor;
    });

    it('create (POST) should save a new signal', async () => {
      const createDto = { ...mockSignal };
      await service.create(createDto);
      expect(mockModelConstructor).toHaveBeenCalledWith(createDto);
    });

    it('findAll (GET) should return an array of signals', async () => {
      // Arrange
      (mockSignalModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockSignal]),
      });
      (service as any).xrayModel = mockSignalModel;

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([mockSignal]);
    });

    it('update (PATCH) should update a signal successfully', async () => {
      // Arrange
      (mockSignalModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSignal),
      });
      (service as any).xrayModel = mockSignalModel;

      // Act
      const result = await service.update('some-id', { dataLength: 20 });

      // Assert
      expect(result).toEqual(mockSignal);
    });

    it('update (PATCH) should throw a NotFoundException if the signal is not found', async () => {
      // Arrange
      (mockSignalModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      (service as any).xrayModel = mockSignalModel;

      // Act & Assert
      await expect(service.update('bad-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('remove (DELETE) should delete a signal successfully', async () => {
      // Arrange
      (mockSignalModel.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSignal),
      });
      (service as any).xrayModel = mockSignalModel;

      // Act
      const result = await service.remove('some-id');

      // Assert
      expect(result).toEqual({ deleted: true, _id: 'some-id' });
    });

    it('remove (DELETE) should throw a NotFoundException if the signal is not found', async () => {
      // Arrange
      (mockSignalModel.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      (service as any).xrayModel = mockSignalModel;

      // Act & Assert
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';

import { ProducerService } from './producer.service';

// Mock the entire 'fs/promises' module so we can control its behavior in our tests.
jest.mock('fs/promises');

describe('ProducerService', () => {
  let service: ProducerService;
  let amqpConnection: AmqpConnection;

  // Set up mock objects for our dependencies.
  const mockAmqpConnection = {
    publish: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'rabbitmq.exchange') return 'test.exchange';
      if (key === 'rabbitmq.routingKey') return 'test.routing.key';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProducerService,
        { provide: AmqpConnection, useValue: mockAmqpConnection },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ProducerService>(ProducerService);
    amqpConnection = module.get<AmqpConnection>(AmqpConnection);

    // Reset mocks before each test to ensure they don't interfere with each other.
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Happy Path', () => {
    it('should read a file and publish a message for each device record', async () => {
      // Arrange: Set up our mock data and tell the mocked readFile what to return.
      const mockData = {
        deviceOne: { data: [], time: 123 },
        deviceTwo: { data: [], time: 456 },
      };
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      // Act: Run the method.
      await service.publishSampleData();

      // Assert: Verify the expected behavior.
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(amqpConnection.publish).toHaveBeenCalledTimes(2);
      expect(amqpConnection.publish).toHaveBeenCalledWith(
        'test.exchange',
        'test.routing.key',
        { deviceOne: mockData['deviceOne'] },
      );
    });
  });

  // --- NEW TESTS FOR ERROR HANDLING ---
  describe('Error Handling', () => {
    it('should throw an error if the data file cannot be read', async () => {
      // Arrange: Make fs.readFile fail, as if the file is missing.
      const fileError = new Error('File not found');
      (fs.readFile as jest.Mock).mockRejectedValue(fileError);

      // Act & Assert: We expect the entire method to fail by throwing the same error.
      await expect(service.publishSampleData()).rejects.toThrow(fileError);

      // And we verify that no messages were sent in this failure case.
      expect(amqpConnection.publish).not.toHaveBeenCalled();
    });

    it('should throw an error if the data file contains invalid JSON', async () => {
      // Arrange: Make fs.readFile return a malformed JSON string.
      const invalidJson = '{ "deviceId": "123", }'; // The trailing comma is invalid JSON.
      (fs.readFile as jest.Mock).mockResolvedValue(invalidJson);

      // Act & Assert: We expect the method to fail with a SyntaxError from JSON.parse.
      await expect(service.publishSampleData()).rejects.toThrow(SyntaxError);
      expect(amqpConnection.publish).not.toHaveBeenCalled();
    });

    it('should throw an error if publishing to RabbitMQ fails', async () => {
      // Arrange: The file read and parse will succeed.
      const mockData = { deviceOne: { data: [], time: 123 } };
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      // But we make the amqpConnection.publish call fail.
      const publishError = new Error('RabbitMQ connection failed');
      (amqpConnection.publish as jest.Mock).mockRejectedValue(publishError);

      // Act & Assert: We expect our service to bubble up this error.
      await expect(service.publishSampleData()).rejects.toThrow(publishError);
    });
  });
});

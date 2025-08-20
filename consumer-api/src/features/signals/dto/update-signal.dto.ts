import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpdateSignalDto {
  @ApiPropertyOptional({
    description: 'The unique identifier for the device.',
    example: '555b584d4ae73e488c30a555',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  deviceId?: string;

  @ApiPropertyOptional({
    description: 'The timestamp of the signal event in ISO 8601 format.',
    example: '2023-12-22T22:18:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  time?: Date;

  @ApiPropertyOptional({
    description: 'The number of data points in the signal.',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  dataLength?: number;

  @ApiPropertyOptional({
    description: 'The estimated size of the signal data in bytes.',
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  dataVolume?: number;
}

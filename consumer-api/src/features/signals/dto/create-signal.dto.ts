import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateSignalDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '555b584d4ae73e488c30a555' })
  deviceId: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ example: '2023-10-14T22:18:00.000Z' })
  time: Date;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({ example: 25 })
  dataLength: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({ example: 4096 })
  dataVolume: number;
}

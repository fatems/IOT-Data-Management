import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SignalsService } from './signals.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSignalDto } from './dto/create-signal.dto';
import { UpdateSignalDto } from './dto/update-signal.dto';

@ApiTags('Signals')
@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  // READ (ALL)
  @Get()
  @ApiOperation({ summary: 'Retrieve all processed signals' })
  @ApiResponse({ status: 200, description: 'A list of all signals.' })
  findAll() {
    return this.signalsService.findAll();
  }

  // READ (FILTERED)
  @Get('by-device')
  @ApiOperation({ summary: 'Filter signals by device ID' })
  @ApiQuery({
    name: 'id',
    required: true,
    description: 'The device ID to filter by.',
  })
  @ApiResponse({
    status: 200,
    description: 'A list of signals for the given device.',
  })
  @ApiResponse({ status: 404, description: 'No signals found for the device.' })
  findByDevice(@Query('id') deviceId: string) {
    return this.signalsService.findByDeviceId(deviceId);
  }

  // CREATE
  @Post()
  @ApiOperation({ summary: 'Create a new signal manually via API' })
  @ApiResponse({
    status: 201,
    description: 'The signal has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  create(@Body() createSignalDto: CreateSignalDto) {
    return this.signalsService.create(createSignalDto);
  }

  // UPDATE
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing signal by its ID' })
  @ApiResponse({
    status: 200,
    description: 'The signal has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Signal with the given ID not found.',
  })
  update(@Param('id') id: string, @Body() updateSignalDto: UpdateSignalDto) {
    return this.signalsService.update(id, updateSignalDto);
  }

  // DELETE
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a signal by its ID' })
  @ApiResponse({
    status: 200,
    description: 'The signal has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Signal with the given ID not found.',
  })
  remove(@Param('id') id: string) {
    return this.signalsService.remove(id);
  }
}

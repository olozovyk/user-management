import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthApiDto } from './dto/api';

@Controller('health')
@ApiTags('health')
export class HealthcheckController {
  @Get()
  @ApiOkResponse({ type: HealthApiDto })
  health() {
    return {
      status: 'OK',
    };
  }
}

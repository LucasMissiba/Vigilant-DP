import { Controller, Get, Post, Body, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { TimeClockService } from './time-clock.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Time Clock')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('time-clock')
export class TimeClockController {
  constructor(private readonly timeClockService: TimeClockService) {}

  @Post('import')
  @Roles('ADMIN', 'DP_RH')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importa dados do ponto eletrônico (RF01)' })
  async import(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    return this.timeClockService.importFromFile(file, user.sub);
  }

  @Get()
  @Roles('ADMIN', 'DP_RH', 'GESTOR', 'COLABORADOR')
  @ApiOperation({ summary: 'Lista registros de ponto' })
  async findAll(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user?: any,
  ) {
    const targetUserId = userId || (user.role === 'COLABORADOR' ? user.sub : undefined);
    return this.timeClockService.findAll(
      targetUserId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}




import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompensationService } from './compensation.service';
import { CreateCompensationDto, ApproveCompensationDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Compensation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('compensation')
export class CompensationController {
  constructor(private readonly compensationService: CompensationService) {}

  @Post()
  @Roles('COLABORADOR', 'GESTOR', 'DP_RH', 'ADMIN')
  @ApiOperation({ summary: 'Solicita compensação de horas (RF05)' })
  async create(@Body() createDto: CreateCompensationDto, @CurrentUser() user: any) {
    return this.compensationService.create(createDto, user.sub);
  }

  @Post(':id/approve')
  @Roles('GESTOR', 'DP_RH', 'ADMIN')
  @ApiOperation({ summary: 'Aprova uma solicitação de compensação' })
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveCompensationDto,
    @CurrentUser() user: any,
  ) {
    return this.compensationService.approve(id, approveDto, user.sub);
  }

  @Post(':id/reject')
  @Roles('GESTOR', 'DP_RH', 'ADMIN')
  @ApiOperation({ summary: 'Rejeita uma solicitação de compensação' })
  async reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.compensationService.reject(id, reason, user.sub);
  }

  @Post('forced')
  @Roles('DP_RH', 'ADMIN')
  @ApiOperation({ summary: 'Agenda compensação forçada (RF09)' })
  async scheduleForced(
    @Body('userId') userId: string,
    @Body('hours') hours: number,
    @Body('date') date: string,
    @CurrentUser() user: any,
  ) {
    return this.compensationService.scheduleForcedCompensation(
      userId,
      hours,
      new Date(date),
      user.sub,
    );
  }

  @Get()
  @Roles('GESTOR', 'DP_RH', 'ADMIN')
  @ApiOperation({ summary: 'Lista compensações' })
  async findAll(
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    return this.compensationService.findAll(userId, status);
  }
}




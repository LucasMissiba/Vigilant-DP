import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HourBalanceService } from './hour-balance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Hour Balance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hour-balance')
export class HourBalanceController {
  constructor(private readonly hourBalanceService: HourBalanceService) {}

  @Get('me')
  @Roles('COLABORADOR', 'GESTOR', 'DP_RH', 'ADMIN')
  @ApiOperation({ summary: 'Retorna saldo do usuário autenticado (RF05)' })
  async getMyBalance(@CurrentUser() user: any) {
    return this.hourBalanceService.getBalance(user.sub);
  }

  @Get('me/history')
  @Roles('COLABORADOR', 'GESTOR', 'DP_RH', 'ADMIN')
  @ApiOperation({ summary: 'Retorna histórico de movimentações (RF04)' })
  async getMyHistory(@CurrentUser() user: any) {
    return this.hourBalanceService.getHistory(user.sub);
  }

  @Get(':userId')
  @Roles('GESTOR', 'DP_RH', 'ADMIN')
  @ApiOperation({ summary: 'Retorna saldo de um usuário específico' })
  async getBalance(@Param('userId') userId: string) {
    return this.hourBalanceService.getBalance(userId);
  }

  @Get(':userId/history')
  @Roles('GESTOR', 'DP_RH', 'ADMIN')
  @ApiOperation({ summary: 'Retorna histórico de movimentações de um usuário' })
  async getHistory(@Param('userId') userId: string) {
    return this.hourBalanceService.getHistory(userId);
  }
}




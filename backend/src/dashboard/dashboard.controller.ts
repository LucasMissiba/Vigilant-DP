import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('manager')
  @Roles('GESTOR', 'DP_RH', 'ADMIN')
  @ApiOperation({ summary: 'Dashboard do gestor (RF06)' })
  async getManagerDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getManagerDashboard(user.sub);
  }

  @Get('employee')
  @Roles('COLABORADOR', 'GESTOR', 'DP_RH', 'ADMIN')
  @ApiOperation({ summary: 'Dashboard do colaborador (RF05)' })
  async getEmployeeDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getEmployeeDashboard(user.sub);
  }

  @Get('admin')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Dashboard administrativo' })
  async getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }
}



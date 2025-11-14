import { Controller, Get, Post, Param, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('export')
  @Roles('DP_RH', 'ADMIN')
  @ApiOperation({ summary: 'Gera arquivo de exportação para folha (RF07)' })
  async generateExport(
    @Query('period') period: string,
    @CurrentUser() user: any,
  ) {
    return this.payrollService.generateExport(period, user.sub);
  }

  @Get('exports')
  @Roles('DP_RH', 'ADMIN')
  @ApiOperation({ summary: 'Lista exportações realizadas' })
  async getExports(@Query('period') period?: string) {
    return this.payrollService.getExports(period);
  }

  @Get('exports/:id/download')
  @Roles('DP_RH', 'ADMIN')
  @ApiOperation({ summary: 'Download do arquivo de exportação' })
  async downloadExport(@Param('id') id: string, @Res() res: Response) {
    const exportRecord = await this.payrollService.getExports();
    const record = exportRecord.find(e => e.id === id);

    if (!record) {
      return res.status(404).json({ message: 'Exportação não encontrada' });
    }

    const filePath = path.join(process.cwd(), 'exports', record.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }

    res.download(filePath, record.fileName);
  }
}




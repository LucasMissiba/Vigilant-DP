import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async generateExport(period: string, exportedBy: string) {
    // Formato: YYYY-MM
    const [year, month] = period.split('-');

    // Busca todos os registros de ponto do período
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const timeClocks = await this.prisma.timeClock.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        calculated: true,
      },
    });

    // Gera arquivo no formato esperado pela folha de pagamento
    const exportData = this.formatForPayroll(timeClocks);

    // Cria arquivo Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Horas Extras');

    const fileName = `horas_extras_${period}_${Date.now()}.xlsx`;
    const filePath = path.join(process.cwd(), 'exports', fileName);

    // Garante que o diretório existe
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    XLSX.writeFile(workbook, filePath);

    // Salva registro da exportação
    const exportRecord = await this.prisma.payrollExport.create({
      data: {
        period,
        fileName,
        filePath,
        recordCount: exportData.length,
        totalExtraHours: exportData.reduce((sum, r) => sum + (r.extraHours || 0), 0),
        exportedBy,
      },
    });

    return {
      ...exportRecord,
      downloadUrl: `/api/v1/payroll/exports/${exportRecord.id}/download`,
    };
  }

  private formatForPayroll(timeClocks: any[]) {
    // Formata dados conforme layout esperado pela folha de pagamento
    // Este formato deve ser validado com o fornecedor da folha
    return timeClocks.map(tc => ({
      employeeId: tc.userId, // Ajustar conforme necessário
      date: tc.date.toISOString().split('T')[0],
      extraHours: tc.extraHours?.toNumber() || 0,
      nightHours: tc.nightHours?.toNumber() || 0,
      holidayHours: tc.holidayHours?.toNumber() || 0,
    }));
  }

  async getExports(period?: string) {
    const where = period ? { period } : {};
    return this.prisma.payrollExport.findMany({
      where,
      orderBy: { exportedAt: 'desc' },
    });
  }
}



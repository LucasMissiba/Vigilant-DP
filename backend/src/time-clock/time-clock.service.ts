import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RuleEngine } from '../rules/rule-engine.service';
import { HourBalanceService } from '../hour-balance/hour-balance.service';
import { ImportTimeClockDto } from './dto';
import * as XLSX from 'xlsx';

@Injectable()
export class TimeClockService {
  private readonly logger = new Logger(TimeClockService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ruleEngine: RuleEngine,
    private readonly hourBalanceService: HourBalanceService,
  ) {}

  async importFromFile(file: Express.Multer.File, userId?: string) {
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'txt') {
      return this.importFromTxt(file, userId);
    } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      return this.importFromExcel(file, userId);
    } else {
      throw new BadRequestException('Formato de arquivo não suportado. Use TXT ou Excel.');
    }
  }

  async importFromTxt(file: Express.Multer.File, importedBy?: string) {
    try {
      this.logger.log(`Iniciando importação do arquivo: ${file.originalname}`);
      
      // Tenta diferentes encodings
      let content: string;
      try {
        content = file.buffer.toString('utf-8');
      } catch (e) {
        content = file.buffer.toString('latin1');
      }
      
      if (!content || content.trim().length === 0) {
        throw new BadRequestException('Arquivo vazio ou inválido');
      }
      
      const lines = content.split(/\r?\n/).filter(line => line.trim());
      this.logger.log(`Total de linhas encontradas: ${lines.length}`);
      
      if (lines.length === 0) {
        throw new BadRequestException('Nenhuma linha válida encontrada no arquivo');
      }
      
      const records = [];
      const errors = [];
      
      // Formato esperado: PIS;Nome;Data;Entrada1;Saída1;Entrada2;Saída2;...
      // Ou formato alternativo: Matricula|Nome|Data|Hora1|Hora2|Hora3|Hora4|...
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Pula linhas vazias e cabeçalhos
        if (!line) continue;
        if (line.toLowerCase().startsWith('pis') || 
            line.toLowerCase().startsWith('matricula') ||
            line.toLowerCase().startsWith('matrícula') ||
            line.toLowerCase().includes('nome') && line.toLowerCase().includes('data')) {
          this.logger.debug(`Pulando cabeçalho na linha ${i + 1}`);
          continue;
        }
        
        try {
          const record = this.parseTxtLine(line, i + 1);
          if (record) {
            const processed = await this.processTimeClockRecord(record, importedBy, file.originalname);
            records.push(processed);
          }
        } catch (error: any) {
          this.logger.warn(`Erro ao processar linha ${i + 1}: ${error.message}`);
          errors.push({
            line: i + 1,
            content: line.substring(0, 100),
            error: error.message,
          });
        }
      }

      this.logger.log(`Importação concluída: ${records.length} registros importados, ${errors.length} erros`);

      return {
        imported: records.length,
        errors: errors.length,
        records: records.slice(0, 10), // Retorna apenas primeiros 10 para preview
        errorDetails: errors.slice(0, 10),
        totalLines: lines.length,
      };
    } catch (error: any) {
      this.logger.error(`Erro na importação: ${error.message}`, error.stack);
      throw new BadRequestException(`Erro ao processar arquivo: ${error.message}`);
    }
  }

  private parseTxtLine(line: string, lineNumber: number): any {
    // Tenta diferentes formatos comuns de arquivo TXT de ponto
    
    // Formato 1: PIS;Nome;Data;Hora1;Hora2;Hora3;Hora4
    if (line.includes(';')) {
      const parts = line.split(';').map(p => p.trim());
      if (parts.length >= 3) {
        const pis = parts[0];
        const name = parts[1];
        const dateStr = parts[2];
        const times = parts.slice(3).filter(t => t);
        
        return {
          employeeId: pis,
          employeeName: name,
          date: this.parseDate(dateStr),
          times: this.parseTimes(times),
        };
      }
    }
    
    // Formato 2: Matricula|Nome|Data|Hora1|Hora2|Hora3|Hora4
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        const matricula = parts[0];
        const name = parts[1];
        const dateStr = parts[2];
        const times = parts.slice(3).filter(t => t);
        
        return {
          employeeId: matricula,
          employeeName: name,
          date: this.parseDate(dateStr),
          times: this.parseTimes(times),
        };
      }
    }
    
    // Formato 3: Espaços fixos (formato antigo)
    if (line.length > 50) {
      const employeeId = line.substring(0, 12).trim();
      const name = line.substring(12, 42).trim();
      const dateStr = line.substring(42, 52).trim();
      const timesStr = line.substring(52).trim();
      const times = timesStr.match(/.{1,8}/g) || [];
      
      return {
        employeeId,
        employeeName: name,
        date: this.parseDate(dateStr),
        times: this.parseTimes(times),
      };
    }
    
    throw new Error(`Formato de linha não reconhecido na linha ${lineNumber}`);
  }

  private parseDate(dateStr: string): Date {
    // Tenta diferentes formatos de data
    const formats = [
      /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
      /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
      /(\d{2})(\d{2})(\d{4})/, // DDMMYYYY
    ];
    
    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format === formats[0]) {
          // DD/MM/YYYY
          return new Date(`${match[3]}-${match[2]}-${match[1]}`);
        } else if (format === formats[1]) {
          // YYYY-MM-DD
          return new Date(dateStr);
        } else {
          // DDMMYYYY
          return new Date(`${match[3]}-${match[2]}-${match[1]}`);
        }
      }
    }
    
    throw new Error(`Data inválida: ${dateStr}`);
  }

  private parseTimes(times: string[]): string[] {
    return times
      .filter(t => t && t.trim())
      .map(t => {
        // Normaliza formato de hora: HH:MM ou HHMM
        const cleaned = t.replace(/[^\d]/g, '');
        if (cleaned.length === 4) {
          return `${cleaned.substring(0, 2)}:${cleaned.substring(2, 4)}`;
        }
        return t;
      });
  }

  async importFromExcel(file: Express.Multer.File, userId?: string) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const importedRecords = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      try {
        const record = await this.processTimeClockRecord(row, userId, file.originalname);
        importedRecords.push(record);
      } catch (error: any) {
        errors.push({
          row: i + 2, // +2 porque começa em 0 e tem cabeçalho
          error: error.message,
        });
      }
    }

    return {
      imported: importedRecords.length,
      errors: errors.length,
      records: importedRecords.slice(0, 10),
      errorDetails: errors.slice(0, 10),
    };
  }

  private async processTimeClockRecord(row: any, importedBy?: string, sourceFile?: string) {
    // Normaliza dados do registro
    const employeeId = row.employeeId || row.pis || row.matricula || row['PIS'] || row['Matrícula'];
    const date = row.date ? new Date(row.date) : (row.data ? this.parseDate(row.data) : new Date());
    
    if (!employeeId) {
      throw new Error('ID do funcionário não encontrado');
    }
    
    // Busca usuário pelo employeeId
    const user = await this.prisma.user.findUnique({
      where: { employeeId },
    });
    
    if (!user) {
      throw new Error(`Funcionário não encontrado: ${employeeId}`);
    }
    
    // Extrai horários
    const times = row.times || this.extractTimesFromRow(row);
    const { entry1, exit1, entry2, exit2, entry3, exit3 } = this.parseTimeEntries(times, date);
    
    // Calcula horas usando o motor de regras
    const calculation = await this.ruleEngine.calculateExtraHours(
      {
        date,
        entry1,
        exit1,
        entry2,
        exit2,
        entry3,
        exit3,
        userId: user.id,
      },
      {}, // Config padrão
    );
    
    // Cria ou atualiza registro de ponto
    const timeClock = await this.prisma.timeClock.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: date,
        },
      },
      update: {
        entry1,
        exit1,
        entry2,
        exit2,
        entry3,
        exit3,
        totalHours: calculation.totalHours,
        extraHours: calculation.extraHours,
        nightHours: calculation.nightHours,
        holidayHours: calculation.holidayHours,
        calculated: true,
        calculatedAt: new Date(),
        sourceFile,
        metadata: calculation.metadata,
      },
      create: {
        userId: user.id,
        date,
        entry1,
        exit1,
        entry2,
        exit2,
        entry3,
        exit3,
        totalHours: calculation.totalHours,
        extraHours: calculation.extraHours,
        nightHours: calculation.nightHours,
        holidayHours: calculation.holidayHours,
        calculated: true,
        calculatedAt: new Date(),
        sourceFile,
        metadata: calculation.metadata,
      },
    });
    
    // Atualiza saldo de horas
    if (calculation.extraHours > 0) {
      await this.hourBalanceService.addHours(
        user.id,
        calculation.extraHours,
        `Horas extras calculadas em ${date.toLocaleDateString('pt-BR')}`,
        {
          timeClockId: timeClock.id,
          calculation,
        },
      );
    }
    
    return {
      id: timeClock.id,
      employeeId: user.employeeId,
      employeeName: user.name,
      date: timeClock.date,
      totalHours: timeClock.totalHours?.toNumber(),
      extraHours: timeClock.extraHours?.toNumber(),
    };
  }

  private extractTimesFromRow(row: any): string[] {
    const times: string[] = [];
    const timeKeys = ['entrada1', 'saida1', 'entrada2', 'saida2', 'entrada3', 'saida3', 
                      'entry1', 'exit1', 'entry2', 'exit2', 'entry3', 'exit3',
                      'Entrada1', 'Saída1', 'Entrada2', 'Saída2'];
    
    for (const key of timeKeys) {
      if (row[key]) {
        times.push(row[key]);
      }
    }
    
    return times;
  }

  private parseTimeEntries(times: string[], baseDate: Date): {
    entry1?: Date;
    exit1?: Date;
    entry2?: Date;
    exit2?: Date;
    entry3?: Date;
    exit3?: Date;
  } {
    const entries: any = {};
    let entryIndex = 1;
    
    for (let i = 0; i < times.length; i++) {
      const timeStr = times[i];
      if (!timeStr) continue;
      
      const time = this.parseTime(timeStr);
      if (!time) continue;
      
      const dateTime = new Date(baseDate);
      dateTime.setHours(time.hours, time.minutes, 0, 0);
      
      if (i % 2 === 0) {
        // Entrada
        entries[`entry${entryIndex}`] = dateTime;
      } else {
        // Saída
        entries[`exit${entryIndex}`] = dateTime;
        entryIndex++;
      }
    }
    
    return entries;
  }

  private parseTime(timeStr: string): { hours: number; minutes: number } | null {
    const match = timeStr.match(/(\d{1,2}):?(\d{2})?/);
    if (match) {
      return {
        hours: parseInt(match[1], 10),
        minutes: parseInt(match[2] || '0', 10),
      };
    }
    return null;
  }

  async findAll(userId?: string, startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    return this.prisma.timeClock.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }
}



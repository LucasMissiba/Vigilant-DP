import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getManagerDashboard(managerId: string) {
    // Busca todos os colaboradores do gestor
    const employees = await this.prisma.user.findMany({
      where: { managerId },
      include: {
        hourBalances: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const teamData = employees.map(employee => {
      const balance = employee.hourBalances[0];
      return {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        balance: balance?.balance.toNumber() || 0,
        status: balance?.status || 'NORMAL',
      };
    });

    // Calcula estatísticas
    const criticalCount = teamData.filter(t => t.status === 'CRITICAL').length;
    const warningCount = teamData.filter(t => t.status === 'WARNING').length;
    const totalBalance = teamData.reduce((sum, t) => sum + t.balance, 0);

    return {
      teamData,
      statistics: {
        totalEmployees: employees.length,
        criticalCount,
        warningCount,
        totalBalance,
      },
    };
  }

  async getEmployeeDashboard(userId: string) {
    const balance = await this.prisma.hourBalance.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 12, // Últimos 12 meses
        },
      },
    });

    // Gera dados para gráfico de evolução
    const evolutionData = this.calculateEvolutionData(balance?.movements || []);

    return {
      currentBalance: balance?.balance.toNumber() || 0,
      status: balance?.status || 'NORMAL',
      validUntil: balance?.validUntil,
      evolution: evolutionData,
    };
  }

  async getAdminDashboard() {
    // Estatísticas gerais
    const totalUsers = await this.prisma.user.count({ where: { isActive: true } });
    const totalEmployees = await this.prisma.user.count({
      where: { role: 'COLABORADOR', isActive: true },
    });
    
    const balances = await this.prisma.hourBalance.findMany({
      include: { user: true },
    });

    const criticalCount = balances.filter(b => b.status === 'CRITICAL').length;
    const warningCount = balances.filter(b => b.status === 'WARNING').length;
    const totalBalance = balances.reduce((sum, b) => sum + b.balance.toNumber(), 0);
    const avgBalance = balances.length > 0 ? totalBalance / balances.length : 0;

    // Últimas importações (agrupa por arquivo)
    const allImports = await this.prisma.timeClock.findMany({
      where: { sourceFile: { not: null } },
      orderBy: { importedAt: 'desc' },
      include: { user: { select: { name: true, employeeId: true } } },
    });
    
    // Agrupa por arquivo e pega o mais recente de cada
    const importsByFile = new Map();
    allImports.forEach(imp => {
      if (!importsByFile.has(imp.sourceFile)) {
        importsByFile.set(imp.sourceFile, imp);
      }
    });
    
    const recentImports = Array.from(importsByFile.values()).slice(0, 10);

    // Regras ativas
    const activeRules = await this.prisma.rule.count({ where: { isActive: true } });

    // Compensações pendentes
    const pendingCompensations = await this.prisma.compensation.count({
      where: { status: 'PENDING' },
    });

    return {
      statistics: {
        totalUsers,
        totalEmployees,
        criticalCount,
        warningCount,
        totalBalance,
        avgBalance,
        activeRules,
        pendingCompensations,
      },
      recentImports: recentImports.map(imp => ({
        fileName: imp.sourceFile,
        date: imp.importedAt,
        employeeName: imp.user.name,
        employeeId: imp.user.employeeId,
      })),
    };
  }

  private calculateEvolutionData(movements: any[]) {
    // Agrupa movimentações por mês
    const monthlyData: Record<string, number> = {};
    let runningBalance = 0;

    movements.forEach(movement => {
      const month = new Date(movement.referenceDate).toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = runningBalance;
      }
      runningBalance += movement.type === 'ENTRY' 
        ? movement.hours.toNumber() 
        : -movement.hours.toNumber();
      monthlyData[month] = runningBalance;
    });

    return Object.entries(monthlyData).map(([month, balance]) => ({
      month,
      balance,
    }));
  }
}



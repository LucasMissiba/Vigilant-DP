import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class HourBalanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findOrCreateBalance(userId: string) {
    let balance = await this.prisma.hourBalance.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!balance) {
      balance = await this.prisma.hourBalance.create({
        data: {
          userId,
          balance: new Decimal(0),
          status: 'NORMAL',
        },
      });
    }

    return balance;
  }

  async getBalance(userId: string) {
    const balance = await this.findOrCreateBalance(userId);
    
    // Atualiza status baseado no saldo
    const updatedBalance = await this.updateBalanceStatus(balance.id);

    return {
      ...updatedBalance,
      balance: updatedBalance.balance.toNumber(),
    };
  }

  async addHours(userId: string, hours: number, description: string, metadata?: any) {
    const balance = await this.findOrCreateBalance(userId);
    const newBalance = new Decimal(balance.balance.toNumber() + hours);

    const updatedBalance = await this.prisma.hourBalance.update({
      where: { id: balance.id },
      data: {
        balance: newBalance,
      },
    });

    await this.prisma.balanceMovement.create({
      data: {
        hourBalanceId: balance.id,
        type: 'ENTRY',
        hours: new Decimal(hours),
        description,
        referenceDate: new Date(),
        metadata: metadata || {},
      },
    });

    // Verifica alertas
    await this.checkAlerts(userId, updatedBalance);

    return updatedBalance;
  }

  async subtractHours(userId: string, hours: number, description: string, metadata?: any) {
    const balance = await this.findOrCreateBalance(userId);
    const newBalance = new Decimal(balance.balance.toNumber() - hours);

    const updatedBalance = await this.prisma.hourBalance.update({
      where: { id: balance.id },
      data: {
        balance: newBalance,
      },
    });

    await this.prisma.balanceMovement.create({
      data: {
        hourBalanceId: balance.id,
        type: 'EXIT',
        hours: new Decimal(hours),
        description,
        referenceDate: new Date(),
        metadata: metadata || {},
      },
    });

    await this.checkAlerts(userId, updatedBalance);

    return updatedBalance;
  }

  async getHistory(userId: string, limit = 50) {
    const balance = await this.findOrCreateBalance(userId);

    return this.prisma.balanceMovement.findMany({
      where: { hourBalanceId: balance.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  private async updateBalanceStatus(balanceId: string) {
    const balance = await this.prisma.hourBalance.findUnique({
      where: { id: balanceId },
    });

    if (!balance) {
      throw new NotFoundException('Saldo não encontrado');
    }

    const balanceValue = balance.balance.toNumber();
    let status = 'NORMAL';

    // Define status baseado no saldo e validade
    if (balance.validUntil && new Date() > balance.validUntil) {
      status = 'EXPIRED';
    } else if (balanceValue > 40) { // Exemplo: crítico acima de 40h
      status = 'CRITICAL';
    } else if (balanceValue > 30) { // Exemplo: aviso acima de 30h
      status = 'WARNING';
    }

    return this.prisma.hourBalance.update({
      where: { id: balanceId },
      data: { status: status as any },
    });
  }

  private async checkAlerts(userId: string, balance: any) {
    const balanceValue = balance.balance.toNumber();

    // Alerta crítico (80% do limite legal - exemplo: 40h)
    if (balanceValue >= 32) {
      await this.notificationsService.createAlert({
        userId,
        type: 'BALANCE_CRITICAL',
        title: 'Saldo Crítico de Horas',
        message: `Seu saldo de horas está crítico: ${balanceValue.toFixed(2)}h. Ação imediata necessária.`,
        severity: 'CRITICAL',
      });
    } else if (balanceValue >= 24) {
      await this.notificationsService.createAlert({
        userId,
        type: 'BALANCE_WARNING',
        title: 'Saldo de Horas Elevado',
        message: `Seu saldo de horas está alto: ${balanceValue.toFixed(2)}h. Considere usar ou compensar.`,
        severity: 'HIGH',
      });
    }
  }
}


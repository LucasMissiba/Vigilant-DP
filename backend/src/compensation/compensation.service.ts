import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HourBalanceService } from '../hour-balance/hour-balance.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCompensationDto, ApproveCompensationDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CompensationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hourBalanceService: HourBalanceService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createDto: CreateCompensationDto, userId: string) {
    const balance = await this.hourBalanceService.getBalance(userId);
    
    if (balance.balance < createDto.requestedHours) {
      throw new BadRequestException('Saldo insuficiente para compensação');
    }

    const compensation = await this.prisma.compensation.create({
      data: {
        ...createDto,
        userId,
        hourBalanceId: balance.id,
        requestedBy: userId,
        compensationDate: new Date(createDto.compensationDate),
      },
    });

    // Notifica gestor
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.managerId) {
      await this.notificationsService.createNotification({
        userId: user.managerId,
        type: 'COMPENSATION_REQUEST',
        title: 'Nova Solicitação de Compensação',
        message: `${user.name} solicitou compensação de ${createDto.requestedHours}h`,
        metadata: { compensationId: compensation.id },
      });
    }

    return compensation;
  }

  async approve(id: string, approveDto: ApproveCompensationDto, approverId: string) {
    const compensation = await this.prisma.compensation.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!compensation) {
      throw new NotFoundException('Compensação não encontrada');
    }

    if (compensation.status !== 'PENDING') {
      throw new BadRequestException('Compensação já foi processada');
    }

    // Subtrai horas do saldo
    await this.hourBalanceService.subtractHours(
      compensation.userId,
      compensation.requestedHours.toNumber(),
      `Compensação aprovada - ${compensation.reason || 'Sem motivo'}`,
      { compensationId: id },
    );

    const updated = await this.prisma.compensation.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: approverId,
        approvedAt: new Date(),
      },
    });

    await this.notificationsService.createNotification({
      userId: compensation.userId,
      type: 'COMPENSATION_APPROVED',
      title: 'Compensação Aprovada',
      message: `Sua solicitação de compensação de ${compensation.requestedHours}h foi aprovada`,
    });

    return updated;
  }

  async reject(id: string, reason: string, rejectorId: string) {
    const compensation = await this.prisma.compensation.findUnique({
      where: { id },
    });

    if (!compensation) {
      throw new NotFoundException('Compensação não encontrada');
    }

    const updated = await this.prisma.compensation.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: rejectorId,
        rejectionReason: reason,
      },
    });

    await this.notificationsService.createNotification({
      userId: compensation.userId,
      type: 'COMPENSATION_REJECTED',
      title: 'Compensação Rejeitada',
      message: `Sua solicitação de compensação foi rejeitada. Motivo: ${reason}`,
    });

    return updated;
  }

  async scheduleForcedCompensation(userId: string, hours: number, date: Date, scheduledBy: string) {
    const balance = await this.hourBalanceService.getBalance(userId);
    
    if (balance.balance < hours) {
      throw new BadRequestException('Saldo insuficiente para compensação forçada');
    }

    const compensation = await this.prisma.compensation.create({
      data: {
        userId,
        hourBalanceId: balance.id,
        requestedHours: new Decimal(hours),
        compensationDate: date,
        status: 'SCHEDULED',
        requestedBy: scheduledBy,
        reason: 'Compensação forçada pelo DP/RH',
      },
    });

    await this.notificationsService.createNotification({
      userId,
      type: 'FORCED_COMPENSATION',
      title: 'Compensação Agendada',
      message: `Uma compensação de ${hours}h foi agendada para ${date.toLocaleDateString('pt-BR')}`,
    });

    return compensation;
  }

  async findAll(userId?: string, status?: string) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    return this.prisma.compensation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}




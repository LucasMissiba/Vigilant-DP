import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
}

export interface CreateAlertData {
  userId?: string;
  teamId?: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  metadata?: any;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(data: CreateNotificationData) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || {},
      },
    });
  }

  async createAlert(data: CreateAlertData) {
    return this.prisma.alert.create({
      data: {
        userId: data.userId,
        teamId: data.teamId,
        type: data.type,
        title: data.title,
        message: data.message,
        severity: data.severity,
        metadata: data.metadata || {},
      },
    });
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) where.read = false;

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUserAlerts(userId: string, unreadOnly = false) {
    const where: any = {
      OR: [
        { userId },
        { teamId: userId }, // Se for gestor, pode receber alertas da equipe
      ],
    };
    if (unreadOnly) where.read = false;

    return this.prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAlertAsRead(alertId: string) {
    return this.prisma.alert.update({
      where: { id: alertId },
      data: { read: true, readAt: new Date() },
    });
  }
}




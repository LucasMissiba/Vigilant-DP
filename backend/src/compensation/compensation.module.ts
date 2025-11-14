import { Module } from '@nestjs/common';
import { CompensationController } from './compensation.controller';
import { CompensationService } from './compensation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HourBalanceModule } from '../hour-balance/hour-balance.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, HourBalanceModule, NotificationsModule],
  controllers: [CompensationController],
  providers: [CompensationService],
})
export class CompensationModule {}




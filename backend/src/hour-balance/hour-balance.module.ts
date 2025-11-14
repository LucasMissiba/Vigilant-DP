import { Module } from '@nestjs/common';
import { HourBalanceController } from './hour-balance.controller';
import { HourBalanceService } from './hour-balance.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [HourBalanceController],
  providers: [HourBalanceService],
  exports: [HourBalanceService],
})
export class HourBalanceModule {}




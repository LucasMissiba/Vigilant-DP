import { Module } from '@nestjs/common';
import { TimeClockController } from './time-clock.controller';
import { TimeClockService } from './time-clock.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RulesModule } from '../rules/rules.module';
import { HourBalanceModule } from '../hour-balance/hour-balance.module';

@Module({
  imports: [PrismaModule, RulesModule, HourBalanceModule],
  controllers: [TimeClockController],
  providers: [TimeClockService],
  exports: [TimeClockService],
})
export class TimeClockModule {}




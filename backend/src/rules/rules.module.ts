import { Module } from '@nestjs/common';
import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';
import { RuleEngine } from './rule-engine.service';
import { CLTRuleStrategy } from './strategies/clt-rule.strategy';
import { CCTRuleStrategy } from './strategies/cct-rule.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [RulesController],
  providers: [RulesService, RuleEngine, CLTRuleStrategy, CCTRuleStrategy],
  exports: [RuleEngine, RulesService],
})
export class RulesModule {}


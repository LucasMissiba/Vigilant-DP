import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRuleDto, UpdateRuleDto, SimulateRuleDto } from './dto';
import { RuleEngine } from './rule-engine.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class RulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ruleEngine: RuleEngine,
    @Inject(forwardRef(() => AuditService))
    private readonly auditService: AuditService,
  ) {}

  async findAll(active?: boolean) {
    const where = active !== undefined ? { isActive: active } : {};
    return this.prisma.rule.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const rule = await this.prisma.rule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException(`Regra com ID ${id} não encontrada`);
    }

    return rule;
  }

  async create(createRuleDto: CreateRuleDto, userId?: string) {
    const rule = await this.prisma.rule.create({
      data: {
        ...createRuleDto,
        createdBy: userId || 'system',
      },
    });

    await this.auditService.log({
      userId,
      action: 'CREATE' as any,
      entityType: 'Rule',
      entityId: rule.id,
      description: `Regra ${rule.name} criada`,
    });

    return rule;
  }

  async update(id: string, updateRuleDto: UpdateRuleDto, userId?: string) {
    const existingRule = await this.findOne(id);

    const rule = await this.prisma.rule.update({
      where: { id },
      data: updateRuleDto,
    });

    await this.auditService.log({
      userId,
      action: 'UPDATE' as any,
      entityType: 'Rule',
      entityId: rule.id,
      description: `Regra ${rule.name} atualizada`,
      changes: {
        before: existingRule,
        after: rule,
      },
    });

    return rule;
  }

  async remove(id: string, userId?: string) {
    const rule = await this.findOne(id);

    await this.prisma.rule.update({
      where: { id },
      data: { isActive: false },
    });

    await this.auditService.log({
      userId,
      action: 'DELETE' as any,
      entityType: 'Rule',
      entityId: rule.id,
      description: `Regra ${rule.name} desativada`,
    });

    return { message: 'Regra desativada com sucesso' };
  }

  async simulate(simulateDto: SimulateRuleDto) {
    const { timeClockData, config, ruleCode } = simulateDto;

    const result = await this.ruleEngine.simulateRule(
      {
        ...timeClockData,
        date: new Date(timeClockData.date),
        entry1: timeClockData.entry1 ? new Date(timeClockData.entry1) : undefined,
        exit1: timeClockData.exit1 ? new Date(timeClockData.exit1) : undefined,
        entry2: timeClockData.entry2 ? new Date(timeClockData.entry2) : undefined,
        exit2: timeClockData.exit2 ? new Date(timeClockData.exit2) : undefined,
        entry3: timeClockData.entry3 ? new Date(timeClockData.entry3) : undefined,
        exit3: timeClockData.exit3 ? new Date(timeClockData.exit3) : undefined,
      },
      config,
      ruleCode,
    );

    return result;
  }
}


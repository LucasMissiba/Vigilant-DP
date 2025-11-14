import { Injectable } from '@nestjs/common';
import { RuleStrategy, TimeClockData, RuleConfig, ExtraHoursResult } from './interfaces/rule-strategy.interface';
import { CLTRuleStrategy } from './strategies/clt-rule.strategy';
import { CCTRuleStrategy } from './strategies/cct-rule.strategy';

/**
 * Context do Strategy Pattern
 * Gerencia qual regra aplicar baseado na configuração
 */
@Injectable()
export class RuleEngine {
  private strategies: Map<string, RuleStrategy> = new Map();

  constructor(
    private readonly cltRule: CLTRuleStrategy,
    private readonly cctRule: CCTRuleStrategy,
  ) {
    // Registra todas as estratégias disponíveis
    this.registerStrategy(cltRule);
    this.registerStrategy(cctRule);
  }

  /**
   * Registra uma nova estratégia de regra
   */
  registerStrategy(strategy: RuleStrategy): void {
    this.strategies.set(strategy.getCode(), strategy);
  }

  /**
   * Calcula horas extras aplicando todas as regras relevantes
   */
  async calculateExtraHours(
    timeClock: TimeClockData,
    config: RuleConfig,
  ): Promise<ExtraHoursResult> {
    // Ordena estratégias por prioridade (CCT primeiro, depois CLT)
    const applicableStrategies = Array.from(this.strategies.values())
      .filter(strategy => strategy.canApply(timeClock, config))
      .sort((a, b) => {
        // CCT tem prioridade sobre CLT
        if (a.getCode() === 'CCT_CUSTOM') return -1;
        if (b.getCode() === 'CCT_CUSTOM') return 1;
        return 0;
      });

    if (applicableStrategies.length === 0) {
      // Fallback para CLT padrão
      return this.cltRule.calculateExtraHours(timeClock, config);
    }

    // Aplica a primeira estratégia aplicável (maior prioridade)
    const primaryStrategy = applicableStrategies[0];
    return primaryStrategy.calculateExtraHours(timeClock, config);
  }

  /**
   * Simula o impacto de uma nova regra antes de aplicá-la
   */
  async simulateRule(
    timeClock: TimeClockData,
    config: RuleConfig,
    ruleCode?: string,
  ): Promise<ExtraHoursResult> {
    if (ruleCode && this.strategies.has(ruleCode)) {
      const strategy = this.strategies.get(ruleCode)!;
      return strategy.calculateExtraHours(timeClock, config);
    }

    return this.calculateExtraHours(timeClock, config);
  }
}




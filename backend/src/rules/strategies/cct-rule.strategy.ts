import { Injectable } from '@nestjs/common';
import { RuleStrategy, TimeClockData, RuleConfig, ExtraHoursResult } from '../interfaces/rule-strategy.interface';
import { CLTRuleStrategy } from './clt-rule.strategy';

/**
 * Regra CCT customizada
 * Permite configuração específica da Convenção Coletiva
 */
@Injectable()
export class CCTRuleStrategy implements RuleStrategy {
  getCode(): string {
    return 'CCT_CUSTOM';
  }

  canApply(timeClock: TimeClockData, config: RuleConfig): boolean {
    // Aplica se houver regras CCT configuradas
    return !!config.cctRules && Object.keys(config.cctRules).length > 0;
  }

  calculateExtraHours(timeClock: TimeClockData, config: RuleConfig): ExtraHoursResult {
    // Usa a regra CLT como base
    const cltRule = new CLTRuleStrategy();
    const baseResult = cltRule.calculateExtraHours(timeClock, config);

    // Aplica modificações específicas da CCT
    if (config.cctRules) {
      // Exemplo: CCT pode ter adicional diferente
      if (config.cctRules.extraHourMultiplier) {
        // Ajusta o multiplicador
      }

      // Exemplo: CCT pode ter regras específicas para feriados
      if (config.cctRules.holidayRules) {
        // Aplica regras específicas
      }
    }

    return {
      ...baseResult,
      appliedRules: [...baseResult.appliedRules, this.getCode()],
    };
  }
}



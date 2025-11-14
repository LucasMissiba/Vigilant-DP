import { Injectable } from '@nestjs/common';
import { RuleStrategy, TimeClockData, RuleConfig, ExtraHoursResult } from '../interfaces/rule-strategy.interface';

/**
 * Regra padrão CLT
 * Implementa o cálculo básico conforme CLT
 */
@Injectable()
export class CLTRuleStrategy implements RuleStrategy {
  getCode(): string {
    return 'CLT_STANDARD';
  }

  canApply(timeClock: TimeClockData, config: RuleConfig): boolean {
    // Regra CLT sempre pode ser aplicada como base
    return true;
  }

  calculateExtraHours(timeClock: TimeClockData, config: RuleConfig): ExtraHoursResult {
    const standardHoursPerDay = config.standardHoursPerDay || 8;
    const extraHourMultiplier = config.extraHourMultiplier || 1.5;
    const nightHourMultiplier = config.nightHourMultiplier || 1.2;
    const holidayMultiplier = config.holidayMultiplier || 2.0;

    // Calcula horas trabalhadas no dia
    const workedHours = this.calculateWorkedHours(timeClock);
    
    // Horas regulares (até o limite padrão)
    const regularHours = Math.min(workedHours, standardHoursPerDay);
    
    // Horas extras (acima do padrão)
    const extraHours = Math.max(0, workedHours - standardHoursPerDay);
    
    // Horas noturnas (22h às 5h)
    const nightHours = this.calculateNightHours(timeClock);
    
    // Horas em feriado
    const holidayHours = timeClock.isHoliday ? workedHours : 0;

    const breakdown = [{
      date: timeClock.date,
      regularHours,
      extraHours,
      nightHours,
      holidayHours,
    }];

    return {
      totalHours: workedHours,
      extraHours,
      nightHours,
      holidayHours,
      appliedRules: [this.getCode()],
      breakdown,
    };
  }

  private calculateWorkedHours(timeClock: TimeClockData): number {
    let totalMinutes = 0;

    if (timeClock.entry1 && timeClock.exit1) {
      totalMinutes += this.getMinutesDifference(timeClock.entry1, timeClock.exit1);
    }
    if (timeClock.entry2 && timeClock.exit2) {
      totalMinutes += this.getMinutesDifference(timeClock.entry2, timeClock.exit2);
    }
    if (timeClock.entry3 && timeClock.exit3) {
      totalMinutes += this.getMinutesDifference(timeClock.entry3, timeClock.exit3);
    }

    return totalMinutes / 60; // Converte para horas
  }

  private calculateNightHours(timeClock: TimeClockData): number {
    let nightMinutes = 0;
    const nightStart = 22; // 22h
    const nightEnd = 5; // 5h

    const checkNightHours = (entry: Date, exit: Date) => {
      const entryHour = entry.getHours();
      const exitHour = exit.getHours();

      // Se atravessou a meia-noite
      if (exitHour < entryHour || (entryHour >= nightStart && exitHour <= nightEnd)) {
        // Calcula horas noturnas (simplificado)
        const nightMinutesInPeriod = this.getMinutesDifference(entry, exit);
        nightMinutes += nightMinutesInPeriod;
      } else if (entryHour >= nightStart || exitHour <= nightEnd) {
        // Parcialmente no período noturno
        const nightMinutesInPeriod = this.getMinutesDifference(entry, exit);
        nightMinutes += nightMinutesInPeriod * 0.5; // Aproximação
      }
    };

    if (timeClock.entry1 && timeClock.exit1) {
      checkNightHours(timeClock.entry1, timeClock.exit1);
    }
    if (timeClock.entry2 && timeClock.exit2) {
      checkNightHours(timeClock.entry2, timeClock.exit2);
    }
    if (timeClock.entry3 && timeClock.exit3) {
      checkNightHours(timeClock.entry3, timeClock.exit3);
    }

    return nightMinutes / 60;
  }

  private getMinutesDifference(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / (1000 * 60);
  }
}



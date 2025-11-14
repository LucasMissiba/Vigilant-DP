// Strategy Pattern para Motor de Regras
// Interface base para todas as regras de cálculo

export interface RuleStrategy {
  /**
   * Calcula horas extras baseado na regra específica
   * @param timeClock Dados do ponto eletrônico
   * @param config Configuração específica da regra
   * @returns Horas extras calculadas
   */
  calculateExtraHours(timeClock: TimeClockData, config: RuleConfig): ExtraHoursResult;

  /**
   * Valida se a regra pode ser aplicada ao contexto
   * @param timeClock Dados do ponto eletrônico
   * @param config Configuração específica da regra
   * @returns true se a regra pode ser aplicada
   */
  canApply(timeClock: TimeClockData, config: RuleConfig): boolean;

  /**
   * Retorna o código único da regra
   */
  getCode(): string;
}

export interface TimeClockData {
  date: Date;
  entry1?: Date;
  exit1?: Date;
  entry2?: Date;
  exit2?: Date;
  entry3?: Date;
  exit3?: Date;
  isHoliday?: boolean;
  isWeekend?: boolean;
  userId: string;
}

export interface RuleConfig {
  // Configurações CLT
  standardHoursPerDay?: number; // Padrão: 8 horas
  standardHoursPerWeek?: number; // Padrão: 44 horas
  
  // Adicionais
  extraHourMultiplier?: number; // Padrão: 1.5 (50%)
  nightHourMultiplier?: number; // Padrão: 1.2 (20%)
  holidayMultiplier?: number; // Padrão: 2.0 (100%)
  
  // Limites
  maxExtraHoursPerDay?: number;
  maxExtraHoursPerWeek?: number;
  maxExtraHoursPerMonth?: number;
  
  // DSR (Descanso Semanal Remunerado)
  dsrOnExtraHours?: boolean; // Se DSR incide sobre horas extras
  
  // Configurações CCT específicas
  cctRules?: Record<string, any>;
  
  // Intervalos
  lunchBreakDuration?: number; // Em minutos
  minimumIntervalBetweenJourneys?: number; // Em horas
}

export interface ExtraHoursResult {
  totalHours: number;
  extraHours: number;
  nightHours: number;
  holidayHours: number;
  dsrHours?: number;
  appliedRules: string[];
  metadata?: any; // Dados adicionais da importação
  breakdown: {
    date: Date;
    regularHours: number;
    extraHours: number;
    nightHours: number;
    holidayHours: number;
  }[];
}




export const DEFAULTS = {
  discount_rate: 0.1,
  terminal_growth: 0.03,
  phase1_years: 5,
  holding_years: 10,
  matrix_steps: 5,
  growth_mid: 0.08,
  growth_spread: 0.04,
  pe_band: { low: 8, mid: 12, high: 18 }
};

export const COLORS = {
  return_great: '#2E7D32',
  return_good: '#66BB6A',
  return_ok: '#FDD835',
  return_weak: '#EF9A9A',
  return_bad: '#C62828',
  override: '#FF8F00',
  baseline: '#1565C0'
};

export const LABELS = {
  div_contribution: '股息贡献',
  growth_contribution: '增长贡献',
  val_contribution: '估值变动',
  dcf_floor: '保守底线',
  below_floor: '低于底线',
  near_floor: '接近底线',
  above_floor: '高于底线'
};

export const PARAM_FIELDS = [
  ['price', '当前股价', 1, ''],
  ['eps', '当前 EPS', 1, ''],
  ['dps', 'TTM 股息', 1, ''],
  ['growth_low', '增长率下限', 100, '%'],
  ['growth_high', '增长率上限', 100, '%'],
  ['phase1_years', '第一阶段年数', 1, '年'],
  ['exit_pe', '退出 PE', 1, 'x'],
  ['tax_rate', '股息税率', 100, '%']
];

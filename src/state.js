import { DEFAULTS } from './constants.js';

const KEY = 'bv_overrides';
const today = () => new Date().toISOString().slice(0, 10);
const has = (value) => value !== undefined && value !== null;
const pick = (...values) => values.find(has);
const sourceOf = (manual, auto, fallback) => (has(manual) ? 'manual' : auto || fallback);

export const appState = {
  symbol: null,
  marketData: null,
  industryPe: null,
  config: null,
  overrides: {},
  params: null,
  result: null
};

export function loadOverrides() {
  try { appState.overrides = JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { appState.overrides = {}; }
  return appState.overrides;
}

export function saveOverrides(symbol, overrides) {
  if (!symbol) return {};
  appState.overrides[symbol] = { ...(appState.overrides[symbol] || {}), ...overrides, updated: today() };
  try { localStorage.setItem(KEY, JSON.stringify(appState.overrides)); } catch {}
  return appState.overrides[symbol];
}

export function resolveParams(symbol) {
  const config = appState.config || {};
  const market = symbol ? appState.marketData?.[symbol] || {} : {};
  const manual = symbol ? appState.overrides?.[symbol] || {} : {};
  const band = appState.industryPe?.[market.sector] || appState.industryPe?._default || config.industry_default || DEFAULTS.pe_band;
  const growthMid = pick(manual.growth_mid, market.growth_rate_3y, config.growth_mid, DEFAULTS.growth_mid);
  const spread = pick(config.growth_spread, DEFAULTS.growth_spread);
  const params = {
    symbol: symbol || 'CUSTOM',
    name: market.name || '手动估值',
    sector: market.sector || null,
    price: pick(manual.price, market.price, config.price, 0),
    eps: pick(manual.eps, market.eps, config.eps, 1),
    dps: pick(manual.dps, market.dividendPerShareTtm, config.dps, 0),
    growth_low: pick(manual.growth_low, growthMid - spread, 0),
    growth_high: pick(manual.growth_high, growthMid + spread, 0.1),
    phase1_years: pick(manual.phase1_years, config.phase1_years, DEFAULTS.phase1_years),
    holding_years: pick(manual.holding_years, config.holding_years, DEFAULTS.holding_years),
    terminal_growth: pick(manual.terminal_growth, config.terminal_growth, DEFAULTS.terminal_growth),
    exit_pe: pick(manual.exit_pe, band.mid, config.industry_default?.mid, DEFAULTS.pe_band.mid),
    tax_rate: pick(manual.tax_rate, config.tax_rate, 0),
    pe_band: band
  };
  appState.symbol = params.symbol;
  appState.params = params;
  return {
    params,
    sources: {
      price: sourceOf(manual.price, market.price !== undefined ? 'market' : null, 'default'),
      eps: has(manual.eps) ? 'manual' : market.eps_source || 'default',
      dps: has(manual.dps) ? 'manual' : market.dividendSource || 'default',
      growth_low: sourceOf(manual.growth_low, market.growth_source, 'default'),
      growth_high: sourceOf(manual.growth_high, market.growth_source, 'default'),
      phase1_years: sourceOf(manual.phase1_years, null, 'default'),
      exit_pe: sourceOf(manual.exit_pe, market.sector ? 'industry' : null, 'default'),
      tax_rate: sourceOf(manual.tax_rate, null, 'default')
    }
  };
}

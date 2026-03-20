import { DEFAULTS } from './constants.js';
import { loadMarketData, loadIndustryPe, loadConfig, lookupIndustryPe } from './data.js';
import { annualizedReturn, dcfFloor, floorPosition, sensitivityMatrix, linspace } from './formulas.js';
import { renderHeader, renderReturnRange, renderBreakdown, renderDcfFloor, renderMatrix, renderParamsPanel } from './render.js';
import { appState, loadOverrides, resolveParams, saveOverrides } from './state.js';
import { handleSymbolInput, handleParamChange, resetOverride, toggleParamsPanel } from './ui.js';

const midpoint = (low, high) => (low + high) / 2;
const labels = (values, unit) => values.map((value) => `${(unit === '%' ? value * 100 : value).toFixed(1).replace(/\.0$/, '')}${unit}`);
const nearestIndex = (values, target) => values.reduce((best, value, index) => {
  return Math.abs(value - target) < Math.abs(values[best] - target) ? index : best;
}, 0);

function recalculate(symbol = appState.symbol) {
  const { params, sources } = resolveParams(symbol);
  params.pe_band = lookupIndustryPe(params.sector, appState.industryPe) || params.pe_band;
  const g1 = midpoint(params.growth_low, params.growth_high);
  const band = params.pe_band;
  const baseParams = {
    ...params,
    g2: params.terminal_growth,
    n1: params.phase1_years,
    years: params.holding_years,
    taxRate: params.tax_rate
  };
  const growthRange = linspace(params.growth_low, params.growth_high, appState.config.matrix_steps || DEFAULTS.matrix_steps);
  const peRange = linspace(band.low, band.high, appState.config.matrix_steps || DEFAULTS.matrix_steps);
  const low = annualizedReturn({ ...baseParams, g1: params.growth_low, exitPe: band.low }).annualized;
  const mid = annualizedReturn({ ...baseParams, g1, exitPe: params.exit_pe }).annualized;
  const high = annualizedReturn({ ...baseParams, g1: params.growth_high, exitPe: band.high }).annualized;
  const base = annualizedReturn({ ...baseParams, g1, exitPe: params.exit_pe });
  const floor = dcfFloor(params.eps, g1, params.terminal_growth, params.phase1_years);
  const matrix = sensitivityMatrix(baseParams, growthRange, peRange);
  appState.result = { low, mid, high, base, floor, matrix };
  renderHeader(params);
  renderReturnRange(low, mid, high);
  renderBreakdown(base.divContrib, base.growthContrib, base.valContrib);
  renderDcfFloor(params.price, floor, floorPosition(params.price, floor));
  renderMatrix(matrix, labels(growthRange, '%'), labels(peRange, 'x'), nearestIndex(growthRange, g1), nearestIndex(peRange, params.exit_pe));
  renderParamsPanel(params, sources);
}

function bindEvents() {
  document.querySelector('[data-role="symbol-form"]').addEventListener('submit', (event) => {
    event.preventDefault();
    recalculate(handleSymbolInput(document.querySelector('[data-role="symbol-input"]').value) || appState.symbol);
  });
  document.querySelector('[data-role="toggle-params"]').addEventListener('click', () => toggleParamsPanel());
  document.querySelector('[data-role="params-panel"]').addEventListener('input', (event) => {
    const target = event.target;
    if (!target.matches('[data-field]')) return;
    const next = handleParamChange(target.dataset.field, target.value, target.dataset.scale);
    if (!next) return;
    saveOverrides(appState.symbol, { [next.field]: next.value });
    recalculate(appState.symbol);
  });
  document.querySelector('[data-role="params-panel"]').addEventListener('click', (event) => {
    const field = event.target.dataset.reset;
    if (!field) return;
    const current = { ...(appState.overrides[appState.symbol] || {}) };
    delete current[resetOverride(field)];
    appState.overrides[appState.symbol] = current;
    localStorage.setItem('bv_overrides', JSON.stringify(appState.overrides));
    recalculate(appState.symbol);
  });
}

async function boot() {
  const [marketData, industryPe, config] = await Promise.all([loadMarketData(), loadIndustryPe(), loadConfig()]);
  appState.marketData = marketData;
  appState.industryPe = industryPe;
  appState.config = { ...config, matrix_steps: config.matrix_steps || DEFAULTS.matrix_steps };
  loadOverrides();
  bindEvents();
  const symbol = new URLSearchParams(window.location.search).get('symbol') || config.defaultSymbol || Object.keys(marketData)[0] || 'CUSTOM';
  document.querySelector('[data-role="symbol-input"]').value = symbol;
  recalculate(handleSymbolInput(symbol));
}

boot();

import { COLORS, LABELS, PARAM_FIELDS } from './constants.js';

const $ = (role) => document.querySelector(`[data-role="${role}"]`);
const fmtPct = (value) => `${(value * 100).toFixed(1)}%`;
const fmtNum = (value) => Number(value).toFixed(2).replace(/\.00$/, '');
const sourceText = (value) => ({ market: 'market.json', industry: 'industry_pe.json' }[value] || value);

export function renderHeader(params) {
  $('symbol-name').textContent = `${params.name} · ${params.symbol}`;
  $('symbol-price').textContent = `当前价格 ${fmtNum(params.price)}${params.sector ? ` · ${params.sector}` : ''}`;
}

export function renderReturnRange(low, mid, high) {
  $('return-range').innerHTML = `
    <div class="return-range">
      <span class="edge">${fmtPct(low)}</span>
      <span class="mid">基准 ${fmtPct(mid)}</span>
      <span class="edge">${fmtPct(high)}</span>
    </div>`;
}

export function renderBreakdown(divContrib, growthContrib, valContrib) {
  const parts = [
    [LABELS.div_contribution, divContrib, '#6aa84f'],
    [LABELS.growth_contribution, growthContrib, '#4fc3f7'],
    [LABELS.val_contribution, valContrib, '#f6b26b']
  ];
  $('breakdown').innerHTML = `<div class="breakdown-bar">${parts.map(([label, value, color]) => `
    <div class="segment" style="background:${color};flex:${Math.max(Math.abs(value), 0.02)}">
      <strong>${label}</strong><span>${fmtPct(value)}</span>
    </div>`).join('')}</div>`;
}

export function renderDcfFloor(price, floor, position) {
  const map = {
    below: [LABELS.below_floor, COLORS.return_great],
    near: [LABELS.near_floor, COLORS.return_ok],
    above: [LABELS.above_floor, COLORS.return_weak]
  };
  const [label, color] = map[position];
  $('dcf-floor').innerHTML = `
    <div class="floor">
      <strong>${LABELS.dcf_floor} ${fmtNum(floor)}</strong>
      <span>当前价格 ${fmtNum(price)}</span>
      <span class="badge" style="background:${color}">${label}</span>
    </div>`;
}

export function renderMatrix(matrix, growthLabels, peLabels, baseRow, baseCol) {
  const head = peLabels.map((label) => `<th>${label}</th>`).join('');
  const rows = matrix.map((row, rowIndex) => `<tr><th>${growthLabels[rowIndex]}</th>${row.map((rate, colIndex) => {
    const baseline = rowIndex === baseRow && colIndex === baseCol ? 'baseline' : '';
    return `<td class="${baseline}" style="background:${returnColor(rate)}">${fmtPct(rate)}</td>`;
  }).join('')}</tr>`).join('');
  $('matrix').innerHTML = `<table><thead><tr><th>g / PE</th>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

export function renderParamsPanel(params, sources) {
  $('params-panel').innerHTML = `${PARAM_FIELDS.map(([field, label, scale, unit]) => {
    const value = Number(params[field]) * scale;
    const manual = sources[field] === 'manual' ? 'override' : '';
    const reset = sources[field] === 'manual' ? `<button type="button" data-reset="${field}">重置</button>` : '';
    return `<div class="param-row">
      <div class="param-top"><span class="param-label"><strong class="${manual}">${label}</strong></span><span class="source">${sourceText(sources[field])}</span></div>
      <div class="param-actions"><input data-field="${field}" data-scale="${scale}" type="number" step="0.1" value="${fmtNum(value)}" /><span>${unit}</span>${reset}</div>
    </div>`;
  }).join('')}
  <div class="param-readonly">固定参数：永续增长 ${(params.terminal_growth * 100).toFixed(0)}%，持有期 ${params.holding_years} 年，DCF 折现率 10%。</div>`;
}

export function returnColor(rate) {
  if (rate >= 0.12) return COLORS.return_great;
  if (rate >= 0.08) return COLORS.return_good;
  if (rate >= 0.05) return COLORS.return_ok;
  if (rate >= 0) return COLORS.return_weak;
  return COLORS.return_bad;
}

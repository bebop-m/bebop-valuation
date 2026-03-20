const $ = (role) => document.querySelector(`[data-role="${role}"]`);
const upper = (value) => value.trim().toUpperCase();

export function handleSymbolInput(symbol) {
  return upper(symbol || '');
}

export function handleParamChange(field, value, scale = 1) {
  const next = Number(value) / Number(scale || 1);
  return Number.isFinite(next) ? { field, value: next } : null;
}

export function toggleParamsPanel(force) {
  const panel = $('params-panel');
  const open = force ?? panel.hidden;
  panel.hidden = !open;
  $('toggle-params').textContent = open ? '收起假设' : '调整假设';
  return open;
}

export function resetOverride(field) {
  return field;
}

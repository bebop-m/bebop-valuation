import { DEFAULTS } from './constants.js';

const safePow = (base, exp) => (base > 0 ? base ** exp : 0);

export function futureEps(eps0, g1, g2, n1, t) {
  if (t <= 0) return eps0;
  if (t <= n1) return eps0 * safePow(1 + g1, t);
  return futureEps(eps0, g1, g2, n1, n1) * safePow(1 + g2, t - n1);
}

export function totalDividends(dps0, eps0, g1, g2, n1, years, taxRate) {
  const payout = eps0 > 0 ? dps0 / eps0 : 0;
  return Array.from({ length: years }, (_, i) => i + 1).reduce((sum, year) => {
    const dps = futureEps(eps0, g1, g2, n1, year) * payout;
    return sum + dps * (1 - taxRate);
  }, 0);
}

export function annualizedReturn(params) {
  const { price, eps, dps, g1, g2, n1, years, exitPe, taxRate } = params;
  const dividends = totalDividends(dps, eps, g1, g2, n1, years, taxRate);
  const exitPrice = futureEps(eps, g1, g2, n1, years) * exitPe;
  const totalReturn = price > 0 ? (exitPrice + dividends) / price : 0;
  const annualized = safePow(totalReturn, 1 / years) - 1;
  const pe0 = eps > 0 ? price / eps : 0;
  const divContrib = price > 0 ? dividends / price / years : 0;
  const valContrib = pe0 > 0 ? safePow(exitPe / pe0, 1 / years) - 1 : 0;
  return {
    annualized,
    divContrib,
    valContrib,
    growthContrib: annualized - divContrib - valContrib,
    dividends,
    exitPrice
  };
}

export function dcfFloor(eps0, g1, g2, n1) {
  const r = DEFAULTS.discount_rate;
  const phase1 = Array.from({ length: n1 }, (_, i) => i + 1).reduce((sum, year) => {
    return sum + futureEps(eps0, g1, g2, n1, year) / safePow(1 + r, year);
  }, 0);
  const denom = r - g2;
  if (denom <= 0) return phase1;
  const terminal = futureEps(eps0, g1, g2, n1, n1) * (1 + g2) / denom;
  return phase1 + terminal / safePow(1 + r, n1);
}

export function sensitivityMatrix(params, growthRange, peRange) {
  return growthRange.map((g1) => peRange.map((exitPe) => {
    return annualizedReturn({ ...params, g1, exitPe }).annualized;
  }));
}

export function linspace(low, high, steps) {
  if (steps <= 1) return [low];
  const step = (high - low) / (steps - 1);
  return Array.from({ length: steps }, (_, i) => low + step * i);
}

export function floorPosition(price, floor) {
  if (price < floor) return 'below';
  if (price > floor * 1.3) return 'above';
  return 'near';
}

export async function loadMarketData() {
  const response = await fetch('./data/market.json');
  return response.json();
}

export async function loadIndustryPe() {
  const response = await fetch('./data/industry_pe.json');
  return response.json();
}

export async function loadConfig() {
  const response = await fetch('./config.json');
  return response.json();
}

export function lookupIndustryPe(sector, industryPeData) {
  return industryPeData?.[sector] || industryPeData?._default || { low: 8, mid: 12, high: 18 };
}

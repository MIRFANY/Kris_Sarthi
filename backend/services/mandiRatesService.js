const BASE_URL =
  "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24";

function isFilterAll(value) {
  if (value == null) return true;
  const s = String(value).trim();
  return s === "" || s.toLowerCase() === "all";
}

export async function getMandiRates({
  state,
  district,
  commodity,
  arrivalDate,
  limit = 50,
  offset = 0,
}) {
  const key = process.env.DATA_GOV_API_KEY;
  if (!key) throw new Error("DATA_GOV_API_KEY is not configured");

  const stateAll = isFilterAll(state);
  const districtAll = isFilterAll(district);

  const params = new URLSearchParams({
    "api-key": key,
    format: "json",
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (!stateAll) params.append("filters[State]", String(state).trim());
  if (!districtAll) params.append("filters[District]", String(district).trim());

  if (commodity) params.append("filters[Commodity]", commodity);
  if (arrivalDate) params.append("filters[Arrival_Date]", arrivalDate);

  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  const json = await res.json();

  const records = (json.records || []).map((r) => ({
    state: r.State,
    district: r.District,
    market: r.Market,
    commodity: r.Commodity,
    variety: r.Variety,
    grade: r.Grade,
    date: r.Arrival_Date,
    minPrice: Number(r.Min_Price),
    maxPrice: Number(r.Max_Price),
    modalPrice: Number(r.Modal_Price),
  }));

  return {
    total: json.total ?? records.length,
    count: json.count ?? records.length,
    records,
  };
}

/** dd-MM-yyyy for Agmarknet Arrival_Date filter */
function formatArrivalDateDdMmYyyy(d) {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function aggregateDayPrices(records) {
  if (!records || records.length === 0) return null;
  const modals = records
    .map((r) => r.modalPrice)
    .filter((n) => Number.isFinite(n));
  const mins = records.map((r) => r.minPrice).filter((n) => Number.isFinite(n));
  const maxs = records.map((r) => r.maxPrice).filter((n) => Number.isFinite(n));
  if (modals.length === 0 && mins.length === 0 && maxs.length === 0) return null;
  const modalPrice =
    modals.length > 0
      ? Math.round(modals.reduce((a, b) => a + b, 0) / modals.length)
      : null;
  const minPrice = mins.length > 0 ? Math.min(...mins) : null;
  const maxPrice = maxs.length > 0 ? Math.max(...maxs) : null;
  return { modalPrice, minPrice, maxPrice };
}

function buildRecommendation(trend) {
  const valid = trend.filter(
    (t) => t.modalPrice != null && Number.isFinite(t.modalPrice)
  );
  const best =
    valid.length === 0
      ? null
      : valid.reduce((b, t) =>
          !b || t.modalPrice > b.modalPrice ? t : b
        );

  const avg =
    valid.length > 0
      ? valid.reduce((s, t) => s + t.modalPrice, 0) / valid.length
      : 0;

  const lastTwo = trend.slice(-2);
  const m0 = lastTwo[0]?.modalPrice;
  const m1 = lastTwo[1]?.modalPrice;

  let trendLabel = "stable";
  let advice =
    "Prices are stable. This is a reasonable time to sell.";

  if (
    valid.length > 0 &&
    m0 != null &&
    m1 != null &&
    Number.isFinite(m0) &&
    Number.isFinite(m1)
  ) {
    const lastTwoAvg = (m0 + m1) / 2;
    if (lastTwoAvg > avg) {
      trendLabel = "rising";
      advice =
        "Prices are rising. Consider selling in the next 1-2 days while the trend holds.";
    } else if (lastTwoAvg < avg) {
      trendLabel = "falling";
      advice =
        "Prices are falling. If possible, wait a few days for the market to recover.";
    } else {
      trendLabel = "stable";
      advice =
        "Prices are stable. This is a reasonable time to sell.";
    }
  }

  return {
    bestDayToSell: best?.date ?? null,
    trend: trendLabel,
    advice,
  };
}

/**
 * @param {{ state: string, district: string, commodity: string }} params
 */
export async function getMandiPriceTrend({ state, district, commodity }) {
  const key = process.env.DATA_GOV_API_KEY;
  if (!key) throw new Error("DATA_GOV_API_KEY is not configured");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(formatArrivalDateDdMmYyyy(d));
  }

  const settled = await Promise.allSettled(
    dates.map((arrivalDate) =>
      getMandiRates({
        state,
        district,
        commodity,
        arrivalDate,
        limit: 100,
        offset: 0,
      })
    )
  );

  const trend = dates.map((dateStr, i) => {
    const s = settled[i];
    if (s.status !== "fulfilled") {
      return {
        date: dateStr,
        modalPrice: null,
        minPrice: null,
        maxPrice: null,
      };
    }
    const agg = aggregateDayPrices(s.value.records || []);
    if (!agg) {
      return {
        date: dateStr,
        modalPrice: null,
        minPrice: null,
        maxPrice: null,
      };
    }
    return {
      date: dateStr,
      modalPrice: agg.modalPrice,
      minPrice: agg.minPrice,
      maxPrice: agg.maxPrice,
    };
  });

  const recommendation = buildRecommendation(trend);

  return { trend, recommendation };
}

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

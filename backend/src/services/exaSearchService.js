import Exa from "exa-js";

function hostnameFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

/**
 * @param {{ commodity?: string, district?: string, state?: string }} params
 * @returns {Promise<Array<{ title: string, url: string, publishedDate: string | null, summary: string, source: string }>>}
 */
export async function searchMandiWebResults({ commodity, district, state }) {
  const key = process.env.EXA_API_KEY;
  if (!key) {
    throw new Error("EXA_API_KEY is not configured");
  }

  const c =
    commodity && String(commodity).trim() && String(commodity).toLowerCase() !== "all"
      ? String(commodity).trim()
      : "agricultural commodity";
  const d =
    district && String(district).trim() && String(district).toLowerCase() !== "all"
      ? String(district).trim()
      : "";
  const s =
    state && String(state).trim() && String(state).toLowerCase() !== "all"
      ? String(state).trim()
      : "";

  const query = `${c} mandi price today ${d} ${s} India market rate`.replace(/\s+/g, " ").trim();

  const exa = new Exa(key);
  const exaResults = await exa.searchAndContents(query, {
    type: "neural",
    numResults: 5,
    text: { maxCharacters: 800 },
    highlights: { numSentences: 3 },
  });

  const results = exaResults.results || [];

  return results.map((r) => {
    const hl = r.highlights;
    let summary = "";
    if (Array.isArray(hl)) {
      summary = hl.map((h) => (typeof h === "string" ? h : String(h))).filter(Boolean).join(" ");
    }
    if (!summary && r.text) {
      summary = String(r.text).slice(0, 600);
    }

    return {
      title: r.title || "Untitled",
      url: r.url || "",
      publishedDate: r.publishedDate ?? null,
      summary: summary.trim(),
      source: hostnameFromUrl(r.url || ""),
    };
  });
}

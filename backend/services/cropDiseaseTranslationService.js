/**
 * Maps app language codes to clear instructions for Gemini (script + language).
 */
const LANGUAGE_LABELS = {
  pa: "Punjabi in Gurmukhi script",
  en: "English",
  hi: "Hindi in Devanagari script",
  ur: "Urdu in Arabic script",
  ta: "Tamil",
};

/**
 * @param {string} raw From client (e.g. pa, en, or full name)
 */
function normalizeLanguageCode(raw) {
  const s = (raw || "en").toString().trim().toLowerCase();
  const aliases = {
    english: "en",
    punjabi: "pa",
    hindi: "hi",
    urdu: "ur",
    tamil: "ta",
  };
  if (aliases[s]) return aliases[s];
  if (LANGUAGE_LABELS[s]) return s;
  const two = s.slice(0, 2);
  if (LANGUAGE_LABELS[two]) return two;
  return "en";
}

/**
 * Uses Gemini to turn Hugging Face disease-classification output into farmer-friendly text
 * in the requested language (summary + translated crop/condition + top prediction labels).
 *
 * @param {*} ai Gemini client from `app.set("aiClient")` (GoogleGenAI)
 * @param {object} disease Result from `detectCropDiseaseFromImageBuffer`
 * @param {string} languageCode e.g. pa, en, hi, ur, ta
 * @returns {Promise<{
 *   language: string,
 *   summary: string,
 *   topCrop: string | null,
 *   topCondition: string,
 *   predictions: Array<{ originalLabel: string, label: string, confidencePercent: number }>
 * }>}
 */
export async function localizeDiseaseResultsWithGemini(ai, disease, languageCode) {
  const code = normalizeLanguageCode(languageCode);
  const targetLanguage = LANGUAGE_LABELS[code] || LANGUAGE_LABELS.en;

  const topN = (disease.predictions || []).slice(0, 8);
  const payload = {
    topLabel: disease.name,
    plant: disease.plant,
    diseaseName: disease.diseaseName,
    confidencePercent: disease.confidencePercent,
    isHealthy: disease.isHealthy,
    topPredictions: topN.map((p) => ({
      label: p.label,
      confidencePercent: p.confidencePercent,
    })),
  };

  const prompt = `You are GreenGeenie, a concise agricultural assistant for Indian farmers.

The following JSON is from a plant disease image classifier (labels often look like "Crop___Disease_name" with underscores).

INPUT JSON:
${JSON.stringify(payload, null, 2)}

TASK: Respond ONLY with valid JSON (no markdown, no code fences), using this exact shape:
{
  "summary": "2-4 short sentences explaining what this result means for the farmer in ${targetLanguage}",
  "topCrop": "crop/plant name in ${targetLanguage} or null if unknown",
  "topCondition": "disease or healthy condition in ${targetLanguage}",
  "predictions": [
    { "originalLabel": "exact string from input", "label": "same row translated/described in ${targetLanguage}", "confidencePercent": number }
  ]
}

Rules:
- Write EVERY string value in ${targetLanguage} only (except originalLabel must match input exactly).
- Include one predictions[] entry per item in topPredictions, same order, same confidencePercent numbers.
- Keep numbers as numbers; do not translate digits in confidencePercent.`;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Gemini did not return JSON for disease localization");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const predictions = Array.isArray(parsed.predictions)
    ? parsed.predictions.map((p) => ({
        originalLabel: String(p.originalLabel ?? ""),
        label: String(p.label ?? ""),
        confidencePercent:
          typeof p.confidencePercent === "number"
            ? p.confidencePercent
            : parseFloat(p.confidencePercent) || 0,
      }))
    : [];

  return {
    language: code,
    summary: String(parsed.summary || "").trim(),
    topCrop: parsed.topCrop === null || parsed.topCrop === undefined ? null : String(parsed.topCrop),
    topCondition: String(parsed.topCondition || "").trim(),
    predictions,
  };
}

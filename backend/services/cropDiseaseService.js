/**
 * Default: `linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification` — PlantVillage-style
 * classes, deployed on Hugging Face Inference API (see model card).
 *
 * `liriope/PlantDiseaseDetection` has no Inference Provider on the Hub, so hosted API calls 404.
 * Override with `HF_PLANT_DISEASE_MODEL` only if you use a model that is actually deployed.
 */
const DEFAULT_PLANT_DISEASE_MODEL =
  "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification";

function getPlantDiseaseModelId() {
  const fromEnv = process.env.HF_PLANT_DISEASE_MODEL?.trim();
  return fromEnv || DEFAULT_PLANT_DISEASE_MODEL;
}

function inferenceUrlsForModel(modelId) {
  return {
    legacy: `https://api-inference.huggingface.co/models/${modelId}`,
    router: `https://router.huggingface.co/hf-inference/models/${modelId}`,
  };
}

/**
 * POST image bytes to HF image-classification; returns parsed `{ label, score }[]`.
 * @param {string} token HF API token
 * @param {Buffer} imageBuffer
 * @param {string} url
 */
async function postImageClassification(token, imageBuffer, url) {
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
      },
      body: imageBuffer,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Network error calling ${url}: ${msg}`);
  }

  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      `Hugging Face inference returned non-JSON (${response.status}): ${text.slice(0, 500)}`
    );
  }

  if (!response.ok) {
    const msg =
      typeof parsed?.error === "string"
        ? parsed.error
        : typeof parsed?.message === "string"
          ? parsed.message
          : text?.slice(0, 300) || response.statusText;
    throw new Error(`Hugging Face inference failed (${response.status}): ${msg}`);
  }

  return parsed;
}

/**
 * Tries legacy Inference API, then router (one usually works per region/model).
 * @param {string} token
 * @param {Buffer} imageBuffer
 * @param {string} modelId
 */
async function runClassification(token, imageBuffer, modelId) {
  const { legacy, router } = inferenceUrlsForModel(modelId);
  const attempts = [
    { name: "api-inference", url: legacy },
    { name: "router", url: router },
  ];
  const errors = [];
  for (const { name, url } of attempts) {
    try {
      return await postImageClassification(token, imageBuffer, url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${name}: ${msg}`);
    }
  }
  throw new Error(errors.join(" | "));
}

/**
 * Parses a Hub label like "Tomato___Late_blight" into readable plant and condition strings.
 * @param {string} label Raw class label from the model
 * @returns {{ plant: string | null, condition: string }}
 */
function parseLabel(label) {
  if (!label || typeof label !== "string") {
    return { plant: null, condition: "Unknown" };
  }
  const trimmed = label.trim();
  const parts = trimmed.split("___");
  if (parts.length >= 2) {
    return {
      plant: parts[0].replace(/_/g, " ").trim(),
      condition: parts.slice(1).join(" ").replace(/_/g, " ").trim(),
    };
  }
  return {
    plant: null,
    condition: trimmed.replace(/_/g, " ").trim(),
  };
}

/**
 * Classifies crop/leaf images for plant diseases using the Hugging Face Inference API
 * (image classification). Labels are typically `Crop___Condition` (PlantVillage-style) or
 * similar; scores are softmax confidences in [0, 1].
 *
 * @param {Buffer} imageBuffer Raw image bytes (JPEG, PNG, or WebP)
 * @returns {Promise<{
 *   name: string,
 *   plant: string | null,
 *   diseaseName: string,
 *   confidence: number,
 *   confidencePercent: number,
 *   isHealthy: boolean,
 *   predictions: Array<{ label: string, score: number, confidence: number, confidencePercent: number }>
 * }>}
 */
export async function detectCropDiseaseFromImageBuffer(imageBuffer) {
  const token = process.env.HF_API_TOKEN;
  if (!token || !String(token).trim()) {
    throw new Error("HF_API_TOKEN is not configured");
  }

  const modelId = getPlantDiseaseModelId();
  const raw = await runClassification(token, imageBuffer, modelId);

  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("Empty response from disease detection model");
  }

  const sorted = [...raw].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const { plant, condition } = parseLabel(top.label);
  const labelLower = top.label.toLowerCase();
  const isHealthy =
    labelLower.includes("healthy") ||
    labelLower.includes("___healthy") ||
    condition.toLowerCase() === "healthy";

  const predictions = sorted.map((p) => ({
    label: p.label,
    score: p.score,
    confidence: p.score,
    confidencePercent: Math.round(p.score * 1000) / 10,
  }));

  return {
    name: top.label,
    plant,
    diseaseName: condition,
    confidence: top.score,
    confidencePercent: Math.round(top.score * 1000) / 10,
    isHealthy,
    predictions,
  };
}

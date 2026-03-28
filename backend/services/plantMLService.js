// Plant ML Detection Service
// This service handles AI-based plant and fertilizer detection

export const analyzePlantImage = async (imageBase64, ai) => {
  try {
    console.log("🔍 Analyzing plant image with Gemini Vision...");

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an expert agricultural scientist and plant pathologist. Analyze this image carefully and provide detailed information in JSON format.

IMPORTANT: First, verify if this is actually a plant/crop image. If it's NOT a plant (e.g., watch, car, person, building, food dish), flag it immediately.

Please identify:
1. Is this a plant/crop image? (yes/no with confidence 0-100)
2. If YES - Plant/Crop name with confidence (0-100)
3. Disease or condition (if visible) with severity
4. Fertilizer recommendations
5. Yield prediction
6. Water and soil requirements

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "isPlantImage": true/false,
  "plantImageConfidence": 95,
  "validationMessage": "This is a plant image" or "Warning: This appears to be [object type], not a crop/plant image",
  "detectedPlant": {
    "name": "plant name or 'Unable to identify'",
    "confidence": 85,
    "description": "brief description"
  },
  "detectedDisease": {
    "name": "disease name or 'Healthy'",
    "confidence": 90,
    "description": "disease description",
    "severity": "mild/moderate/severe"
  },
  "fertiliserRecommendation": {
    "primary": "fertilizer name",
    "quantity": "kg per acre",
    "frequency": "application frequency",
    "description": "why this fertilizer"
  },
  "predictions": {
    "yieldPrediction": "expected yield in quintals/acre",
    "waterNeeded": "water requirement in mm",
    "bestHarvestTime": "days to harvest",
    "soilRequirements": "soil type and pH"
  },
  "analysis": "detailed agricultural advice"
}`,
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const responseText = result.response.text();
    console.log("✅ Gemini Analysis Response:", responseText);

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from Gemini");
    }

    const analysisData = JSON.parse(jsonMatch[0]);
    
    // Log validation result
    if (!analysisData.isPlantImage) {
      console.warn("⚠️ Non-plant image detected:", analysisData.validationMessage);
    }
    
    return analysisData;
  } catch (error) {
    console.error("❌ Error analyzing plant image:", error);
    throw error;
  }
};

export const generateDetailedPrediction = async (detectionData, ai, language = "English") => {
  try {
    const prompt = `Based on this crop analysis:
- Plant: ${detectionData.detectedPlant.name}
- Condition: ${detectionData.detectedDisease.name}
- Recommended Fertilizer: ${detectionData.fertiliserRecommendation.primary}

Provide comprehensive farmer-friendly advice in ${language} including:
1. Immediate actions needed
2. Fertilizer application schedule
3. Pest/disease management
4. Expected yield and profit estimation
5. Market prices (if available)
6. Best practices for this crop

Keep response practical and concise.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    return result.response.text();
  } catch (error) {
    console.error("❌ Error generating prediction:", error);
    throw error;
  }
};

export const getFertilizerBudget = (detectionData) => {
  // Simple fertilizer budget calculator
  const fertilizers = {
    "NPK 10:26:26": { pricePerKg: 15, type: "phosphorus-rich" },
    "NPK 12:32:16": { pricePerKg: 18, type: "balanced" },
    "Urea": { pricePerKg: 5, type: "nitrogen" },
    "DAP": { pricePerKg: 22, type: "phosphorus" },
    "Potash": { pricePerKg: 20, type: "potassium" },
    "Organic": { pricePerKg: 8, type: "organic" },
  };

  const recommendation = detectionData.fertiliserRecommendation;
  const matched = Object.entries(fertilizers).find(([name]) =>
    recommendation.primary.toLowerCase().includes(name.toLowerCase())
  );

  if (matched) {
    const [name, { pricePerKg }] = matched;
    const quantity = parseInt(recommendation.quantity) || 50;
    return {
      fertilizer: name,
      quantity,
      totalCost: quantity * pricePerKg,
      costPerKg: pricePerKg,
    };
  }

  return null;
};

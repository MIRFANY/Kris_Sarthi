import mongoose from "mongoose";

const PlantDetectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  detectedPlant: {
    name: String,
    confidence: Number, // 0-100
    description: String,
  },
  detectedDisease: {
    name: String,
    confidence: Number,
    description: String,
    severity: {
      type: String,
      enum: ["mild", "moderate", "severe"],
    },
  },
  fertiliserRecommendation: {
    type: String, // Primary fertilizer needed
    quantity: String,
    frequency: String,
    description: String,
  },
  predictions: {
    yieldPrediction: String,
    waterNeeded: String,
    bestHarvestTime: String,
    soilRequirements: String,
  },
  aiAnalysis: {
    type: String, // Detailed Gemini AI analysis
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("PlantDetection", PlantDetectionSchema);

import express from "express";
import multer from "multer";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PlantDetection from "../models/PlantDetection.js";
import { analyzePlantImage, generateDetailedPrediction, getFertilizerBudget } from "../services/plantMLService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/plant-images");
    try {
      await fsPromises.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "plant-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
    }
  },
});

const router = express.Router();

// Upload and analyze plant image
router.post("/detect", upload.single("image"), async (req, res) => {
  try {
    const { userId, language } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    console.log("📸 Plant image uploaded:", req.file.filename);

    // Read the uploaded image and convert to base64
    const imageBuffer = await fsPromises.readFile(req.file.path);
    const imageBase64 = imageBuffer.toString("base64");

    // AI is passed from middleware/parent app
    const ai = req.app.get("aiClient");
    if (!ai) {
      return res.status(500).json({ error: "AI client not initialized" });
    }

    // Analyze image using Gemini Vision
    const analysisData = await analyzePlantImage(imageBase64, ai);

    // Generate detailed prediction
    const detailedAnalysis = await generateDetailedPrediction(
      analysisData,
      ai,
      language || "English"
    );

    // Calculate fertilizer budget
    const budget = getFertilizerBudget(analysisData);

    // Save detection results to database
    const detection = new PlantDetection({
      userId,
      imageUrl: `/uploads/plant-images/${req.file.filename}`,
      detectedPlant: analysisData.detectedPlant,
      detectedDisease: analysisData.detectedDisease,
      fertiliserRecommendation: analysisData.fertiliserRecommendation,
      predictions: analysisData.predictions,
      aiAnalysis: detailedAnalysis,
    });

    await detection.save();
    console.log("✅ Detection saved to database");

    res.json({
      success: true,
      detection: {
        id: detection._id,
        plant: analysisData.detectedPlant,
        disease: analysisData.detectedDisease,
        fertilizer: analysisData.fertiliserRecommendation,
        predictions: analysisData.predictions,
        detailedAnalysis: detailedAnalysis,
        budget: budget,
        imageUrl: detection.imageUrl,
      },
    });
  } catch (error) {
    console.error("❌ Error processing plant image:", error);

    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fsPromises.unlink(req.file.path);
      } catch (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      }
    }

    res.status(500).json({
      error: error.message || "Failed to analyze plant image",
    });
  }
});

// Get detection history
router.get("/history/:userId", async (req, res) => {
  try {
    const detections = await PlantDetection.find({
      userId: req.params.userId,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(detections);
  } catch (error) {
    console.error("❌ Error fetching detection history:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific detection
router.get("/:detectionId", async (req, res) => {
  try {
    const detection = await PlantDetection.findById(req.params.detectionId);

    if (!detection) {
      return res.status(404).json({ error: "Detection not found" });
    }

    res.json(detection);
  } catch (error) {
    console.error("❌ Error fetching detection:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete detection
router.delete("/:detectionId", async (req, res) => {
  try {
    const detection = await PlantDetection.findByIdAndDelete(
      req.params.detectionId
    );

    if (!detection) {
      return res.status(404).json({ error: "Detection not found" });
    }

    // Delete the image file
    if (detection.imageUrl) {
      try {
        const filePath = path.join(__dirname, "..", detection.imageUrl);
        await fsPromises.unlink(filePath);
      } catch (unlinkErr) {
        console.warn("Could not delete image file:", unlinkErr);
      }
    }

    res.json({ success: true, message: "Detection deleted" });
  } catch (error) {
    console.error("❌ Error deleting detection:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

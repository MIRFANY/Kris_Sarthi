import express from "express";
import multer from "multer";
import { detectCropDiseaseFromImageBuffer } from "../services/cropDiseaseService.js";
import { localizeDiseaseResultsWithGemini } from "../services/cropDiseaseTranslationService.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
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

router.post(
  "/detect-disease",
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          error: err.message || "Upload failed",
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const disease = await detectCropDiseaseFromImageBuffer(req.file.buffer);
      const language = (req.body?.language || "en").toString().trim();

      let localized = null;
      const ai = req.app.get("aiClient");
      if (ai && process.env.GEMINI_API_KEY) {
        try {
          localized = await localizeDiseaseResultsWithGemini(ai, disease, language);
        } catch (locErr) {
          console.warn("⚠️ Gemini localization skipped:", locErr.message);
        }
      }

      res.json({
        success: true,
        disease,
        ...(localized ? { localized } : {}),
      });
    } catch (error) {
      console.error("❌ Error in crop disease detection:", error);
      res.status(500).json({
        error: error.message || "Failed to detect disease",
      });
    }
  }
);

export default router;

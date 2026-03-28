import React, { useState, useRef } from "react";
import axios from "axios";

const COLORS = {
  background: "#f6fff8",
  card: "#ffffff",
  cardShadow: "0 4px 16px #b7e4c7",
  primary: "#43a047",
  primaryDark: "#2e7d32",
  accent: "#b7e4c7",
  border: "#a5d6a7",
  text: "#1b5e20",
  buttonText: "#fff",
  buttonHover: "#388e3c",
  inputBg: "#f1f8e9",
  inputBorder: "#a5d6a7",
};

function PlantImageDetection({ userId, language = "English", onDetectionComplete }) {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detection, setDetection] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
      setError(null);
      setDetection(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDetect = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("userId", userId);
      formData.append("language", language);

      const response = await axios.post(
        `${API_URL}/api/plant-detection/detect`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setDetection(response.data.detection);
        if (onDetectionComplete) {
          onDetectionComplete(response.data.detection);
        }
      }
    } catch (err) {
      console.error("Detection error:", err);
      setError(err.response?.data?.error || "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setDetection(null);
    setError(null);
  };

  return (
    <div
      style={{
        background: COLORS.background,
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "30px",
          background: COLORS.card,
          borderRadius: "12px",
          boxShadow: COLORS.cardShadow,
        }}
      >
        <h2 style={{ color: COLORS.primaryDark, marginBottom: "20px", textAlign: "center" }}>
          🌱 Plant & Fertilizer Detection
        </h2>

        {/* Image Upload Section */}
        <div style={{ marginBottom: "30px" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: "none" }}
          />

          {!imagePreview ? (
            <div
              onClick={handleUploadClick}
              style={{
                border: `2px dashed ${COLORS.border}`,
                borderRadius: "8px",
                padding: "40px",
                textAlign: "center",
                cursor: "pointer",
                background: COLORS.inputBg,
                transition: "all 0.3s ease",
                minHeight: "150px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = COLORS.accent;
                e.currentTarget.style.borderColor = COLORS.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = COLORS.inputBg;
                e.currentTarget.style.borderColor = COLORS.border;
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>📸</div>
              <p style={{ color: COLORS.text, fontSize: "16px", margin: "0" }}>
                Click to upload crop image
              </p>
              <p style={{ color: COLORS.text, fontSize: "12px", opacity: 0.7 }}>
                Or drag and drop (JPEG, PNG, WebP up to 10MB)
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "20px", textAlign: "center" }}>
                <img
                  src={imagePreview}
                  alt="Selected crop"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    borderRadius: "8px",
                    boxShadow: COLORS.cardShadow,
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleDetect}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background: loading ? "#ccc" : COLORS.primary,
                    color: COLORS.buttonText,
                    border: "none",
                    borderRadius: "6px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    fontWeight: "600",
                    transition: "background 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.background = COLORS.buttonHover;
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.currentTarget.style.background = COLORS.primary;
                  }}
                >
                  {loading ? "🔍 Analyzing..." : "🔍 Detect Plant & Analyze"}
                </button>

                <button
                  onClick={handleClear}
                  disabled={loading}
                  style={{
                    padding: "12px 20px",
                    background: "#999",
                    color: COLORS.buttonText,
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Clear
                </button>
              </div>
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div
            style={{
              background: "#ffebee",
              color: "#c62828",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "20px",
              borderLeft: `4px solid #c62828`,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Detection Results */}
        {detection && (
          <div style={{ marginTop: "30px" }}>
            <h3 style={{ color: COLORS.primaryDark, borderBottom: `2px solid ${COLORS.border}`, paddingBottom: "10px" }}>
              🎯 Detection Results
            </h3>

            {/* Plant Info */}
            <div
              style={{
                background: COLORS.inputBg,
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px",
                marginTop: "15px",
              }}
            >
              <h4 style={{ color: COLORS.primary, margin: "0 0 10px 0" }}>🌿 Plant Detected</h4>
              <p style={{ margin: "5px 0" }}>
                <strong>Type:</strong> {detection.plant.name}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Confidence:</strong> {detection.plant.confidence}%
              </p>
              <p style={{ margin: "5px 0", color: COLORS.text }}>
                {detection.plant.description}
              </p>
            </div>

            {/* Disease/Condition Info */}
            <div
              style={{
                background: COLORS.inputBg,
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px",
                borderLeft: `4px solid ${
                  detection.disease.name === "Healthy" ? COLORS.primary : "#e65100"
                }`,
              }}
            >
              <h4 style={{ color: COLORS.primaryDark, margin: "0 0 10px 0" }}>⚕️ Health Status</h4>
              <p style={{ margin: "5px 0" }}>
                <strong>Condition:</strong> {detection.disease.name}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Severity:</strong>{" "}
                <span
                  style={{
                    background:
                      detection.disease.severity === "mild"
                        ? "#c8e6c9"
                        : detection.disease.severity === "moderate"
                        ? "#fff9c4"
                        : "#ffcdd2",
                    padding: "4px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {detection.disease.severity}
                </span>
              </p>
              <p style={{ margin: "5px 0", color: COLORS.text }}>
                {detection.disease.description}
              </p>
            </div>

            {/* Fertilizer Recommendation */}
            <div
              style={{
                background: COLORS.inputBg,
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <h4 style={{ color: COLORS.primary, margin: "0 0 10px 0" }}>🌾 Fertilizer Recommendation</h4>
              <p style={{ margin: "5px 0" }}>
                <strong>Type:</strong> {detection.fertilizer.primary}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Quantity:</strong> {detection.fertilizer.quantity}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Frequency:</strong> {detection.fertilizer.frequency}
              </p>
              <p style={{ margin: "5px 0", color: COLORS.text }}>
                {detection.fertilizer.description}
              </p>

              {detection.budget && (
                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${COLORS.border}` }}>
                  <p style={{ margin: "5px 0" }}>
                    <strong>💰 Estimated Cost:</strong> ₹{detection.budget.totalCost}
                  </p>
                  <p style={{ margin: "5px 0", fontSize: "12px", color: "#666" }}>
                    ({detection.budget.quantity}kg @ ₹{detection.budget.costPerKg}/kg)
                  </p>
                </div>
              )}
            </div>

            {/* Predictions */}
            <div
              style={{
                background: COLORS.inputBg,
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <h4 style={{ color: COLORS.primaryDark, margin: "0 0 10px 0" }}>📊 Predictions</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <p style={{ margin: "5px 0", fontSize: "12px", color: "#666" }}>Yield</p>
                  <p style={{ margin: "0", fontWeight: "600", color: COLORS.primary }}>
                    {detection.predictions.yieldPrediction}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "5px 0", fontSize: "12px", color: "#666" }}>Water Needed</p>
                  <p style={{ margin: "0", fontWeight: "600", color: COLORS.primary }}>
                    {detection.predictions.waterNeeded}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "5px 0", fontSize: "12px", color: "#666" }}>Days to Harvest</p>
                  <p style={{ margin: "0", fontWeight: "600", color: COLORS.primary }}>
                    {detection.predictions.bestHarvestTime}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "5px 0", fontSize: "12px", color: "#666" }}>Soil Requirements</p>
                  <p style={{ margin: "0", fontWeight: "600", color: COLORS.primary }}>
                    {detection.predictions.soilRequirements}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div
              style={{
                background: COLORS.inputBg,
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <h4 style={{ color: COLORS.primaryDark, margin: "0 0 10px 0" }}>📝 Detailed AI Analysis</h4>
              <p
                style={{
                  margin: "0",
                  color: COLORS.text,
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.6",
                }}
              >
                {detection.detailedAnalysis}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlantImageDetection;

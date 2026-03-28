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

function PlantImageDetection({ userId, language = "en", onDetectionComplete }) {
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
      formData.append("language", language || "en");

      const response = await axios.post(`${API_URL}/api/detect-disease`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success && response.data.disease) {
        setDetection({
          ...response.data.disease,
          localized: response.data.localized || null,
        });
        if (onDetectionComplete) {
          onDetectionComplete({
            ...response.data.disease,
            localized: response.data.localized || null,
          });
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
          🌿 Crop Disease &amp; Pest Detection
        </h2>
        <p
          style={{
            textAlign: "center",
            color: COLORS.text,
            fontSize: "14px",
            marginTop: "-8px",
            marginBottom: "24px",
            opacity: 0.85,
          }}
        >
          Upload a clear photo of a leaf or crop. Results use the Hugging Face plant disease model.
        </p>

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
                  {loading ? "🔍 Analyzing..." : "🔍 Detect disease & pests"}
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

            {detection.localized?.summary && (
              <div
                style={{
                  background: "#e8f5e9",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  borderLeft: `4px solid ${COLORS.primary}`,
                }}
              >
                <h4 style={{ color: COLORS.primaryDark, margin: "0 0 8px 0" }}>🌐 Summary (your language)</h4>
                <p style={{ margin: 0, lineHeight: 1.6, color: COLORS.text }}>{detection.localized.summary}</p>
              </div>
            )}

            <div
              style={{
                background: COLORS.inputBg,
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px",
                marginTop: "15px",
                borderLeft: `4px solid ${detection.isHealthy ? COLORS.primary : "#e65100"}`,
              }}
            >
              <h4 style={{ color: COLORS.primaryDark, margin: "0 0 10px 0" }}>⚕️ Top prediction</h4>
              {detection.localized?.topCrop != null && detection.localized.topCrop !== "" && (
                <p style={{ margin: "5px 0" }}>
                  <strong>Crop / plant:</strong> {detection.localized.topCrop}
                </p>
              )}
              {!detection.localized?.topCrop && detection.plant && (
                <p style={{ margin: "5px 0" }}>
                  <strong>Crop / plant:</strong> {detection.plant}
                </p>
              )}
              <p style={{ margin: "5px 0" }}>
                <strong>Condition:</strong>{" "}
                {detection.localized?.topCondition || detection.diseaseName}
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Model label:</strong>{" "}
                <span style={{ fontSize: "13px", wordBreak: "break-word" }}>{detection.name}</span>
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Confidence:</strong> {detection.confidencePercent}%
              </p>
              <div
                style={{
                  marginTop: "10px",
                  height: "8px",
                  background: "#e0e0e0",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, detection.confidencePercent)}%`,
                    height: "100%",
                    background: detection.isHealthy ? COLORS.primary : "#f57c00",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              {detection.isHealthy && (
                <p style={{ margin: "10px 0 0 0", color: COLORS.primaryDark, fontWeight: 600 }}>
                  This class suggests the plant looks healthy in the model&apos;s view — still verify in the field.
                </p>
              )}
            </div>

            <div
              style={{
                background: COLORS.inputBg,
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <h4 style={{ color: COLORS.primary, margin: "0 0 15px 0" }}>📋 All class scores</h4>
              {detection.localized?.predictions?.length > 0 && (
                <p style={{ fontSize: "12px", color: "#666", margin: "0 0 15px 0" }}>
                  Labels below are translated for your language; percentages are from the model.
                </p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {(detection.localized?.predictions?.length > 0
                  ? detection.localized.predictions
                  : detection.predictions
                ).map((p, idx) => (
                  <div
                    key={`${p.label}-${idx}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingBottom: "12px",
                      borderBottom: idx < ((detection.localized?.predictions?.length > 0
                        ? detection.localized.predictions
                        : detection.predictions
                      ).length - 1) ? `1px solid ${COLORS.border}` : "none",
                    }}
                  >
                    <span style={{ color: COLORS.text, wordBreak: "break-word", flex: 1 }}>
                      {p.label}
                    </span>
                    <span style={{ fontWeight: 600, color: COLORS.primaryDark, whiteSpace: "nowrap", marginLeft: "20px" }}>
                      {p.confidencePercent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlantImageDetection;

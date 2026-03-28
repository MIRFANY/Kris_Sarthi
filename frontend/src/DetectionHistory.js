import React, { useState, useEffect } from "react";
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
};

function DetectionHistory({ userId }) {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);

  useEffect(() => {
    loadDetectionHistory();
  }, [userId]);

  const loadDetectionHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/plant-detection/history/${userId}`
      );
      setDetections(response.data);
    } catch (err) {
      console.error("Error loading history:", err);
      setError("Failed to load detection history");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDetection = async (detectionId) => {
    if (!window.confirm("Delete this detection record?")) return;

    try {
      await axios.delete(`${API_URL}/api/plant-detection/${detectionId}`);
      setDetections(detections.filter((d) => d._id !== detectionId));
      setSelectedDetection(null);
    } catch (err) {
      console.error("Error deleting detection:", err);
      alert("Failed to delete detection");
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "50px", color: COLORS.primary }}>
        ⏳ Loading detection history...
      </div>
    );

  if (error)
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "#c62828" }}>
        ⚠️ {error}
      </div>
    );

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
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "30px",
          background: COLORS.card,
          borderRadius: "12px",
          boxShadow: COLORS.cardShadow,
        }}
      >
        <h2 style={{ color: COLORS.primaryDark, marginBottom: "20px" }}>
          📋 Detection History
        </h2>

        {detections.length === 0 ? (
          <p style={{ textAlign: "center", color: COLORS.text, fontSize: "16px" }}>
            No detection records found. Start by uploading a plant image!
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Detection List */}
            <div>
              <h3 style={{ color: COLORS.primary, marginBottom: "15px" }}>Recent Detections</h3>
              <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                {detections.map((detection) => (
                  <div
                    key={detection._id}
                    onClick={() => setSelectedDetection(detection)}
                    style={{
                      padding: "12px",
                      marginBottom: "10px",
                      background:
                        selectedDetection?._id === detection._id
                          ? COLORS.accent
                          : COLORS.inputBg,
                      borderRadius: "6px",
                      cursor: "pointer",
                      borderLeft: `4px solid ${COLORS.primary}`,
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedDetection?._id !== detection._id) {
                        e.currentTarget.style.background = "#f0f8f0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedDetection?._id !== detection._id) {
                        e.currentTarget.style.background = COLORS.inputBg;
                      }
                    }}
                  >
                    <p style={{ margin: "0 0 5px 0", fontWeight: "600", color: COLORS.primaryDark }}>
                      {detection.detectedPlant.name}
                    </p>
                    <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: COLORS.text }}>
                      {detection.detectedDisease.name}
                    </p>
                    <p style={{ margin: "0", fontSize: "11px", color: "#666" }}>
                      {new Date(detection.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detection Details */}
            {selectedDetection && (
              <div
                style={{
                  background: COLORS.inputBg,
                  padding: "20px",
                  borderRadius: "8px",
                  maxHeight: "600px",
                  overflowY: "auto",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <h3 style={{ color: COLORS.primaryDark, margin: "0" }}>
                    Details
                  </h3>
                  <button
                    onClick={() =>
                      handleDeleteDetection(selectedDetection._id)
                    }
                    style={{
                      padding: "6px 12px",
                      background: "#d32f2f",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>

                <div style={{ display: "grid", gap: "15px" }}>
                  {/* Plant */}
                  <div>
                    <h4 style={{ color: COLORS.primary, margin: "0 0 5px 0" }}>
                      🌿 Plant
                    </h4>
                    <p style={{ margin: "0 0 3px 0", fontSize: "14px" }}>
                      <strong>{selectedDetection.detectedPlant.name}</strong>
                    </p>
                    <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
                      Confidence: {selectedDetection.detectedPlant.confidence}%
                    </p>
                  </div>

                  {/* Disease */}
                  <div>
                    <h4 style={{ color: COLORS.primaryDark, margin: "0 0 5px 0" }}>
                      ⚕️ Condition
                    </h4>
                    <p style={{ margin: "0 0 3px 0", fontSize: "14px" }}>
                      <strong>{selectedDetection.detectedDisease.name}</strong>
                    </p>
                    <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
                      Severity:{" "}
                      {selectedDetection.detectedDisease.severity || "N/A"}
                    </p>
                  </div>

                  {/* Fertilizer */}
                  <div>
                    <h4 style={{ color: COLORS.primary, margin: "0 0 5px 0" }}>
                      🌾 Fertilizer
                    </h4>
                    <p style={{ margin: "0 0 3px 0", fontSize: "14px" }}>
                      <strong>
                        {
                          selectedDetection.fertiliserRecommendation
                            .primary
                        }
                      </strong>
                    </p>
                    <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
                      {selectedDetection.fertiliserRecommendation.quantity}
                    </p>
                  </div>

                  {/* Predictions */}
                  <div>
                    <h4 style={{ color: COLORS.primaryDark, margin: "0 0 5px 0" }}>
                      📊 Yield
                    </h4>
                    <p style={{ margin: "0", fontSize: "14px", color: COLORS.primary }}>
                      {selectedDetection.predictions.yieldPrediction}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DetectionHistory;

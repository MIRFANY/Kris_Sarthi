import { useState } from "react";
import FormattedMessage from "./FormattedMessage";

const API_URL = process.env.REACT_APP_API_URL || "https://kris-sarthi-1.onrender.com";

const STATES = [
  "Jammu and Kashmir", "Punjab", "Haryana", "Uttar Pradesh",
  "Madhya Pradesh", "Maharashtra", "Gujarat", "Rajasthan",
  "Karnataka", "Tamil Nadu", "Andhra Pradesh", "Bihar",
  "West Bengal", "Odisha", "Kerala", "Himachal Pradesh",
];

const CROPS = [
  "Apple", "Wheat", "Rice", "Maize", "Cotton", "Sugarcane",
  "Potato", "Onion", "Tomato", "Mustard", "Groundnut",
  "Soybean", "Chana", "Tur", "Moong", "Bajra",
];

const FARM_SIZES = [
  { value: "small", label: "Small (< 1 hectare)" },
  { value: "marginal", label: "Marginal (1–2 hectares)" },
  { value: "large", label: "Large (> 2 hectares)" },
];

export default function GovtSchemes({ userState, userCrop, userLanguage }) {
  const [state, setState] = useState(userState || "Jammu and Kashmir");
  const [crop, setCrop] = useState(userCrop || "Apple");
  const [farmSize, setFarmSize] = useState("small");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchSchemes = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const selectedLanguage = userLanguage || "English";
    console.log(`Fetching govt schemes in: ${selectedLanguage}`);

    try {
      const res = await fetch(`${API_URL}/api/schemes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          crop,
          farmSize,
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch schemes");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format Gemini's text response into readable sections
  const formatSchemes = (text) => {
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <br key={i} />;

      // Scheme title lines (numbered or with **)
      if (/^(\d+\.|#{1,3}|\*\*)/.test(line.trim())) {
        const cleaned = line.replace(/^[#*\d.]+\s*/, "").replace(/\*\*/g, "").trim();
        return (
          <p key={i} style={{
            color: "#43a047",
            fontWeight: "700",
            fontSize: "15px",
            marginTop: "16px",
            marginBottom: "4px",
            letterSpacing: "0.3px",
          }}>
            🌿 {cleaned}
          </p>
        );
      }

      // Bullet lines
      if (/^[-•*]/.test(line.trim())) {
        const cleaned = line.replace(/^[-•*]\s*/, "").replace(/\*\*/g, "").trim();
        return (
          <p key={i} style={{
            color: "#1b1b1b",
            fontSize: "13.5px",
            marginLeft: "12px",
            marginBottom: "3px",
            lineHeight: "1.6",
          }}>
            • {cleaned}
          </p>
        );
      }

      // Regular line
      return (
        <p key={i} style={{
          color: "#666666",
          fontSize: "13.5px",
          marginBottom: "4px",
          lineHeight: "1.6",
        }}>
          {line.replace(/\*\*/g, "")}
        </p>
      );
    });
  };

  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid rgba(67, 160, 71, 0.15)",
      borderRadius: "16px",
      padding: "24px",
      color: "#1b1b1b",
      fontFamily: "'Segoe UI', sans-serif",
      maxWidth: "700px",
      margin: "0 auto",
    }}>

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <span style={{
          background: "rgba(67, 160, 71, 0.15)",
          color: "#43a047",
          fontSize: "10px",
          fontWeight: "700",
          letterSpacing: "1.5px",
          padding: "3px 10px",
          borderRadius: "20px",
          textTransform: "uppercase",
        }}>
          GOVT SCHEMES
        </span>
        <h2 style={{
          margin: "10px 0 4px",
          fontSize: "22px",
          fontWeight: "700",
          color: "#1b1b1b",
        }}>
          🏛️ Schemes for Your Farm
        </h2>
        <p style={{ color: "#666666", fontSize: "13px", margin: 0 }}>
          Find government subsidies and schemes personalised for you
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "12px",
        marginBottom: "16px",
      }}>
        {/* State */}
        <div>
          <label style={{ color: "#43a047", fontSize: "11px", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
            STATE
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            style={{
              width: "100%",
              background: "#f8faf7",
              border: "1px solid rgba(67, 160, 71, 0.15)",
              borderRadius: "8px",
              color: "#1b1b1b",
              padding: "8px 10px",
              fontSize: "13px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Crop */}
        <div>
          <label style={{ color: "#43a047", fontSize: "11px", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
            CROP
          </label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            style={{
              width: "100%",
              background: "#f8faf7",
              border: "1px solid rgba(67, 160, 71, 0.15)",
              borderRadius: "8px",
              color: "#1b1b1b",
              padding: "8px 10px",
              fontSize: "13px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {CROPS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Farm Size */}
        <div>
          <label style={{ color: "#43a047", fontSize: "11px", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
            FARM SIZE
          </label>
          <select
            value={farmSize}
            onChange={(e) => setFarmSize(e.target.value)}
            style={{
              width: "100%",
              background: "#f8faf7",
              border: "1px solid rgba(67, 160, 71, 0.15)",
              borderRadius: "8px",
              color: "#1b1b1b",
              padding: "8px 10px",
              fontSize: "13px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {FARM_SIZES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={fetchSchemes}
        disabled={loading}
        style={{
          width: "100%",
          background: loading ? "#ccc" : "#43a047",
          border: "none",
          borderRadius: "10px",
          color: loading ? "#666" : "white",
          padding: "12px",
          fontSize: "14px",
          fontWeight: "700",
          cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: "0.5px",
          transition: "background 0.2s",
          marginBottom: "20px",
        }}
      >
        {loading ? "🔍 Searching schemes..." : "🔍 Find Schemes for Me"}
      </button>

      {/* Loading State */}
      {loading && (
        <div style={{
          background: "#f8faf7",
          borderRadius: "12px",
          padding: "20px",
          textAlign: "center",
          border: "1px solid rgba(67, 160, 71, 0.15)",
        }}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>🌾</div>
          <p style={{ color: "#43a047", fontSize: "13px", margin: 0 }}>
            Searching government portals for {crop} schemes in {state}...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          background: "#ffebee",
          border: "1px solid #ffcdd2",
          borderRadius: "12px",
          padding: "16px",
          color: "#c62828",
          fontSize: "13px",
        }}>
          ❌ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Schemes Text */}
          <div style={{
            background: "#f8faf7",
            border: "1px solid rgba(67, 160, 71, 0.15)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "16px",
          }}>
            <p style={{
              color: "#43a047",
              fontSize: "11px",
              letterSpacing: "1.5px",
              fontWeight: "700",
              marginBottom: "14px",
              marginTop: 0,
            }}>
              📋 SCHEMES FOUND FOR {crop.toUpperCase()} FARMERS · {state.toUpperCase()} · {userLanguage || "English"}
            </p>
            <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "8px" }}>
              <FormattedMessage 
                text={result.schemes} 
                isUserMessage={false}
                colors={{
                  userBg: "rgba(67, 160, 71, 0.08)",
                  botBg: "#ffffff",
                  text: "#1b1b1b",
                  primary: "#43a047",
                  accent: "#66bb6a",
                  border: "rgba(67, 160, 71, 0.15)",
                }}
              />
            </div>
          </div>

          {/* Source Links */}
          {result.sources && result.sources.length > 0 && (
            <div>
              <p style={{
                color: "#43a047",
                fontSize: "11px",
                letterSpacing: "1px",
                marginBottom: "10px",
                fontWeight: "700",
              }}>
                🔗 OFFICIAL SOURCES
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {result.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "#f8faf7",
                      border: "1px solid rgba(67, 160, 71, 0.15)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#43a047",
                      textDecoration: "none",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <span>🌐</span>
                    <span style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}>
                      {source.title || source.url}
                    </span>
                    <span style={{ color: "#2d5a2d", flexShrink: 0 }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
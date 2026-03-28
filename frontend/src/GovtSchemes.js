import { useState } from "react";

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

    try {
      const res = await fetch(`${API_URL}/api/schemes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          crop,
          farmSize,
          language: userLanguage || "English",
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
            color: "#7CFC00",
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
            color: "#c8e6c9",
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
          color: "#b2d8b2",
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
      background: "linear-gradient(145deg, #1a2e1a, #0f1f0f)",
      border: "1px solid #2d5a2d",
      borderRadius: "16px",
      padding: "24px",
      color: "white",
      fontFamily: "'Segoe UI', sans-serif",
      maxWidth: "700px",
      margin: "0 auto",
    }}>

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <span style={{
          background: "#1b5e20",
          color: "#69f0ae",
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
          color: "#fff",
        }}>
          🏛️ Schemes for Your Farm
        </h2>
        <p style={{ color: "#81c784", fontSize: "13px", margin: 0 }}>
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
          <label style={{ color: "#81c784", fontSize: "11px", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
            STATE
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            style={{
              width: "100%",
              background: "#1b2e1b",
              border: "1px solid #2d5a2d",
              borderRadius: "8px",
              color: "#e8f5e9",
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
          <label style={{ color: "#81c784", fontSize: "11px", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
            CROP
          </label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            style={{
              width: "100%",
              background: "#1b2e1b",
              border: "1px solid #2d5a2d",
              borderRadius: "8px",
              color: "#e8f5e9",
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
          <label style={{ color: "#81c784", fontSize: "11px", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
            FARM SIZE
          </label>
          <select
            value={farmSize}
            onChange={(e) => setFarmSize(e.target.value)}
            style={{
              width: "100%",
              background: "#1b2e1b",
              border: "1px solid #2d5a2d",
              borderRadius: "8px",
              color: "#e8f5e9",
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
          background: loading ? "#2d5a2d" : "#2e7d32",
          border: "none",
          borderRadius: "10px",
          color: "white",
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
          background: "#0f2a0f",
          borderRadius: "12px",
          padding: "20px",
          textAlign: "center",
          border: "1px solid #1b5e20",
        }}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>🌾</div>
          <p style={{ color: "#81c784", fontSize: "13px", margin: 0 }}>
            Searching government portals for {crop} schemes in {state}...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          background: "#1a0a0a",
          border: "1px solid #5a2020",
          borderRadius: "12px",
          padding: "16px",
          color: "#ef9a9a",
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
            background: "#0d1f0d",
            border: "1px solid #2d5a2d",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "16px",
          }}>
            <p style={{
              color: "#69f0ae",
              fontSize: "11px",
              letterSpacing: "1.5px",
              fontWeight: "700",
              marginBottom: "14px",
              marginTop: 0,
            }}>
              📋 SCHEMES FOUND FOR {crop.toUpperCase()} FARMERS · {state.toUpperCase()}
            </p>
            <div>{formatSchemes(result.schemes)}</div>
          </div>

          {/* Source Links */}
          {result.sources && result.sources.length > 0 && (
            <div>
              <p style={{
                color: "#81c784",
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
                      background: "#0f2a0f",
                      border: "1px solid #2d5a2d",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#69f0ae",
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
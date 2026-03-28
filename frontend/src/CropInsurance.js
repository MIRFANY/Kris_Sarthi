import { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "https://kris-sarthi-1.onrender.com";

const CROPS = [
  "Wheat", "Rice", "Maize", "Cotton", "Sugarcane",
  "Potato", "Onion", "Tomato", "Mustard", "Groundnut",
  "Apple", "Bajra", "Soybean", "Chana",
];

const STATES = [
  "Jammu and Kashmir", "Punjab", "Haryana", "Uttar Pradesh",
  "Madhya Pradesh", "Maharashtra", "Gujarat", "Rajasthan",
  "Karnataka", "Tamil Nadu", "Andhra Pradesh", "Bihar",
];

export default function CropInsurance({ userCrop, userState, userLanguage }) {
  const [crop, setCrop] = useState(userCrop || "Apple");
  const [state, setState] = useState(userState || "Jammu and Kashmir");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchGuide = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/crop-insurance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop,
          state,
          language: userLanguage || "English",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatGuide = (text) => {
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      if (/^#{1,3}|\*\*\d+\./.test(line.trim())) {
        const cleaned = line.replace(/^[#*\d.]+\s*/, "").replace(/\*\*/g, "").trim();
        return (
          <p key={i} style={{
            color: "#2e7d32", fontWeight: "700", fontSize: "14px",
            marginTop: "14px", marginBottom: "4px",
            borderLeft: "3px solid #43a047", paddingLeft: "8px",
          }}>
            {cleaned}
          </p>
        );
      }
      if (/\*\*/.test(line)) {
        return (
          <p key={i} style={{ color: "#1b5e20", fontWeight: "600", fontSize: "13px", marginBottom: "3px" }}>
            {line.replace(/\*\*/g, "").trim()}
          </p>
        );
      }
      if (/^[-•*]/.test(line.trim())) {
        return (
          <p key={i} style={{ color: "#2d5a2d", fontSize: "13px", marginLeft: "12px", marginBottom: "2px", lineHeight: "1.6" }}>
            • {line.replace(/^[-•*]\s*/, "").trim()}
          </p>
        );
      }
      return (
        <p key={i} style={{ color: "#374937", fontSize: "13px", marginBottom: "3px", lineHeight: "1.6" }}>
          {line}
        </p>
      );
    });
  };

  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #a5d6a7",
      borderRadius: "16px",
      padding: "20px",
      fontFamily: "'Segoe UI', sans-serif",
      width: "100%",
      boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <span style={{
          background: "#e8f5e9", color: "#2e7d32", fontSize: "10px",
          fontWeight: "700", letterSpacing: "1.5px", padding: "3px 10px",
          borderRadius: "20px", textTransform: "uppercase",
        }}>
          Crop Insurance
        </span>
        <h2 style={{ margin: "8px 0 2px", fontSize: "18px", fontWeight: "700", color: "#1b5e20" }}>
          🛡️ Crop Failure Guide
        </h2>
        <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>
          PM Fasal Bima Yojana + recovery steps
        </p>
      </div>

      {/* Quick Info Banner */}
      <div style={{
        background: "#e8f5e9", borderRadius: "10px", padding: "12px",
        marginBottom: "16px", display: "flex",
        justifyContent: "space-between", flexWrap: "wrap", gap: "8px",
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "10px", color: "#555" }}>Helpline</p>
          <p style={{ margin: 0, fontWeight: "700", color: "#2e7d32", fontSize: "13px" }}>
            1800-180-1551
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "10px", color: "#555" }}>Claim window</p>
          <p style={{ margin: 0, fontWeight: "700", color: "#e65100", fontSize: "13px" }}>
            72 hours
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "10px", color: "#555" }}>Official site</p>
          <a href="https://pmfby.gov.in" target="_blank" rel="noopener noreferrer"
            style={{ fontWeight: "700", color: "#1565c0", fontSize: "13px" }}>
            pmfby.gov.in ↗
          </a>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
        <div>
          <label style={{ color: "#2e7d32", fontSize: "11px", letterSpacing: "1px", display: "block", marginBottom: "4px", fontWeight: "700" }}>
            CROP
          </label>
          <select value={crop} onChange={(e) => setCrop(e.target.value)}
            style={{ width: "100%", background: "#f1f8e9", border: "1px solid #a5d6a7", borderRadius: "8px", color: "#1b5e20", padding: "8px", fontSize: "13px", cursor: "pointer" }}>
            {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: "#2e7d32", fontSize: "11px", letterSpacing: "1px", display: "block", marginBottom: "4px", fontWeight: "700" }}>
            STATE
          </label>
          <select value={state} onChange={(e) => setState(e.target.value)}
            style={{ width: "100%", background: "#f1f8e9", border: "1px solid #a5d6a7", borderRadius: "8px", color: "#1b5e20", padding: "8px", fontSize: "13px", cursor: "pointer" }}>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Button */}
      <button onClick={fetchGuide} disabled={loading}
        style={{
          width: "100%", background: loading ? "#a5d6a7" : "#2e7d32",
          border: "none", borderRadius: "10px", color: "white",
          padding: "11px", fontSize: "14px", fontWeight: "700",
          cursor: loading ? "not-allowed" : "pointer", marginBottom: "16px",
        }}>
        {loading ? "🔍 Generating guide..." : "🛡️ Get My Crop Insurance Guide"}
      </button>

      {/* Loading */}
      {loading && (
        <div style={{ background: "#f1f8e9", borderRadius: "12px", padding: "20px", textAlign: "center", border: "1px solid #a5d6a7" }}>
          <div style={{ fontSize: "28px", marginBottom: "10px" }}>🌾</div>
          <p style={{ color: "#2e7d32", fontSize: "13px", margin: 0 }}>
            Finding PM Fasal Bima + recovery steps for {crop} in {state}...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "#ffebee", border: "1px solid #ef9a9a", borderRadius: "10px", padding: "14px", color: "#c62828", fontSize: "13px" }}>
          ❌ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div>
          <div style={{ background: "#f1f8e9", border: "1px solid #a5d6a7", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
            <p style={{ color: "#2e7d32", fontSize: "11px", letterSpacing: "1.5px", fontWeight: "700", marginBottom: "12px", marginTop: 0 }}>
              📋 RECOVERY GUIDE — {crop.toUpperCase()} · {state.toUpperCase()}
            </p>
            <div>{formatGuide(result.guide)}</div>
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <a href="https://pmfby.gov.in" target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, background: "#2e7d32", color: "white", padding: "10px", borderRadius: "8px", textAlign: "center", textDecoration: "none", fontSize: "12px", fontWeight: "700" }}>
              Register on PMFBY ↗
            </a>
            <a href="tel:1800-180-1551"
              style={{ flex: 1, background: "#e8f5e9", color: "#2e7d32", padding: "10px", borderRadius: "8px", textAlign: "center", textDecoration: "none", fontSize: "12px", fontWeight: "700", border: "1px solid #a5d6a7" }}>
              Call 1800-180-1551
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
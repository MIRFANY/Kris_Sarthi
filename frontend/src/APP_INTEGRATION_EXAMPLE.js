// Example: How to integrate Plant Detection into App.js
// This shows the necessary changes to add the ML feature to your existing app

import React, { useState } from "react";
import axios from "axios";
import { injectAnimationStyles } from "./AnimationStyles";
import ReadPopup from "./ReadPopup";
import PlantImageDetection from "./PlantImageDetection"; // NEW
import DetectionHistory from "./DetectionHistory"; // NEW

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

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  // Existing state hooks
  const [userId, setUserId] = useState(null);
  const [selectedCrops, setSelectedCrops] = useState([]);

  // NEW: Page navigation state for plant detection
  const [currentPage, setCurrentPage] = useState("chat"); // chat or "detection" or "history"
  const [language, setLanguage] = useState("English");

  // Existing handlers
  const handleLogin = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    localStorage.setItem("token", response.data.token);
    setUserId(response.data.userId);
    setLanguage(response.data.language || "English");
  };

  const saveCrops = async (crops) => {
    await axios.post(`${API_URL}/user/${userId}/crops`, { crops });
    setSelectedCrops(crops);
  };

  const getAlerts = async () => {
    const alerts = await axios.get(`${API_URL}/alerts/${userId}`);
    return alerts.data;
  };

  // NEW: Handle detection completion
  const handleDetectionComplete = (detection) => {
    console.log("✅ Plant detection completed:", detection);
    // Optional: You can integrate this with your chatbot
    // For example, auto-send the results to the chat
    // Or show a notification
  };

  injectAnimationStyles();

  // Existing notification state
  const [notification, setNotification] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const showNotification = (msg, type = "info") => {
    setNotification({ msg, type });
    setNotifOpen(true);
  };

  // Existing fruit animation state
  const [fruits, setFruits] = useState([]);

  const fruitSvgs = [
    '<svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="#ffb300" stroke="#e65100" stroke-width="2"/><ellipse cx="14" cy="10" rx="4" ry="6" fill="#fffde7" opacity=".3"/></svg>',
    '<svg width="28" height="28" viewBox="0 0 28 28"><ellipse cx="14" cy="16" rx="8" ry="6" fill="#e53935"/><ellipse cx="14" cy="12" rx="4" ry="2" fill="#fff" opacity=".2"/></svg>',
    '<svg width="28" height="28" viewBox="0 0 28 28"><ellipse cx="14" cy="16" rx="7" ry="5" fill="#43a047"/><ellipse cx="14" cy="12" rx="3" ry="1.5" fill="#fff" opacity=".2"/></svg>',
    '<svg width="28" height="28" viewBox="0 0 28 28"><ellipse cx="14" cy="16" rx="6" ry="5" fill="#fbc02d"/><ellipse cx="14" cy="12" rx="2.5" ry="1.2" fill="#fff" opacity=".2"/></svg>',
    '<svg width="28" height="28" viewBox="0 0 28 28"><ellipse cx="14" cy="16" rx="7" ry="6" fill="#8bc34a"/><ellipse cx="14" cy="12" rx="3" ry="1.5" fill="#fff" opacity=".2"/></svg>',
  ];

  const dropFruits = (btnRect) => {
    const newFruits = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i + Math.random(),
      left: btnRect.left + btnRect.width / 2 + (Math.random() - 0.5) * 40,
      top: btnRect.top + btnRect.height / 2,
      svg: fruitSvgs[Math.floor(Math.random() * fruitSvgs.length)],
      delay: Math.random() * 0.2,
    }));
    setFruits((f) => [...f, ...newFruits]);
    setTimeout(() => {
      setFruits((f) => f.slice(newFruits.length));
    }, 2500);
  };

  // NEW: Navigation bar for Plant Detection
  const NavigationBar = () => (
    <nav
      style={{
        background: COLORS.card,
        padding: "15px 20px",
        borderBottom: `2px solid ${COLORS.border}`,
        display: "flex",
        gap: "10px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={() => setCurrentPage("chat")}
        style={{
          padding: "8px 16px",
          background: currentPage === "chat" ? COLORS.primary : "transparent",
          color: currentPage === "chat" ? COLORS.buttonText : COLORS.text,
          border: `1px solid ${COLORS.border}`,
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        💬 Chat
      </button>

      {/* NEW: Plant Detection button */}
      {userId && (
        <>
          <button
            onClick={() => setCurrentPage("detection")}
            style={{
              padding: "8px 16px",
              background:
                currentPage === "detection" ? COLORS.primary : "transparent",
              color:
                currentPage === "detection"
                  ? COLORS.buttonText
                  : COLORS.text,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            🌱 Plant Detection
          </button>

          <button
            onClick={() => setCurrentPage("history")}
            style={{
              padding: "8px 16px",
              background:
                currentPage === "history" ? COLORS.primary : "transparent",
              color:
                currentPage === "history"
                  ? COLORS.buttonText
                  : COLORS.text,
              border: `1px solid ${COLORS.border}`,
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            📋 History
          </button>
        </>
      )}
    </nav>
  );

  // Existing main chat UI
  const MainChatUI = () => (
    <div>
      {/* Your existing chat UI here */}
      {/* Login, chatbot, etc. */}
    </div>
  );

  // Main render
  return (
    <div style={{ background: COLORS.background, minHeight: "100vh" }}>
      {/* NEW: Navigation bar */}
      <NavigationBar />

      {/* NEW: Render different pages based on currentPage state */}
      {currentPage === "chat" && <MainChatUI />}
      {currentPage === "detection" && userId && (
        <PlantImageDetection
          userId={userId}
          language={language}
          onDetectionComplete={handleDetectionComplete}
        />
      )}
      {currentPage === "history" && userId && (
        <DetectionHistory userId={userId} />
      )}

      {/* Your existing fruit animations */}
      <div
        style={{
          position: "fixed",
          pointerEvents: "none",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {fruits.map((fruit) => (
          <div
            key={fruit.id}
            style={{
              position: "absolute",
              left: fruit.left,
              top: fruit.top,
              animation: `fall 2.5s ease-in forwards`,
              animationDelay: fruit.delay + "s",
              opacity: 0.8,
            }}
            dangerouslySetInnerHTML={{ __html: fruit.svg }}
          />
        ))}
      </div>

      {/* Your existing notification popup */}
      <ReadPopup open={notifOpen} setOpen={setNotifOpen} message={notification?.msg} />
    </div>
  );
}

export default App;

/*
INTEGRATION CHECKLIST:
✅ Import PlantImageDetection component
✅ Import DetectionHistory component
✅ Add currentPage state
✅ Add NavigationBar component
✅ Add handleDetectionComplete handler
✅ Render components based on currentPage
✅ Test each page (chat, detection, history)

NEXT STEPS:
1. Update your actual App.js with these changes
2. Test the plant detection upload
3. Check browser console for errors
4. Check backend logs for API issues
5. Verify images are stored correctly
6. Test with multiple plant types

OPTIONAL ENHANCEMENTS:
- Add keyboard shortcuts (D for detection, H for history)
- Add detection count badge
- Show recent detection in chat
- Auto-navigate to history after detection
- Add export results button
*/

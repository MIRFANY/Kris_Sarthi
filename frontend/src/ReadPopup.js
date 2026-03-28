import React, { useState } from "react";

function ReadPopup() {
  const [speaking, setSpeaking] = useState(false);

  // 👉 Static Punjabi-Hindi text with more Punjabi feel
  const staticText = "फसल रोग देखण वास्ते पहला बटन दबाओ। किसी फसल या खाद दी जानकारी लेण वास्ते तीसरा बटन दबाओ। मौसम जानण वास्ते चौथा बटन दबाओ। अते अपना कोई वी सवाल पूछण वास्ते बगल वाले माइक दबाओ।";

  const handleRead = () => {
    
  if (!speaking) {
    const utterance = new SpeechSynthesisUtterance(staticText);
    utterance.lang = "hi-IN";
    utterance.rate = 0.9;

    // Select a specific voice if available
    const voices = speechSynthesis.getVoices();
    const hindiVoice = voices.find(voice => voice.lang === "hi-IN");
    if (hindiVoice) utterance.voice = hindiVoice;

    utterance.onend = () => setSpeaking(false);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    setSpeaking(true);
  } else {
    speechSynthesis.cancel();
    setSpeaking(false);
  }
};


  return (
 <>
  {/* Floating speaker button */}
  <button
    onClick={handleRead}
    style={{
      position: "fixed",
      bottom: "180px",
      right: "30px",
      padding: "12px",
      background: speaking ? "#f44336" : "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "50%",
      cursor: "pointer",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "60px",
      height: "60px",
      // Blinking animation when not speaking
      animation: speaking ? "none" : "blink 1s infinite",
    }}
  >
    {speaking ? (
      // Stop icon
      <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" width="24" height="24">
        <rect x="6" y="6" width="12" height="12" rx="2" />
      </svg>
    ) : (
      // Speaker icon
         <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M3 10v4h4l5 5V5l-5 5H3z" />
        <path d="M14 8.46c1.25 1.25 1.25 3.27 0 4.53" stroke="white" strokeWidth="2" fill="none"/>
        <path d="M16 6.36c2 2 2 5.28 0 7.28" stroke="white" strokeWidth="2" fill="none"/>
      </svg>
    )}
  </button>

  {/* Keyframes for blinking */}
  <style>
    {`
      @keyframes blink {
        40%, 80%, 90% { opacity: 1; }
        75%, 80% { opacity: 0.5; }
      }
    `}
  </style>
</>


  );
}

export default ReadPopup;

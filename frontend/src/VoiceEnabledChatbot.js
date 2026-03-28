import React, { useState } from "react";
import useVoice from "./useVoice";
import VoiceControl from "./VoiceControl";

/**
 * EXAMPLE: Voice-Enabled Chatbot Component
 * Shows how to integrate STT/TTS with your chatbot
 */

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const VoiceEnabledChatbot = ({ language = "en" }) => {
  const voice = useVoice(language);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle sending message (from text OR voice)
  const handleSendMessage = async () => {
    // Priority: voice transcript > typed text
    const message = voice.transcript || inputText;

    if (!message.trim()) return;

    // Add user message to chat
    setChatHistory([...chatHistory, { role: "user", text: message }]);
    setInputText("");

    // Clear voice transcript after using it
    if (voice.transcript) {
      // Reset transcript display
      console.log("Using voice input:", voice.transcript);
    }

    try {
      setIsLoading(true);

      // Send to backend
      const response = await fetch(`${API_URL}/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: message,
          language: language === "hi" ? "Hindi" : "English",
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const botReply = data.reply;

      // Add bot response to chat
      setChatHistory((prev) => [...prev, { role: "bot", text: botReply }]);

      // Auto-speak bot response
      voice.speak(botReply);

      setIsLoading(false);
    } catch (error) {
      console.error("Chatbot Error:", error);
      let errorMsg;
      
      if (error.message.includes("Failed to fetch")) {
        errorMsg = language === "hi" 
          ? "सर्वर से कनेक्ट नहीं हो सके। क्या बैकएंड चल रहा है?" 
          : "Could not connect to server. Is the backend running?";
      } else if (error.message.includes("Server error")) {
        errorMsg = language === "hi" 
          ? "सर्वर ने त्रुटि दी: " + error.message 
          : "Server error: " + error.message;
      } else {
        errorMsg = language === "hi" ? "त्रुटि हुई: " + error.message : "Error: " + error.message;
      }
      
      setChatHistory((prev) => [...prev, { role: "bot", text: errorMsg }]);
      setIsLoading(false);
    }
  };

  // Language translations
  const texts = {
    en: {
      send: "Send",
      speaking: "Speaking...",
      typeHere: "Type or speak your question...",
      language: "Language",
    },
    hi: {
      send: "भेजें",
      speaking: "बोल रहा है...",
      typeHere: "अपना सवाल टाइप करें या बोलें...",
      language: "भाषा",
    },
  };

  const text = texts[language] || texts.en;

  return (
    <div
      style={{
        border: "2px solid #43a047",
        borderRadius: "12px",
        padding: "16px",
        background: "#f6fff8",
        maxWidth: "600px",
        margin: "20px auto",
      }}
    >
      {/* Header */}
      <h2 style={{ color: "#2e7d32", marginTop: 0 }}>
        🤖 GreenGeenie {language === "hi" ? "(हिंदी)" : "(English)"}
      </h2>

      {/* Chat History */}
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
          marginBottom: "12px",
          border: "1px solid #a5d6a7",
        }}
      >
        {chatHistory.length === 0 ? (
          <div style={{ color: "#999", textAlign: "center", paddingTop: "50px" }}>
            {language === "hi"
              ? "अपना सवाल पूछना शुरू करें..."
              : "Start asking your questions..."}
          </div>
        ) : (
          chatHistory.map((msg, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "10px",
                textAlign: msg.role === "user" ? "right" : "left",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background:
                    msg.role === "user" ? "#43a047" : "#e8f5e9",
                  color: msg.role === "user" ? "white" : "#1b5e20",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  maxWidth: "70%",
                  wordWrap: "break-word",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div style={{ color: "#43a047", fontStyle: "italic" }}>
            ✓ {text.speaking}
          </div>
        )}
      </div>

      {/* Voice Control Component */}
      <VoiceControl
        isListening={voice.isListening}
        isSpeaking={voice.isSpeaking}
        onMicClick={voice.startListening}
        onStopListening={voice.stopListening}
        onStopSpeaking={voice.stopSpeaking}
        transcript={voice.transcript}
        error={voice.error}
        language={language}
      />

      {/* Input Area */}
      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder={text.typeHere}
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #a5d6a7",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || (!inputText.trim() && !voice.transcript)}
          style={{
            padding: "10px 20px",
            background: "#43a047",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            opacity: isLoading || (!inputText.trim() && !voice.transcript) ? 0.6 : 1,
          }}
        >
          {text.send}
        </button>
      </div>

      {/* Tips */}
      <div
        style={{
          marginTop: "12px",
          padding: "10px",
          background: "#fff9c4",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#f57f17",
        }}
      >
        💡 {language === "hi" 
          ? "माइक को टैप करके बोलें या टाइप करें" 
          : "Tap mic to speak or type your question"}
      </div>
    </div>
  );
};

export default VoiceEnabledChatbot;

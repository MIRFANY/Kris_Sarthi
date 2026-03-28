import React from "react";

/**
 * Voice Control UI Component
 * Provides buttons for STT and TTS with visual feedback
 */

const VoiceControl = ({
  isListening,
  isSpeaking,
  onMicClick,
  onStopListening,
  onStopSpeaking,
  transcript,
  error,
  language,
}) => {
  const buttonStyles = {
    mic: {
      base: {
        background: "#43a047",
        color: "white",
        border: "none",
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        fontSize: "24px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      },
      active: {
        background: "#e53935",
        boxShadow: "0 0 20px rgba(229, 57, 53, 0.6)",
        animation: "pulse 1s infinite",
      },
    },
    speaker: {
      base: {
        background: "#1976d2",
        color: "white",
        border: "none",
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        fontSize: "24px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        marginLeft: "8px",
      },
      active: {
        background: "#f57c00",
        boxShadow: "0 0 20px rgba(245, 124, 0, 0.6)",
        animation: "pulse 0.8s infinite",
      },
    },
  };

  const statusTexts = {
    en: {
      listening: "🎤 Listening...",
      speaking: "🔊 Speaking...",
      error: "❌ Error",
      tapMic: "Tap Mic 🎤",
      stopListen: "Stop Listening",
      tapSpeaker: "🔊 Mute",
    },
    hi: {
      listening: "🎤 सुन रहा है...",
      speaking: "🔊 बोल रहा है...",
      error: "❌ त्रुटि",
      tapMic: "माइक टैप करें 🎤",
      stopListen: "सुनना बंद करें",
      tapSpeaker: "🔊 म्यूट करें",
    },
  };

  const texts = statusTexts[language] || statusTexts.en;

  return (
    <>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          margin: "10px 0",
        }}
      >
        {/* Microphone Button */}
        <button
          onClick={isListening ? onStopListening : onMicClick}
          style={{
            ...buttonStyles.mic.base,
            ...(isListening && buttonStyles.mic.active),
          }}
          title={isListening ? texts.stopListen : texts.tapMic}
          aria-label="Voice input"
        >
          {isListening ? "🎤" : "🎤"}
        </button>

        {/* Speaker Button */}
        <button
          onClick={isSpeaking ? onStopSpeaking : null}
          style={{
            ...buttonStyles.speaker.base,
            ...(isSpeaking && buttonStyles.speaker.active),
            opacity: isSpeaking ? 1 : 0.6,
            cursor: isSpeaking ? "pointer" : "default",
          }}
          title={isSpeaking ? "Mute" : "Auto-speak enabled"}
          aria-label="Voice output"
          disabled={!isSpeaking}
        >
          {isSpeaking ? "🔊" : "🔇"}
        </button>

        {/* Status Text */}
        <span
          style={{
            fontSize: "14px",
            fontWeight: "500",
            color: isListening
              ? "#e53935"
              : isSpeaking
              ? "#f57c00"
              : error
              ? "#d32f2f"
              : "#666",
            minWidth: "120px",
          }}
        >
          {error
            ? texts.error
            : isListening
            ? texts.listening
            : isSpeaking
            ? texts.speaking
            : ""}
        </span>
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div
          style={{
            background: "#f1f8e9",
            border: "2px solid #43a047",
            borderRadius: "8px",
            padding: "10px",
            marginTop: "8px",
            fontSize: "14px",
            color: "#2e7d32",
            fontWeight: "500",
          }}
        >
          📝 {transcript}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          style={{
            background: "#ffebee",
            border: "2px solid #d32f2f",
            borderRadius: "8px",
            padding: "10px",
            marginTop: "8px",
            fontSize: "13px",
            color: "#b71c1c",
          }}
        >
          ⚠️ {error}
        </div>
      )}
    </>
  );
};

export default VoiceControl;

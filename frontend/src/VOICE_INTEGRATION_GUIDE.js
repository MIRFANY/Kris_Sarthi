// INTEGRATION GUIDE FOR VOICE FEATURES (STT & TTS)
// Add this to your App.js

import useVoice from "./useVoice";
import VoiceControl from "./VoiceControl";

/**
 * STEP 1: Add voice state in your App component
 * Inside function App():
 */

// const [language, setLanguage] = useState("en"); // "en" or "hi"
// const voice = useVoice(language);

/**
 * STEP 2: Add Voice Control UI to your JSX
 * Add this component wherever you want voice controls:
 */

// <VoiceControl
//   isListening={voice.isListening}
//   isSpeaking={voice.isSpeaking}
//   onMicClick={voice.startListening}
//   onStopListening={voice.stopListening}
//   onStopSpeaking={voice.stopSpeaking}
//   transcript={voice.transcript}
//   error={voice.error}
//   language={language}
// />

/**
 * STEP 3: Integrate with CHATBOT
 * When user clicks "Send", also use voice transcript:
 */

// const handleChatbotInput = () => {
//   const userMessage = voice.transcript || chatInput; // Use voice or typed input
//   sendChatMessage(userMessage);
//   voice.speak(botResponse); // Auto-speak bot response
// };

/**
 * STEP 4: Integrate with WEATHER FEATURE
 * When weather data is fetched:
 */

// const handleWeatherDisplay = (weatherData) => {
//   const weatherText = `
//     Temperature: ${weatherData.temperature} degrees.
//     Condition: ${weatherData.condition}.
//     Wind Speed: ${weatherData.wind} kilometers per hour.
//   `;
//   voice.speak(weatherText); // Read out weather
// };

/**
 * STEP 5: Integrate with MARKET PRICES
 * When price data is displayed:
 */

// const handlePriceDisplay = (priceData) => {
//   const priceText = `
//     Current price of ${priceData.crop}: ${priceData.price} rupees per quintal.
//   `;
//   voice.speak(priceText);
// };

/**
 * STEP 6: LANGUAGE SELECTOR (Hindi/English)
 * Add a dropdown or buttons:
 */

// <div style={{ marginBottom: "10px" }}>
//   <button 
//     onClick={() => setLanguage("en")}
//     style={{ fontWeight: language === "en" ? "bold" : "normal" }}
//   >
//     English
//   </button>
//   <button 
//     onClick={() => setLanguage("hi")}
//     style={{ fontWeight: language === "hi" ? "bold" : "normal", marginLeft: "10px" }}
//   >
//     हिंदी
//   </button>
// </div>

/**
 * BROWSER COMPATIBILITY
 * ✅ Chrome/Edge: Full support
 * ✅ Firefox: Full support (with flag)
 * ⚠️ Safari: Limited support
 * ❌ IE: Not supported
 */

/**
 * BEST PRACTICES
 * 1. Always provide fallback text input (voice is supplementary)
 * 2. Show visual feedback while listening (already in VoiceControl)
 * 3. Limit voice output length (>30 seconds may timeout)
 * 4. Test on target devices (especially for regional languages)
 * 5. Add disclaimer: "Feature works best with clear speech"
 */

/**
 * TESTING VOICE
 * Test cases:
 * 1. Say: "What is the weather?" → Should trigger weather feature
 * 2. Say: "Show me wheat prices" → Should trigger market prices
 * 3. Rapid mic clicks → Should handle gracefully
 * 4. Switch languages mid-speech → Should work correctly
 */

export const VoiceFeatureGuide = {
  features: [
    "Speech-to-Text (Hindi & English)",
    "Text-to-Speech (Hindi & English)",
    "Auto-readout of chatbot responses",
    "Voice navigation across all features",
    "Language auto-switching",
  ],
  browsers: ["Chrome 25+", "Edge 79+", "Firefox 25+"],
  limitations: [
    "Internet required for some languages",
    "Works best in quiet environments",
    "Maximum 30 seconds continuous speech",
  ],
};

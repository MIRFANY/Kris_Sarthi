# Voice Feature Implementation (STT & TTS) - Complete Guide

## What Was Created

### 1. **useVoice.js** - Custom React Hook
- Speech-to-Text (STT) using Web Speech API
- Text-to-Speech (TTS) using Web Speech Synthesis
- Supports: English (en-US), Hindi (hi-IN)
- Returns: isListening, isSpeaking, transcript, error, and control methods

### 2. **VoiceControl.js** - UI Component
- Mic button (toggles STT)
- Speaker button (shows active TTS)
- Status indicators (Listening, Speaking, Error)
- Transcript display
- Fully styled with green theme

### 3. **VoiceEnabledChatbot.js** - Implementation Example
- Complete chatbot example with voice integration
- Shows STT + TTS workflow
- Ready to copy-paste

---

## How to Integrate Into Your App.js

### Step 1: Import in App.js
```javascript
import useVoice from "./useVoice";
import VoiceControl from "./VoiceControl";
```

### Step 2: Add Voice State (inside function App())
```javascript
function App() {
  // ... existing state ...
  const [language, setLanguage] = useState("en"); // "en" or "hi"
  const voice = useVoice(language);
  
  // ... rest of your code ...
}
```

### Step 3: Add Language Selector UI
Add this near the top of your JSX (in App.js render):
```javascript
<div style={{ marginBottom: "15px", textAlign: "center" }}>
  <label style={{ marginRight: "10px", fontWeight: "bold" }}>
    🌐 {language === "hi" ? "भाषा" : "Language"}:
  </label>
  <button
    onClick={() => setLanguage("en")}
    style={{
      padding: "8px 16px",
      background: language === "en" ? "#43a047" : "#ddd",
      color: language === "en" ? "white" : "black",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginRight: "8px",
      fontWeight: language === "en" ? "bold" : "normal"
    }}
  >
    English
  </button>
  <button
    onClick={() => setLanguage("hi")}
    style={{
      padding: "8px 16px",
      background: language === "hi" ? "#43a047" : "#ddd",
      color: language === "hi" ? "white" : "black",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: language === "hi" ? "bold" : "normal"
    }}
  >
    हिंदी
  </button>
</div>
```

### Step 4: Add Voice Control Component to Chatbot
Find your chatbot section and add:
```javascript
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
```

### Step 5: Modify Chatbot Send Handler
Find your chatbot input handler and update it:
```javascript
const handleSendMessage = async (event) => {
  // Use voice transcript if available, otherwise use typed text
  const userMessage = voice.transcript || chatInput;
  
  if (!userMessage.trim()) return;

  try {
    const response = await axios.post("http://localhost:5000/generate-text", {
      prompt: userMessage,
      language: language === "hi" ? "Hindi" : "English",
    });
    
    const botResponse = response.data.reply;
    
    // Auto-speak the bot response
    voice.speak(botResponse);
    
    // Update your chat UI
    // ... existing chat update code ...
  } catch (error) {
    console.error(error);
  }
};
```

### Step 6: Add Voice to Weather Feature
When displaying weather:
```javascript
const displayWeather = (weatherData) => {
  if (language === "hi") {
    voice.speak(
      `तापमान ${weatherData.temperature} डिग्री है। ${weatherData.condition} की संभावना है।`
    );
  } else {
    voice.speak(
      `Temperature is ${weatherData.temperature} degrees. ${weatherData.condition}.`
    );
  }
};
```

### Step 7: Add Voice to Market Prices
When displaying prices:
```javascript
const displayPrice = (priceData) => {
  if (language === "hi") {
    voice.speak(
      `${priceData.crop}की कीमत ${priceData.price} रुपये प्रति क्विंटल है।`
    );
  } else {
    voice.speak(
      `Price of ${priceData.crop} is ${priceData.price} rupees per quintal.`
    );
  }
};
```

### Step 8: Add Voice to Crop Calendar
```javascript
const displayCropInfo = (cropData) => {
  if (language === "hi") {
    voice.speak(
      `${cropData.name} की बुवाई का समय ${cropData.seedingTime} है।`
    );
  } else {
    voice.speak(
      `${cropData.name} should be sown in ${cropData.seedingTime}.`
    );
  }
};
```

---

## Testing Checklist

- [ ] Mic button works (orange pulse when listening)
- [ ] Speech is recognized (transcript appears)
- [ ] Bot response is spoken out loud
- [ ] Language switching works
- [ ] Weather reads out when fetched
- [ ] Market prices read out when displayed
- [ ] Crop calendar info reads out
- [ ] Error handling works gracefully
- [ ] Works in different browsers (Chrome, Edge, Firefox)

---

## Browser Support

| Browser | STT | TTS | Status |
|---------|-----|-----|--------|
| Chrome | ✅ | ✅ | Full support |
| Edge | ✅ | ✅ | Full support |
| Firefox | ✅ | ✅ | Full support |
| Safari | ⚠️ | ⚠️ | Limited, need webkit prefix |
| Internet Explorer | ❌ | ❌ | Not supported |

---

## Performance Notes

- **STT**: Works best in quiet environments
- **TTS**: Limit to <30 seconds per utterance
- **Hindi/English**: Both supported natively
- **Network**: No additional network calls (uses browser APIs)

---

## Voice Command Examples

### English
- "Show me weather"
- "What's the price of wheat?"
- "Tell me about the crop calendar"
- "Help me with farming"

### Hindi
- "मौसम दिखाओ"
- "गेहूं की कीमत क्या है?"
- "फसल कैलेंडर बताओ"
- "खेती में मदद करो"

---

## Troubleshooting

**Issue**: Mic not working
- Solution: Check browser permissions, ensure HTTPS (or localhost)

**Issue**: Hindi speech not recognized
- Solution: Ensure device language pack is installed, speak clearly

**Issue**: TTS sounds robotic
- Solution: Normal for browser APIs, can vary by device

**Issue**: Nothing happens on mic click
- Solution: Check browser console for errors, ensure Web Speech API support

---

## Files Created

1. `useVoice.js` - Main voice hook
2. `VoiceControl.js` - UI component  
3. `VoiceEnabledChatbot.js` - Complete example
4. `VOICE_INTEGRATION_GUIDE.js` - This guide

All files are in `/frontend/src/` directory

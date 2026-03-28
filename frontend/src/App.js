import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import { injectAnimationStyles } from "./AnimationStyles";
import ReadPopup from "./ReadPopup";
import PlantImageDetection from "./PlantImageDetection";
import DetectionHistory from "./DetectionHistory";
// --- Explore Route Dark Palette (aligned with landing page) ---
const COLORS = {
  background: "#060a06",
  card: "rgba(255,255,255,0.03)",
  cardShadow: "0 24px 50px rgba(0,0,0,0.35)",
  primary: "#7fff6a",
  primaryDark: "#3d8b37",
  accent: "rgba(127,255,106,0.07)",
  border: "rgba(127,255,106,0.22)",
  text: "#f0f4ee",
  buttonText: "#f0f4ee",
  buttonHover: "#92ff82",
  inputBg: "rgba(255,255,255,0.05)",
  inputBorder: "rgba(127,255,106,0.25)",
};

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const GUEST_USER_ID = "000000000000000000000001";
  // State hooks - MUST be inside the component
  const [userId, setUserId] = useState(null);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window === "undefined") return "home";
    return localStorage.getItem("ks-current-view") || "home";
  }); // home, detection, or history
  const [showFeatureHub, setShowFeatureHub] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("ks-active-screen") === "explore";
  });
  const [activeButtonGuideIndex, setActiveButtonGuideIndex] = useState(0);
  const [showButtonGuide, setShowButtonGuide] = useState(true);
  const [activeFeatureGuideIndex, setActiveFeatureGuideIndex] = useState(0);
  const [showFeatureGuide, setShowFeatureGuide] = useState(true);
  const [featureGuideCycle, setFeatureGuideCycle] = useState(0);
  const [historyPreview, setHistoryPreview] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Login handler
  const handleLogin = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    localStorage.setItem("token", response.data.token);
    setUserId(response.data.userId);
  };

  // Save crops
  const saveCrops = async (crops) => {
    await axios.post(`${API_URL}/user/${userId}/crops`, { crops });
    setSelectedCrops(crops);
  };

  // Get alerts
  const getAlerts = async () => {
    const alerts = await axios.get(`${API_URL}/alerts/${userId}`);
    return alerts.data;
  };
  // Inject global animation styles
  injectAnimationStyles();
  // Notification state
  const [notification, setNotification] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  // Show notification (now only on bell click)
  const showNotification = (msg, type = "info") => {
    setNotification({ msg, type });
    setNotifOpen(true);
  };
  // Fruit animation state
  const [fruits, setFruits] = useState([]);
  // Fruit SVGs
  const fruitSvgs = [
    '<svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="#ffb300" stroke="#e65100" stroke-width="2"/><ellipse cx="14" cy="10" rx="4" ry="6" fill="#fffde7" opacity=".3"/></svg>', // Mango
    '<svg width="28" height="28" viewBox="0 0 28 28"><ellipse cx="14" cy="16" rx="8" ry="6" fill="#e53935"/><ellipse cx="14" cy="12" rx="4" ry="2" fill="#fff" opacity=".2"/></svg>', // Apple
    '<svg width="28" height="28" viewBox="0 0 28 28"><ellipse cx="14" cy="16" rx="7" ry="5" fill="#43a047"/><ellipse cx="14" cy="12" rx="3" ry="1.5" fill="#fff" opacity=".2"/></svg>', // Watermelon
    '<svg width="28" height="28" viewBox="0 0 28 28"><ellipse cx="14" cy="16" rx="6" ry="5" fill="#fbc02d"/><ellipse cx="14" cy="12" rx="2.5" ry="1.2" fill="#fff" opacity=".2"/></svg>', // Lemon
    '<svg width="28" height="28" viewBox="0 0 28 28"><ellipse cx="14" cy="16" rx="7" ry="6" fill="#8bc34a"/><ellipse cx="14" cy="12" rx="3" ry="1.5" fill="#fff" opacity=".2"/></svg>', // Guava
  ];
  // Fruit drop handler
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
    }, 1200);
  };
  // ...existing code...
  // Multilingual Support
  const [language, setLanguage] = useState("pa");
  
  const languageNames = {
    pa: "ਪੰਜਾਬੀ",
    en: "English",
    hi: "हिंदी",
    ta: "தமிழ்"
  };
  
  const translations = {
    pa: {
      scanProduct: "ਉਤਪਾਦ ਸਕੈਨ ਕਰੋ",
      enterProduct: "ਉਤਪਾਦ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ",
      speakProduct: "ਉਤਪਾਦ ਦਾ ਨਾਮ ਬੋਲੋ",
      uploadScan: "ਮਿੱਟੀ ਦੀ ਰਿਪੋਰਟ ਸਕੈਨ/ਅੱਪਲੋਡ ਕਰੋ",
      diseasePest: "ਬਿਮਾਰੀ ਅਤੇ ਕੀਟ ਪਤਾ ਲਗਾਓ",
      healthy: "ਸਿਹਤਮੰਦ",
      diseaseDetected: "ਬਿਮਾਰੀ ਮਿਲੀ",
      pestDetected: "ਕੀਟ ਮਿਲੇ",
      analyzing: "ਚਿੱਤਰ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
      cropCalendar: "ਫਸਲ ਕੈਲੰਡਰ",
      selectCrop: "ਫਸਲ ਚੁਣੋ:",
      keyDates: "ਮੁੱਖ ਤਾਰੀਖਾਂ:",
      weatherPrediction: "ਮੌਸਮ ਭਵਿੱਖਬਾਣੀ",
      marketPrices: "ਬਾਜ਼ਾਰ ਭਾਵ",
      chatbot: "GreenGeenie ਚੈਟਬੋਟ",
      askAnything: "ਮੈਨੂੰ ਖੇਤੀਬਾੜੀ, ਮੌਸਮ ਜਾਂ ਬਾਜ਼ਾਰ ਭਾਵ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ!",
      send: "ਭੇਜੋ",
      close: "ਬੰਦ ਕਰੋ",
      typeMessage: "ਆਪਣਾ ਸੁਨੇਹਾ ਲਿਖੋ...",
      thinking: "GreenGeenie ਸੋਚ ਰਿਹਾ ਹੈ...",
      errorMessage: "ਮਾਫ਼ ਕਰਨਾ, ਸਰਵਰ ਨਾਲ ਕਨੈਕਸ਼ਨ ਨਹੀਂ ਹੋ ਸਕਿਆ।",
      fetchingWeather: "ਮੌਸਮ ਲੱਭ ਰਿਹਾ ਹੈ...",
      detectLocation: "ਪਹਿਲਾਂ ਆਪਣਾ ਟਿਕਾਣਾ ਪਤਾ ਕਰੋ",
      fiveDayForecast: "5-ਦਿਨ ਦੀ ਭਵਿੱਖਬਾਣੀ",
      wind: "ਹਵਾ",
      listening: "ਸੁਣ ਰਿਹਾ ਹੈ...",
      tapToSpeak: "ਬੋਲਣ ਲਈ 🎤 ਦਬਾਓ",
      autoSpeakOn: "ਆਟੋ ਬੋਲਣਾ ਚਾਲੂ",
      autoSpeakOff: "ਆਟੋ ਬੋਲਨਾ ਬੰਦ",
      timeline: "ਸਮਾਂ-ਰੇਖਾ",
      listView: "ਸੂਚੀ",
      stages: "ਪੜਾਅ",
      tip: "ਸੁਝਾਅ",
      activeReminders: "ਕਿਰਿਆਸ਼ੀਲ ਯਾਦ-ਦਹਾਨੀਆਂ",
      selectCropMsg: "ਕੈਲੰਡਰ ਦੇਖਣ ਲਈ ਫਸਲ ਚੁਣੋ",
      now: "ਹੁਣੇ",
      yourCropPrice: "ਤੁਹਾਡੀ ਫਸਲ ਦਾ ਭਾਅ",
      priceAlert: "ਭਾਅ ਅਲਰਟ",
      priceUp: "ਭਾਅ ਵਧਿਆ",
      priceDown: "ਭਾਅ ਘਟਿਆ",
      priceStable: "ਭਾਅ ਸਥਿਰ",
      currentPrice: "ਮੌਜੂਦਾ ਭਾਅ",
      msp: "MSP",
      trackingYourCrop: "ਤੁਹਾਡੀ ਫਸਲ ਟਰੈਕ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ",
      selectCropForPrice: "ਕੈਲੰਡਰ ਵਿੱਚ ਫਸਲ ਚੁਣੋ ਭਾਅ ਦੇਖਣ ਲਈ",
      perQuintal: "ਪ੍ਰਤੀ ਕੁਇੰਟਲ",
      livePrices: "ਲਾਈਵ ਭਾਅ",
      notifyPriceChange: "ਭਾਅ ਬਦਲਣ 'ਤੇ ਸੂਚਿਤ ਕਰੋ",
    },
    en: {
      scanProduct: "Scan Product",
      enterProduct: "Enter product name",
      speakProduct: "Speak product name",
      uploadScan: "Scan / Upload Your Soil Report or product",
      diseasePest: "Disease & Pest Detection",
      healthy: "Healthy",
      diseaseDetected: "Disease Detected",
      pestDetected: "Pest Detected",
      analyzing: "Analyzing image...",
      cropCalendar: "Crop Calendar",
      selectCrop: "Select Crop:",
      keyDates: "Key Dates:",
      weatherPrediction: "Weather Prediction",
      marketPrices: "Market Prices",
      chatbot: "GreenGeenie",
      askAnything: "Ask me anything about farming, weather, or market prices!",
      send: "Send",
      close: "Close",
      typeMessage: "Type your message...",
      thinking: "GreenGeenie is thinking...",
      errorMessage: "Sorry, couldn't connect to the server.",
      fetchingWeather: "Fetching weather...",
      detectLocation: "Please detect your location first",
      fiveDayForecast: "5-Day Forecast",
      wind: "Wind",
      listening: "Listening...",
      tapToSpeak: "Tap 🎤 to speak",
      autoSpeakOn: "Auto-speak ON",
      autoSpeakOff: "Auto-speak OFF",
      timeline: "Timeline",
      listView: "List",
      stages: "stages",
      tip: "Tip",
      activeReminders: "Active Reminders",
      selectCropMsg: "Select a crop to view its calendar",
      now: "NOW",
    },
    hi: {
      scanProduct: "उत्पाद स्कैन करें",
      enterProduct: "उत्पाद का नाम दर्ज करें",
      speakProduct: "बोलें उत्पाद का नाम",
      uploadScan: "मिट्टी की रिपोर्ट स्कैन/अपलोड करें",
      diseasePest: "रोग और कीट पहचान",
      healthy: "स्वस्थ",
      diseaseDetected: "रोग पाया गया",
      pestDetected: "कीट पाया गया",
      analyzing: "छवि का विश्लेषण हो रहा है...",
      cropCalendar: "फसल कैलेंडर",
      selectCrop: "फसल चुनें:",
      keyDates: "मुख्य तिथियाँ:",
      weatherPrediction: "मौसम पूर्वानुमान",
      marketPrices: "बाजार मूल्य",
      chatbot: "ग्रीनजीनी चैटबॉट",
      askAnything: "खेती, मौसम या बाजार के बारे में कुछ भी पूछें!",
      send: "भेजें",
      close: "बंद करें",
      typeMessage: "अपना संदेश लिखें...",
      thinking: "ग्रीनजीनी सोच रहा है...",
      errorMessage: "माफ़ करें, सर्वर से कनेक्ट नहीं हो सका।",
      fetchingWeather: "मौसम देखा जा रहा है...",
      detectLocation: "पहले अपना स्थान पता करें",
      fiveDayForecast: "5-दिन का पूर्वानुमान",
      wind: "हवा",
      listening: "सुन रहे हैं...",
      tapToSpeak: "बोलने के लिए 🎤 दबाएं",
      autoSpeakOn: "ऑटो बोलना चालू",
      autoSpeakOff: "ऑटो बोलना बंद",
      timeline: "समय-रेखा",
      listView: "सूची",
      stages: "चरण",
      tip: "सुझाव",
      activeReminders: "सक्रिय याद-दिलाने",
      selectCropMsg: "कैलेंडर देखने के लिए फसल चुनें",
      now: "अभी",
      yourCropPrice: "आपकी फसल का भाव",
      priceAlert: "भाव अलर्ट",
      priceUp: "भाव बढ़ा",
      priceDown: "भाव गिरा",
      priceStable: "भाव स्थिर",
      currentPrice: "मौजूदा भाव",
      msp: "MSP",
      trackingYourCrop: "आपकी फसल ट्रैक की जा रही है",
      selectCropForPrice: "भाव देखने के लिए कैलेंडर में फसल चुनें",
      perQuintal: "प्रति क्विंटल",
      livePrices: "लाइव भाव",
      notifyPriceChange: "भाव बदलने पर सूचित करें",
    },
    ta: {
      scanProduct: "பயிர் ஸ்கேன்",
      enterProduct: "பயிர் பெயரை உள்ளிடவும்",
      speakProduct: "பயிர் பெயரை பேசவும்",
      uploadScan: "மண் அறிக்கையை ஸ்கேன்/பதிவேற்றவும்",
      diseasePest: "நோய் மற்றும் பூச்சி கண்டறிதல்",
      healthy: "ஆரோக்கியம்",
      diseaseDetected: "நோய் கண்டறியப்பட்டது",
      pestDetected: "பூச்சி கண்டறியப்பட்டது",
      analyzing: "படம் பகுப்பாய்வு செய்யப்படுகிறது...",
      cropCalendar: "பயிர் நாட்காட்டி",
      selectCrop: "பயிர் தேர்வு:",
      keyDates: "முக்கிய தேதிகள்:",
      weatherPrediction: "வானிலை முன்னறிவு",
      marketPrices: "சந்தை விலை",
      chatbot: "GreenGeenie உரையாடல்",
      askAnything: "விவசாயம், வானிலை, சந்தை பற்றி ஏதேனும் கேளுங்கள்!",
      send: "அனுப்பு",
      close: "மூடு",
      typeMessage: "உங்கள் செய்தியை உள்ளிடவும்...",
      thinking: "GreenGeenie யோசிக்கிறது...",
      errorMessage: "மன்னிக்கவும், சர்வருடன் இணைக்க முடியவில்லை.",
      fetchingWeather: "வானிலை பெறப்படுகிறது...",
      detectLocation: "முதலில் உங்கள் இருப்பிடத்தை கண்டறியவும்",
      fiveDayForecast: "5-நாள் முன்னறிவு",
      wind: "காற்று",
      listening: "கேட்கிறேன்...",
      tapToSpeak: "பேச 🎤 தட்டவும்",
      autoSpeakOn: "தானியங்கி பேசு சாலு",
      autoSpeakOff: "தானியங்கி பேசு நிறுத்து",
      timeline: "காலவரிசை",
      listView: "பட்டியல்",
      stages: "நிலைகள்",
      tip: "குறிப்பு",
      activeReminders: "செயலில் உள்ள நினைவூட்டல்கள்",
      selectCropMsg: "நாட்காட்டியைக் காண பயிர் தேர்வு செய்யவும்",
      now: "இப்போது",
      yourCropPrice: "உங்கள் பயிர் விலை",
      priceAlert: "விலை எச்சரிக்கை",
      priceUp: "விலை உயர்ந்தது",
      priceDown: "விலை குறைந்தது",
      priceStable: "விலை நிலையானது",
      currentPrice: "தற்போதைய விலை",
      msp: "MSP",
      trackingYourCrop: "உங்கள் பயிர் கண்காணிக்கப்படுகிறது",
      selectCropForPrice: "விலை பார்க்க நாட்காட்டியில் பயிர் தேர்வு செய்க",
      perQuintal: "குவிண்டால் ஒன்றுக்கு",
      livePrices: "நேரடி விலை",
      notifyPriceChange: "விலை மாற்றத்தை அறிவிக்கவும்",
    },
  };
  const t = translations[language];
  // Disease & Pest Detection State
  const [diseaseImage, setDiseaseImage] = useState(null);
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [diseaseLoading, setDiseaseLoading] = useState(false);

  // AI detection handler — HF disease model (no login / userId required)
  const handleDiseaseImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDiseaseImage(file);
    setDiseaseLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("language", language || "en");

      const response = await axios.post(`${API_URL}/api/detect-disease`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success && response.data.disease) {
        const d = response.data.disease;
        const loc = response.data.localized;
        const topCond = loc?.topCondition || d.diseaseName;
        let status = "Analysis complete";
        let color = "#388e3c";
        let message = `${topCond} (${d.confidencePercent}% confidence)`;

        if (d.isHealthy) {
          status = "✅ Likely healthy";
          color = "#388e3c";
          message = `${topCond} (${d.confidencePercent}% confidence)`;
        } else {
          status = "⚕️ Top prediction";
          color = "#d32f2f";
          message = `${topCond} — ${d.confidencePercent}% confidence`;
        }

        setDiseaseResult({
          status,
          color,
          message,
          details: { ...d, localized: loc || null },
        });
      } else {
        setDiseaseResult({
          status: "Error",
          color: "#d32f2f",
          message: response.data.error || "Failed to analyze image",
        });
      }
    } catch (err) {
      console.error("Disease detection error:", err);
      setDiseaseResult({
        status: "Error",
        color: "#d32f2f",
        message: err.response?.data?.error || "Failed to connect to API. Make sure backend is running.",
      });
    } finally {
      setDiseaseLoading(false);
    }
  };
  // Crop Calendar State
  const cropOptions = [
    { name: "Select", icon: "🌱", calendar: [], tips: [] },
    {
      name: "Wheat",
      icon: "🌾",
      calendar: [
        { stage: "Land Preparation", date: "Oct 15", tip: "Plow field 2-3 times and level the soil properly" },
        { stage: "Sowing", date: "Nov 10", tip: "Use certified seeds, 100kg/hectare. Treat seeds with fungicide" },
        { stage: "First Irrigation", date: "Nov 30", tip: "Crown root initiation stage - critical irrigation" },
        { stage: "Second Irrigation", date: "Dec 20", tip: "Tillering stage - apply urea after this irrigation" },
        { stage: "Third Irrigation", date: "Jan 15", tip: "Jointing stage - important for yield" },
        { stage: "Fourth Irrigation", date: "Feb 5", tip: "Flowering stage - avoid water stress" },
        { stage: "Fifth Irrigation", date: "Feb 25", tip: "Grain filling stage - last irrigation" },
        { stage: "Harvesting", date: "Apr 10", tip: "Harvest when grains have 12-14% moisture" },
      ],
    },
    {
      name: "Rice",
      icon: "🍚",
      calendar: [
        { stage: "Nursery Preparation", date: "May 20", tip: "Prepare raised nursery beds, use 30kg seeds/hectare" },
        { stage: "Transplanting", date: "June 25", tip: "Transplant 25-30 days old seedlings, 2-3 seedlings/hill" },
        { stage: "First Weeding", date: "July 10", tip: "Remove weeds manually or use herbicide" },
        { stage: "First Fertilizer", date: "July 15", tip: "Apply nitrogen fertilizer after weeding" },
        { stage: "Second Fertilizer", date: "Aug 5", tip: "Apply potash and phosphorus" },
        { stage: "Pest Watch", date: "Aug 20", tip: "Monitor for stem borer and leaf folder" },
        { stage: "Drain Field", date: "Sep 25", tip: "Stop irrigation 15 days before harvest" },
        { stage: "Harvesting", date: "Oct 15", tip: "Harvest when 80% grains turn golden yellow" },
      ],
    },
    {
      name: "Maize",
      icon: "🌽",
      calendar: [
        { stage: "Land Preparation", date: "June 15", tip: "Deep plowing and add FYM 10 tons/hectare" },
        { stage: "Sowing", date: "July 1", tip: "Seed rate 20kg/hectare, spacing 60x25cm" },
        { stage: "Thinning", date: "July 15", tip: "Keep one healthy plant per hill" },
        { stage: "First Irrigation", date: "July 20", tip: "Knee-high stage - critical for growth" },
        { stage: "Top Dressing", date: "Aug 1", tip: "Apply 60kg urea/hectare" },
        { stage: "Tasseling Stage", date: "Aug 20", tip: "Most critical stage - ensure adequate moisture" },
        { stage: "Grain Filling", date: "Sep 10", tip: "Avoid water stress during this period" },
        { stage: "Harvesting", date: "Oct 5", tip: "Harvest when husks turn brown and dry" },
      ],
    },
    {
      name: "Cotton",
      icon: "☁️",
      calendar: [
        { stage: "Land Preparation", date: "Apr 1", tip: "Deep plowing with 2-3 harrowings" },
        { stage: "Sowing", date: "May 1", tip: "Use Bt cotton seeds, spacing 90x60cm" },
        { stage: "Thinning", date: "May 25", tip: "Maintain one plant per spot" },
        { stage: "First Irrigation", date: "June 10", tip: "Light irrigation at square formation" },
        { stage: "Pest Spray", date: "July 1", tip: "Monitor for bollworm, use IPM practices" },
        { stage: "Second Spray", date: "July 25", tip: "Apply need-based pesticide" },
        { stage: "First Picking", date: "Oct 1", tip: "Pick fully opened bolls only" },
        { stage: "Final Picking", date: "Nov 15", tip: "Complete all pickings before frost" },
      ],
    },
    {
      name: "Sugarcane",
      icon: "🎋",
      calendar: [
        { stage: "Land Preparation", date: "Feb 1", tip: "Deep plowing with heavy dose of FYM" },
        { stage: "Planting", date: "Feb 20", tip: "Use 3-budded setts, 40,000 setts/hectare" },
        { stage: "Gap Filling", date: "Mar 20", tip: "Fill gaps with pre-sprouted setts" },
        { stage: "First Earthing", date: "Apr 15", tip: "Light earthing up around plants" },
        { stage: "Heavy Irrigation", date: "May 1", tip: "Increase irrigation frequency in summer" },
        { stage: "Second Earthing", date: "June 1", tip: "Heavy earthing to support tillers" },
        { stage: "Propping", date: "Aug 1", tip: "Support canes to prevent lodging" },
        { stage: "Harvest", date: "Dec 15", tip: "Harvest when Brix reading is 18-20%" },
      ],
    },
    {
      name: "Potato",
      icon: "🥔",
      calendar: [
        { stage: "Land Preparation", date: "Sep 25", tip: "Fine tilth required, add 25 tons FYM/hectare" },
        { stage: "Planting", date: "Oct 15", tip: "Use certified tubers, 25-30 quintals/hectare" },
        { stage: "First Irrigation", date: "Oct 25", tip: "Light irrigation after planting" },
        { stage: "Earthing Up", date: "Nov 10", tip: "Cover tubers to prevent greening" },
        { stage: "Second Earthing", date: "Nov 30", tip: "Final earthing with fertilizer" },
        { stage: "Haulm Cutting", date: "Jan 20", tip: "Cut tops 10 days before harvest" },
        { stage: "Harvesting", date: "Feb 1", tip: "Harvest in dry weather, cure before storage" },
      ],
    },
    {
      name: "Mustard",
      icon: "💛",
      calendar: [
        { stage: "Land Preparation", date: "Sep 20", tip: "Fine seedbed with good moisture" },
        { stage: "Sowing", date: "Oct 10", tip: "Seed rate 4-5 kg/hectare, line sowing" },
        { stage: "Thinning", date: "Oct 30", tip: "Maintain 15cm plant to plant distance" },
        { stage: "First Irrigation", date: "Nov 15", tip: "At flower initiation stage" },
        { stage: "Second Irrigation", date: "Dec 10", tip: "At pod formation stage" },
        { stage: "Pest Watch", date: "Dec 20", tip: "Check for aphids on undersides of leaves" },
        { stage: "Harvesting", date: "Feb 25", tip: "Harvest when 75% pods turn yellow" },
      ],
    },
    {
      name: "Bajra",
      icon: "🌿",
      calendar: [
        { stage: "Land Preparation", date: "June 20", tip: "One deep and 2-3 shallow plowings" },
        { stage: "Sowing", date: "July 5", tip: "Seed rate 4-5 kg/hectare" },
        { stage: "Thinning", date: "July 20", tip: "Keep plants 10-15cm apart" },
        { stage: "First Weeding", date: "July 30", tip: "Manual weeding or use herbicide" },
        { stage: "Top Dressing", date: "Aug 10", tip: "Apply 30kg urea/hectare" },
        { stage: "Earhead Stage", date: "Aug 25", tip: "Critical stage - ensure moisture" },
        { stage: "Harvesting", date: "Sep 25", tip: "Harvest when grains are hard" },
      ],
    },
  ];
  const [selectedCrop, setSelectedCrop] = useState(cropOptions[0].name);
  const [calendarView, setCalendarView] = useState("timeline"); // "timeline" or "list"
  const [cropReminders, setCropReminders] = useState([]); // Store enabled reminders

  // Add reminder function
  const addCropReminder = (crop, stage, date) => {
    const reminderId = `${crop}-${stage}`;
    if (cropReminders.find(r => r.id === reminderId)) {
      // Remove if already exists
      setCropReminders(prev => prev.filter(r => r.id !== reminderId));
      showNotification(`Reminder removed for ${stage}`, "info");
    } else {
      setCropReminders(prev => [...prev, { id: reminderId, crop, stage, date }]);
      showNotification(`Reminder set for ${crop} ${stage} (${date})`, "info");
    }
  };

  // Check if reminder is set
  const isReminderSet = (crop, stage) => {
    return cropReminders.some(r => r.id === `${crop}-${stage}`);
  };

  // Get current stage based on today's date
  const getCurrentStage = (calendar) => {
    if (!calendar || calendar.length === 0) return -1;
    const today = new Date();
    const currentYear = today.getFullYear();
    
    for (let i = calendar.length - 1; i >= 0; i--) {
      const stageDate = new Date(`${calendar[i].date} ${currentYear}`);
      if (today >= stageDate) return i;
    }
    return -1;
  };

  // Language codes for Speech APIs
  const speechLangCodes = {
    pa: "pa-IN", // Punjabi
    en: "en-IN", // English (India)
    hi: "hi-IN", // Hindi
    ta: "ta-IN", // Tamil
  };

  // GreenGeenie State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatListening, setChatListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState(null);
  const chatContainerRef = React.useRef(null);
  const chatRecognitionRef = React.useRef(null);

  // Text-to-Speech function
  const speakText = (text, msgIdx) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech not supported in this browser.");
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    if (isSpeaking && speakingMsgIdx === msgIdx) {
      // If clicking same message, stop speaking
      setIsSpeaking(false);
      setSpeakingMsgIdx(null);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = speechLangCodes[language] || "en-IN";
    utterance.lang = targetLang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    // Try to find a voice for the target language
    const voices = window.speechSynthesis.getVoices();
    const voiceForLang = voices.find(voice => voice.lang.startsWith(targetLang.split('-')[0]));
    if (voiceForLang) {
      utterance.voice = voiceForLang;
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMsgIdx(msgIdx);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMsgIdx(null);
    };
    
    utterance.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsSpeaking(false);
      setSpeakingMsgIdx(null);
      if (language === "hi") {
        alert("Hindi voice not available. Please use Chrome browser for better Hindi support.");
      }
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // Speech-to-Text for chatbot
  const handleChatVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    
    if (chatListening) {
      // Stop listening
      if (chatRecognitionRef.current) {
        chatRecognitionRef.current.stop();
      }
      setChatListening(false);
      return;
    }
    
    if (!chatRecognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = speechLangCodes[language] || "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        setChatListening(false);
      };
      
      recognition.onerror = (e) => {
        console.error("Speech recognition error:", e.error);
        setChatListening(false);
      };
      
      recognition.onend = () => {
        setChatListening(false);
      };
      
      chatRecognitionRef.current = recognition;
    }
    
    // Update language before starting
    chatRecognitionRef.current.lang = speechLangCodes[language] || "en-IN";
    setChatListening(true);
    chatRecognitionRef.current.start();
  };

  // Auto-read new bot messages (optional - can be toggled)
  const [autoSpeak, setAutoSpeak] = useState(false);

  // Auto-scroll chat to bottom
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, chatLoading]);

  // Send message to GreenGeenie endpoint
  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatHistory((h) => [...h, { from: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);
    
    // Map language code to full language name for AI
    const languageMap = {
      pa: "Punjabi",
      en: "English",
      hi: "Hindi",
      ta: "Tamil"
    };
    
    try {
      const res = await axios.post(`${API_URL}/generate-text`, {
        prompt: userMsg,
        language: languageMap[language] || "English",
      });
      const botReply = res.data.reply;
      setChatHistory((h) => [...h, { from: "bot", text: botReply }]);
      
      // Auto-speak bot response if enabled
      if (autoSpeak && botReply) {
        setTimeout(() => {
          speakText(botReply, chatHistory.length + 1);
        }, 100);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.reply || t.errorMessage;
      setChatHistory((h) => [
        ...h,
        { from: "bot", text: errorMsg },
      ]);
    } finally {
      setChatLoading(false);
    }
  };
  // Voice Assistant State
  const [listening, setListening] = useState(false);
  const recognitionRef = React.useRef(null);

  // Voice Assistant Handler (for product/main app)
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    
    if (listening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setListening(false);
      return;
    }
    
    if (!recognitionRef.current) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = speechLangCodes[language] || "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setProduct(transcript);
        setListening(false);
      };
      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    }
    
    // Update language before starting
    recognitionRef.current.lang = speechLangCodes[language] || "en-IN";
    setListening(true);
    recognitionRef.current.start();
  };
  const [scanResult, setScanResult] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [market, setMarket] = useState([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState(null);
  const [marketStates, setMarketStates] = useState([]);
  const [marketCommodities, setMarketCommodities] = useState([]);
  const [selectedState, setSelectedState] = useState("PUNJAB");
  const [selectedCommodity, setSelectedCommodity] = useState("all");
  const [marketSearch, setMarketSearch] = useState("");
  const [favoriteItems, setFavoriteItems] = useState(["Wheat", "Rice (Paddy)", "Cotton"]);
  const [marketView, setMarketView] = useState("list"); // "list" or "favorites"
  const [marketSource, setMarketSource] = useState(""); // Data source indicator
  const [marketLastUpdated, setMarketLastUpdated] = useState(null); // Last update timestamp
  
  // Crop Price Tracking State
  const [myCropPrice, setMyCropPrice] = useState(null); // Current price of selected crop
  const [myCropPriceLoading, setMyCropPriceLoading] = useState(false);
  const [previousCropPrice, setPreviousCropPrice] = useState(null); // For price change detection
  const [priceAlertEnabled, setPriceAlertEnabled] = useState(true); // Enable/disable price notifications
  const [lastPriceCheck, setLastPriceCheck] = useState(null); // Timestamp of last price check
  
  const [product, setProduct] = useState("");
  const [image, setImage] = useState(null);
  const fileInputRef = React.useRef();
  const [showModal, setShowModal] = useState(false);
  const [geoLocation, setGeoLocation] = useState(null);

  const handleScan = () => {
    // Open camera/file input
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // reset
      fileInputRef.current.click();
    }
  };

 const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setImage(file);

  // --- Mock AI analysis directly in frontend ---
  const mockResult = {
    product: product || "Unknown",
    aiAnalysis: {
      detectedClass: "Wheat",
      quality: "A",
      disease: "None",
      confidence: 0.98,
      notes: "Healthy wheat, no visible disease or pest."
    },
    safeToUse: true,
    message: `AI analysis: DON'T USE BARE HAND`
  };

  // Update state to show the result
  setScanResult(mockResult);
  setShowModal(true);
};

  // Weather code to description and icon mapping
  const getWeatherInfo = (code) => {
    const weatherCodes = {
      0: { desc: "Clear sky", icon: "☀️" },
      1: { desc: "Mainly clear", icon: "🌤️" },
      2: { desc: "Partly cloudy", icon: "⛅" },
      3: { desc: "Overcast", icon: "☁️" },
      45: { desc: "Foggy", icon: "🌫️" },
      48: { desc: "Rime fog", icon: "🌫️" },
      51: { desc: "Light drizzle", icon: "🌧️" },
      53: { desc: "Moderate drizzle", icon: "🌧️" },
      55: { desc: "Dense drizzle", icon: "🌧️" },
      61: { desc: "Slight rain", icon: "🌧️" },
      63: { desc: "Moderate rain", icon: "🌧️" },
      65: { desc: "Heavy rain", icon: "🌧️" },
      71: { desc: "Slight snow", icon: "🌨️" },
      73: { desc: "Moderate snow", icon: "🌨️" },
      75: { desc: "Heavy snow", icon: "❄️" },
      80: { desc: "Rain showers", icon: "🌦️" },
      81: { desc: "Rain showers", icon: "🌦️" },
      82: { desc: "Heavy rain showers", icon: "⛈️" },
      95: { desc: "Thunderstorm", icon: "⛈️" },
    };
    return weatherCodes[code] || { desc: "Unknown", icon: "🌡️" };
  };

  const fetchWeather = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    
    if (geoLocation && geoLocation.latitude && geoLocation.longitude) {
      // Use Open-Meteo API for comprehensive agricultural weather data
      try {
        // Include hourly data for farming: humidity, precipitation, UV, soil temperature
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${geoLocation.latitude}&longitude=${geoLocation.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,uv_index,soil_temperature_0cm&hourly=precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max,sunrise,sunset&timezone=auto&forecast_days=7`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.current) {
          const weatherInfo = getWeatherInfo(data.current.weather_code);
          
          // Get today's precipitation probability
          const todayPrecipProb = data.daily?.precipitation_probability_max?.[0] || 0;
          
          // Generate farming advisory based on conditions
          const getFarmingAdvisory = () => {
            const temp = data.current.temperature_2m;
            const humidity = data.current.relative_humidity_2m;
            const rain = data.current.rain || 0;
            const uv = data.current.uv_index || 0;
            const precipProb = todayPrecipProb;
            
            const advisories = [];
            
            if (precipProb > 60) {
              advisories.push("🌧️ High chance of rain - postpone spraying");
            }
            if (temp > 35) {
              advisories.push("🔥 Heat alert - irrigate crops in evening");
            }
            if (temp < 10) {
              advisories.push("❄️ Cold weather - protect sensitive crops");
            }
            if (humidity > 80 && temp > 25) {
              advisories.push("🦠 High humidity - watch for fungal diseases");
            }
            if (uv > 7) {
              advisories.push("☀️ High UV - avoid fieldwork 11am-3pm");
            }
            if (rain === 0 && precipProb < 20 && humidity < 40) {
              advisories.push("💧 Dry conditions - consider irrigation");
            }
            if (precipProb < 30 && uv < 6 && temp >= 15 && temp <= 30) {
              advisories.push("✅ Good conditions for spraying/fertilizing");
            }
            
            return advisories.length > 0 ? advisories : ["🌱 Normal farming conditions"];
          };
          
          setWeather({
            location: `${geoLocation.village || geoLocation.city || ""}${geoLocation.village && geoLocation.city ? ` (${geoLocation.city})` : ""}${geoLocation.region ? ", " + geoLocation.region : ""}`.replace(/^, /, "") || "Your Location",
            coordinates: `${geoLocation.latitude.toFixed(4)}°N, ${geoLocation.longitude.toFixed(4)}°E`,
            temperature: `${Math.round(data.current.temperature_2m)}°C`,
            feelsLike: `${Math.round(data.current.apparent_temperature)}°C`,
            condition: weatherInfo.desc,
            icon: weatherInfo.icon,
            humidity: `${data.current.relative_humidity_2m}%`,
            windspeed: `${Math.round(data.current.wind_speed_10m)} km/h`,
            windDirection: data.current.wind_direction_10m,
            uvIndex: data.current.uv_index?.toFixed(1) || "N/A",
            soilTemp: data.current.soil_temperature_0cm ? `${Math.round(data.current.soil_temperature_0cm)}°C` : "N/A",
            precipitation: `${data.current.precipitation || 0} mm`,
            precipProbability: `${todayPrecipProb}%`,
            sunrise: data.daily?.sunrise?.[0] ? new Date(data.daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A",
            sunset: data.daily?.sunset?.[0] ? new Date(data.daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A",
            farmingAdvisory: getFarmingAdvisory(),
            lastUpdated: new Date().toLocaleTimeString(),
          });
          
          // Set 7-day forecast with more details
          if (data.daily) {
            const forecastData = data.daily.time.slice(1, 7).map((date, idx) => ({
              date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
              maxTemp: `${Math.round(data.daily.temperature_2m_max[idx + 1])}°`,
              minTemp: `${Math.round(data.daily.temperature_2m_min[idx + 1])}°`,
              icon: getWeatherInfo(data.daily.weathercode[idx + 1]).icon,
              rain: `${data.daily.precipitation_sum?.[idx + 1] || 0}mm`,
              rainProb: `${data.daily.precipitation_probability_max?.[idx + 1] || 0}%`,
            }));
            setForecast(forecastData);
          }
        }
        setWeatherLoading(false);
        return;
      } catch (e) {
        console.error("Weather fetch error:", e);
        setWeatherError("Failed to fetch weather. Please try again.");
        setWeatherLoading(false);
        return;
      }
    }
    
    // Fallback - prompt to detect location
    setWeatherError("Please detect your location first to get weather data.");
    setWeatherLoading(false);
  };

  // Get user's precise geolocation using browser API and reverse geocoding
  const fetchGeoLocation = () => {
    if (navigator.geolocation) {
      setWeatherLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          // Use a free geolocation API to get detailed location (village/town level)
          try {
            const geoRes = await fetch(
              `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`
            );
            const geoData = await geoRes.json();
            const newLocation = {
              village: geoData.address?.village || geoData.address?.hamlet || "",
              city: geoData.address?.city || geoData.address?.town || geoData.address?.municipality || "",
              district: geoData.address?.county || geoData.address?.state_district || "",
              region: geoData.address?.state || "",
              country: geoData.address?.country || "",
              postcode: geoData.address?.postcode || "",
              latitude,
              longitude,
              accuracy: Math.round(accuracy),
            };
            setGeoLocation(newLocation);
            
            // Auto-fetch weather after getting location
            setTimeout(() => {
              // Trigger weather fetch with new location
              fetchWeatherWithLocation(newLocation);
            }, 100);
          } catch (e) {
            const basicLocation = { latitude, longitude, accuracy: Math.round(accuracy) };
            setGeoLocation(basicLocation);
            fetchWeatherWithLocation(basicLocation);
          }
        },
        (err) => {
          setWeatherLoading(false);
          if (err.code === err.PERMISSION_DENIED) {
            alert("Location access denied. Please enable location permissions to get local weather.");
          } else {
            alert("Could not get your location. Please try again.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Fetch weather with specific location (used for auto-fetch after location detection)
  const fetchWeatherWithLocation = async (location) => {
    if (!location || !location.latitude || !location.longitude) return;
    
    setWeatherLoading(true);
    setWeatherError(null);
    
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,uv_index,soil_temperature_0cm&hourly=precipitation_probability&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max,sunrise,sunset&timezone=auto&forecast_days=7`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.current) {
        const weatherInfo = getWeatherInfo(data.current.weather_code);
        const todayPrecipProb = data.daily?.precipitation_probability_max?.[0] || 0;
        
        const getFarmingAdvisory = () => {
          const temp = data.current.temperature_2m;
          const humidity = data.current.relative_humidity_2m;
          const rain = data.current.rain || 0;
          const uv = data.current.uv_index || 0;
          const precipProb = todayPrecipProb;
          
          const advisories = [];
          
          if (precipProb > 60) advisories.push("🌧️ High chance of rain - postpone spraying");
          if (temp > 35) advisories.push("🔥 Heat alert - irrigate crops in evening");
          if (temp < 10) advisories.push("❄️ Cold weather - protect sensitive crops");
          if (humidity > 80 && temp > 25) advisories.push("🦠 High humidity - watch for fungal diseases");
          if (uv > 7) advisories.push("☀️ High UV - avoid fieldwork 11am-3pm");
          if (rain === 0 && precipProb < 20 && humidity < 40) advisories.push("💧 Dry conditions - consider irrigation");
          if (precipProb < 30 && uv < 6 && temp >= 15 && temp <= 30) advisories.push("✅ Good conditions for spraying/fertilizing");
          
          return advisories.length > 0 ? advisories : ["🌱 Normal farming conditions"];
        };
        
        setWeather({
          location: `${location.village || location.city || ""}${location.village && location.city ? ` (${location.city})` : ""}${location.region ? ", " + location.region : ""}`.replace(/^, /, "") || "Your Location",
          coordinates: `${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E`,
          temperature: `${Math.round(data.current.temperature_2m)}°C`,
          feelsLike: `${Math.round(data.current.apparent_temperature)}°C`,
          condition: weatherInfo.desc,
          icon: weatherInfo.icon,
          humidity: `${data.current.relative_humidity_2m}%`,
          windspeed: `${Math.round(data.current.wind_speed_10m)} km/h`,
          windDirection: data.current.wind_direction_10m,
          uvIndex: data.current.uv_index?.toFixed(1) || "N/A",
          soilTemp: data.current.soil_temperature_0cm ? `${Math.round(data.current.soil_temperature_0cm)}°C` : "N/A",
          precipitation: `${data.current.precipitation || 0} mm`,
          precipProbability: `${todayPrecipProb}%`,
          sunrise: data.daily?.sunrise?.[0] ? new Date(data.daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A",
          sunset: data.daily?.sunset?.[0] ? new Date(data.daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "N/A",
          farmingAdvisory: getFarmingAdvisory(),
          lastUpdated: new Date().toLocaleTimeString(),
        });
        
        if (data.daily) {
          const forecastData = data.daily.time.slice(1, 7).map((date, idx) => ({
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
            maxTemp: `${Math.round(data.daily.temperature_2m_max[idx + 1])}°`,
            minTemp: `${Math.round(data.daily.temperature_2m_min[idx + 1])}°`,
            icon: getWeatherInfo(data.daily.weathercode[idx + 1]).icon,
            rain: `${data.daily.precipitation_sum?.[idx + 1] || 0}mm`,
            rainProb: `${data.daily.precipitation_probability_max?.[idx + 1] || 0}%`,
          }));
          setForecast(forecastData);
        }
      }
      setWeatherLoading(false);
    } catch (e) {
      console.error("Weather fetch error:", e);
      setWeatherError("Failed to fetch weather. Please try again.");
      setWeatherLoading(false);
    }
  };

const fetchMarket = async () => {
  setMarketLoading(true);
  setMarketError(null);
  
  try {
    // Use live market prices API that scrapes KisanDeals
    const params = new URLSearchParams();
    params.append("state", selectedState);
    if (selectedCommodity !== "all") params.append("commodity", selectedCommodity);
    
    const response = await axios.get(`${API_URL}/api/live-market-prices?${params.toString()}`);
    
    if (response.data.success || response.data.data?.length > 0) {
      // Add trend calculation based on min/max price difference
      const enhancedData = response.data.data.map(item => ({
        ...item,
        trend: item.modalPrice > item.minPrice * 1.05 ? "up" : 
               item.modalPrice < item.maxPrice * 0.95 ? "down" : "stable",
        changePercent: ((item.maxPrice - item.minPrice) / item.modalPrice * 50).toFixed(1),
      }));
      
      setMarket(enhancedData);
      setMarketSource(response.data.source || "KisanDeals");
      setMarketLastUpdated(response.data.lastUpdated || new Date().toISOString());
      
      // Extract unique states and commodities for filters
      const states = [...new Set(enhancedData.map(d => d.state).filter(Boolean))];
      const commodities = [...new Set(enhancedData.map(d => d.commodity).filter(Boolean))];
      if (states.length) setMarketStates(states);
      if (commodities.length) setMarketCommodities(commodities);
    } else {
      setMarketError(response.data.message || "No prices found for this selection");
    }
  } catch (error) {
    console.error("Market fetch error:", error);
    setMarketError("Could not fetch live prices. Using estimated data.");
    // Fallback to static data
    setMarket([
      { commodity: "Wheat", icon: "🌾", modalPrice: 2275, minPrice: 2100, maxPrice: 2400, unit: "quintal", trend: "up", changePercent: 1.5, state: "Punjab", mandi: "Khanna", isLive: false },
      { commodity: "Rice (Paddy)", icon: "🍚", modalPrice: 2183, minPrice: 2000, maxPrice: 2300, unit: "quintal", trend: "stable", changePercent: 0, state: "Punjab", mandi: "Amritsar", isLive: false },
      { commodity: "Cotton", icon: "☁️", modalPrice: 6620, minPrice: 6200, maxPrice: 6800, unit: "quintal", trend: "down", changePercent: -0.8, state: "Punjab", mandi: "Bathinda", isLive: false },
      { commodity: "Mustard", icon: "💛", modalPrice: 5650, minPrice: 5400, maxPrice: 5850, unit: "quintal", trend: "up", changePercent: 0.5, state: "Punjab", mandi: "Fazilka", isLive: false },
      { commodity: "Potato", icon: "🥔", modalPrice: 1200, minPrice: 1000, maxPrice: 1450, unit: "quintal", trend: "stable", changePercent: 0.2, state: "Punjab", mandi: "Jalandhar", isLive: false },
    ]);
    setMarketSource("Estimated");
  }
  
  setMarketLoading(false);
};

// Fetch price for selected crop from calendar
const fetchMyCropPrice = async (cropName) => {
  if (!cropName || cropName === "Select") {
    setMyCropPrice(null);
    return;
  }
  
  setMyCropPriceLoading(true);
  
  try {
    // Map crop names to commodity names used in market API
    const cropMapping = {
      "Wheat": "WHEAT",
      "Rice": "RICE",
      "Maize": "MAIZE",
      "Cotton": "COTTON",
      "Sugarcane": "SUGARCANE",
      "Potato": "POTATO",
      "Mustard": "MUSTARD",
      "Bajra": "BAJRA",
    };
    
    const commodity = cropMapping[cropName] || cropName.toUpperCase();
    const params = new URLSearchParams();
    params.append("state", selectedState);
    params.append("commodity", commodity);
    
    const response = await axios.get(`${API_URL}/api/live-market-prices?${params.toString()}`);
    
    if (response.data.data?.length > 0) {
      const priceData = response.data.data[0]; // Get first matching price
      
      // Calculate average from all prices for this commodity
      const allPrices = response.data.data;
      const avgPrice = Math.round(allPrices.reduce((sum, p) => sum + p.modalPrice, 0) / allPrices.length);
      const minPrice = Math.min(...allPrices.map(p => p.minPrice));
      const maxPrice = Math.max(...allPrices.map(p => p.maxPrice));
      
      const newPriceData = {
        commodity: cropName,
        icon: cropOptions.find(c => c.name === cropName)?.icon || "🌱",
        avgPrice: avgPrice,
        minPrice: minPrice,
        maxPrice: maxPrice,
        modalPrice: avgPrice,
        mandi: priceData.mandi || "State Average",
        state: selectedState.replace(/-/g, ' '),
        isLive: priceData.isLive !== false,
        source: response.data.source,
        lastUpdated: new Date().toISOString(),
        priceCount: allPrices.length,
      };
      
      // Check for price change and show notification
      if (previousCropPrice && priceAlertEnabled) {
        const priceChange = newPriceData.avgPrice - previousCropPrice.avgPrice;
        const changePercent = ((priceChange / previousCropPrice.avgPrice) * 100).toFixed(1);
        
        if (Math.abs(priceChange) > 50) { // Significant change (>₹50)
          const trend = priceChange > 0 ? "up" : "down";
          const trendText = priceChange > 0 ? t.priceUp : t.priceDown;
          const trendEmoji = priceChange > 0 ? "📈" : "📉";
          
          showNotification(
            `${trendEmoji} ${cropName}: ${trendText}! ₹${Math.abs(priceChange).toLocaleString()} (${changePercent}%) - ₹${newPriceData.avgPrice.toLocaleString()}/${t.perQuintal}`,
            priceChange > 0 ? "success" : "warning"
          );
        }
      }
      
      setPreviousCropPrice(myCropPrice); // Store previous for next comparison
      setMyCropPrice(newPriceData);
      setLastPriceCheck(new Date().toISOString());
    } else {
      // No live data, use fallback with estimated prices
      const fallbackPrices = {
        "Wheat": { price: 2275, msp: 2275 },
        "Rice": { price: 2183, msp: 2183 },
        "Maize": { price: 2090, msp: 2090 },
        "Cotton": { price: 6620, msp: 6620 },
        "Sugarcane": { price: 315, msp: 315 },
        "Potato": { price: 1200, msp: null },
        "Mustard": { price: 5650, msp: 5650 },
        "Bajra": { price: 2500, msp: 2500 },
      };
      
      const fallback = fallbackPrices[cropName] || { price: 2000, msp: null };
      setMyCropPrice({
        commodity: cropName,
        icon: cropOptions.find(c => c.name === cropName)?.icon || "🌱",
        avgPrice: fallback.price,
        minPrice: Math.round(fallback.price * 0.9),
        maxPrice: Math.round(fallback.price * 1.1),
        modalPrice: fallback.price,
        msp: fallback.msp,
        mandi: "Estimated",
        state: selectedState.replace(/-/g, ' '),
        isLive: false,
        source: "Estimated",
        lastUpdated: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error fetching crop price:", error);
    setMyCropPrice(null);
  }
  
  setMyCropPriceLoading(false);
};

// Auto-fetch price when selected crop changes
React.useEffect(() => {
  if (selectedCrop && selectedCrop !== "Select") {
    fetchMyCropPrice(selectedCrop);
  } else {
    setMyCropPrice(null);
  }
}, [selectedCrop, selectedState]);

// Periodic price refresh (every 5 minutes)
React.useEffect(() => {
  if (selectedCrop && selectedCrop !== "Select" && priceAlertEnabled) {
    const interval = setInterval(() => {
      fetchMyCropPrice(selectedCrop);
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }
}, [selectedCrop, priceAlertEnabled]);

// Toggle favorite commodity
const toggleFavorite = (commodityName) => {
  setFavoriteItems(prev => 
    prev.includes(commodityName) 
      ? prev.filter(c => c !== commodityName)
      : [...prev, commodityName]
  );
};

// Filter market data based on search
const filteredMarket = market.filter(item => 
  item.commodity.toLowerCase().includes(marketSearch.toLowerCase()) ||
  item.mandi.toLowerCase().includes(marketSearch.toLowerCase())
);

const landingFeatures = [
  {
    tag: "AI Powered",
    title: "Disease and Pest Detection",
    desc: "Upload a crop photo and get AI-based plant identification, disease signals, severity hints, and practical treatment direction in simple language.",
  },
  {
    tag: "Live Data",
    title: "Market Prices",
    desc: "Check mandi rates by state and crop, compare trends, and take better selling decisions based on current market movement instead of guesswork.",
  },
  {
    tag: "Local",
    title: "Weather Forecast",
    desc: "Use your real location weather with farming advisories like rain alerts, spray timing, heat warnings, and daily field planning guidance.",
  },
  {
    tag: "Calendar",
    title: "Crop Calendar",
    desc: "Follow a stage-wise crop roadmap from land preparation to harvest with reminders and actionable tips to avoid missing key operations.",
  },
  {
    tag: "Smart Chat",
    title: "GreenGeenie Assistant",
    desc: "Ask farming questions in your preferred language and get instant AI responses for crop care, market planning, and weather-based actions.",
  },
  {
    tag: "ML",
    title: "Plant Detection History",
    desc: "View previous scan reports in one place, track crop health over time, and spot whether conditions are improving or getting worse.",
  },
];

const landingContent = {
  en: {
    eyebrow: "Agricultural Assistant",
    heroLine1: "Smart Farming",
    heroLine2: "for",
    heroAccent: "Bharat",
    heroDesc:
      "Detect crop issues, watch mandi prices, plan operations, and get weather-driven decisions in one clean app.",
    explore: "Explore Features",
    howItWorks: "How it works",
    suiteEyebrow: "Full Feature Suite",
    suiteTitle: "Six tools. One powerful app.",
    guideButton: "Replay guide cards",
    buttonGuides: {
      navExplore: "Opens the full feature dashboard.",
      heroExplore: "Jump directly to tools and start using features.",
      howItWorks: "Scroll to feature explanations and working flow.",
      replay: "Restart rotating guide cards for demo narration.",
    },
    buttonRoutes: {
      navExplore: "Feature Hub dashboard",
      heroExplore: "Feature Hub home",
      howItWorks: "Feature explanation section",
      replay: "Feature guide replay",
    },
    flowTitle: "How it works in real farming",
    flowDesc: "From image to action: Krishi Saarthi turns field data into practical daily decisions.",
    flowDetailTitle: "What happens at each stage",
    flowDetailDesc: "This is not just information display. Each module converts input into field-ready action.",
    flowDetails: [
      {
        title: "Farmer Input",
        desc: "Crop photo, selected crop, location, and language become the base context for guidance.",
      },
      {
        title: "AI + Live Data Engine",
        desc: "Plant analysis, weather signals, and mandi rates combine into one practical decision layer.",
      },
      {
        title: "Actionable Output",
        desc: "Simple next steps: when to spray, when to irrigate, and when selling conditions look better.",
      },
    ],
    featureGuides: [
      {
        access: "How to access: Explore Features -> Disease and Pest Detection -> Upload crop photo.",
        meaning: "What it means: AI checks crop health, detects possible disease signs, and suggests next action.",
      },
      {
        access: "How to access: Explore Features -> Market Prices -> Select state and fetch prices.",
        meaning: "What it means: You can compare mandi rates before deciding where and when to sell.",
      },
      {
        access: "How to access: Explore Features -> Weather Prediction -> Detect location.",
        meaning: "What it means: Get local forecast plus practical advisories for irrigation and spraying.",
      },
      {
        access: "How to access: Explore Features -> Crop Calendar -> Select your crop.",
        meaning: "What it means: Follow stage-by-stage reminders from sowing to harvesting.",
      },
      {
        access: "How to access: Use GreenGeenie chat or voice buttons in feature hub.",
        meaning: "What it means: Ask farming questions in your preferred language and get instant guidance.",
      },
      {
        access: "How to access: Open Plant Detection History from navigation.",
        meaning: "What it means: Review past scan reports and monitor crop condition changes over time.",
      },
    ],
    steps: [
      {
        num: "01",
        title: "Capture and Choose",
        desc: "Farmer chooses language, uploads crop image, and selects crop or state details.",
      },
      {
        num: "02",
        title: "Analyze and Compare",
        desc: "AI analyzes crop health while weather and mandi modules fetch local insights.",
      },
      {
        num: "03",
        title: "Act with Confidence",
        desc: "Farmer gets clear next steps for spraying, irrigation, selling, and timing.",
      },
    ],
    features: landingFeatures,
  },
  hi: {
    eyebrow: "कृषि सहायक",
    heroLine1: "स्मार्ट खेती",
    heroLine2: "के लिए",
    heroAccent: "भारत",
    heroDesc:
      "फसल समस्याएं पहचानें, मंडी भाव देखें, खेती की योजना बनाएं और मौसम आधारित फैसले एक ही ऐप में लें।",
    explore: "फीचर्स देखें",
    howItWorks: "कैसे काम करता है",
    suiteEyebrow: "पूरा फीचर सूट",
    suiteTitle: "छह टूल्स, एक दमदार ऐप।",
    guideButton: "गाइड कार्ड फिर दिखाएं",
    buttonGuides: {
      navExplore: "पूरा फीचर डैशबोर्ड खोलता है।",
      heroExplore: "सीधे टूल्स पर जाएं और फीचर इस्तेमाल करें।",
      howItWorks: "नीचे जाकर फीचर समझें और फ्लो देखें।",
      replay: "डेमो के लिए गाइड कार्ड फिर से चलाएं।",
    },
    flowTitle: "वास्तविक खेती में यह कैसे काम करता है",
    flowDesc: "फोटो से फैसले तक: ऐप खेत की जानकारी को सीधे उपयोगी कार्रवाई में बदलता है।",
    flowDetailTitle: "हर चरण में क्या होता है",
    flowDetailDesc: "यह सिर्फ जानकारी नहीं दिखाता, बल्कि सीधे काम की सलाह देता है।",
    flowDetails: [
      { title: "किसान इनपुट", desc: "फोटो, फसल चयन, लोकेशन और भाषा के आधार पर संदर्भ तैयार होता है।" },
      { title: "AI + लाइव डेटा", desc: "प्लांट विश्लेषण, मौसम और मंडी डेटा मिलकर निर्णय सहायता देते हैं।" },
      { title: "स्पष्ट कार्रवाई", desc: "कब छिड़काव, कब सिंचाई और कब बिक्री बेहतर है, यह साफ बताया जाता है।" },
    ],
    steps: [
      {
        num: "01",
        title: "इनपुट दें",
        desc: "किसान भाषा चुनता है, फोटो अपलोड करता है और फसल/राज्य चुनता है।",
      },
      {
        num: "02",
        title: "विश्लेषण",
        desc: "AI फसल का विश्लेषण करता है और मौसम व मंडी मॉड्यूल डेटा लाते हैं।",
      },
      {
        num: "03",
        title: "कार्रवाई",
        desc: "छिड़काव, सिंचाई, बिक्री और समय पर स्पष्ट सलाह मिलती है।",
      },
    ],
    features: [
      {
        tag: "AI",
        title: "रोग और कीट पहचान",
        desc: "फसल की फोटो स्कैन करें और संभावित समस्या के लिए तुरंत मार्गदर्शन पाएं।",
      },
      {
        tag: "Live",
        title: "मंडी भाव",
        desc: "राज्य और फसल के अनुसार लाइव कीमतें देखें और सही समय पर बिक्री करें।",
      },
      {
        tag: "Local",
        title: "मौसम पूर्वानुमान",
        desc: "स्थानीय मौसम और खेती सलाह से रोज़ाना बेहतर निर्णय लें।",
      },
      {
        tag: "Calendar",
        title: "फसल कैलेंडर",
        desc: "बुवाई से कटाई तक चरणबद्ध रिमाइंडर और कार्ययोजना पाएं।",
      },
      {
        tag: "Chat",
        title: "ग्रीनजीनी सहायक",
        desc: "अपनी भाषा में खेती से जुड़ा सवाल पूछें और तुरंत मदद लें।",
      },
      {
        tag: "History",
        title: "डिटेक्शन हिस्ट्री",
        desc: "पुरानी जांच रिपोर्ट देखें और फसल की हालत का ट्रैक रखें।",
      },
    ],
  },
  pa: {
    eyebrow: "ਖੇਤੀ ਸਹਾਇਕ",
    heroLine1: "ਸਮਾਰਟ ਖੇਤੀ",
    heroLine2: "ਲਈ",
    heroAccent: "ਭਾਰਤ",
    heroDesc:
      "ਫਸਲ ਸਮੱਸਿਆਵਾਂ ਪਛਾਣੋ, ਮੰਡੀ ਰੇਟ ਵੇਖੋ, ਕੰਮ ਦੀ ਯੋਜਨਾ ਬਣਾਓ ਅਤੇ ਮੌਸਮ ਅਧਾਰਤ ਫੈਸਲੇ ਲਓ।",
    explore: "ਫੀਚਰ ਵੇਖੋ",
    howItWorks: "ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ",
    suiteEyebrow: "ਪੂਰਾ ਫੀਚਰ ਸੂਟ",
    suiteTitle: "ਛੇ ਟੂਲ, ਇੱਕ ਤਾਕਤਵਰ ਐਪ।",
    guideButton: "ਗਾਈਡ ਕਾਰਡ ਦੁਬਾਰਾ ਵੇਖੋ",
    buttonGuides: {
      navExplore: "ਪੂਰਾ ਫੀਚਰ ਡੈਸ਼ਬੋਰਡ ਖੋਲ੍ਹਦਾ ਹੈ।",
      heroExplore: "ਸਿੱਧਾ ਟੂਲਾਂ 'ਤੇ ਜਾਓ ਤੇ ਵਰਤਣਾ ਸ਼ੁਰੂ ਕਰੋ।",
      howItWorks: "ਫੀਚਰ ਅਤੇ ਵਰਕਫਲੋ ਵੇਖਣ ਲਈ ਹੇਠਾਂ ਜਾਓ।",
      replay: "ਡੈਮੋ ਲਈ ਗਾਈਡ ਕਾਰਡ ਮੁੜ ਚਲਾਓ।",
    },
    flowTitle: "ਅਸਲੀ ਖੇਤੀ ਵਿੱਚ ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ",
    flowDesc: "ਫੋਟੋ ਤੋਂ ਫੈਸਲੇ ਤੱਕ: ਐਪ ਖੇਤ ਦੀ ਜਾਣਕਾਰੀ ਨੂੰ ਕੰਮ ਦੀ ਸਲਾਹ ਵਿੱਚ ਬਦਲਦਾ ਹੈ।",
    flowDetailTitle: "ਹਰ ਪੜਾਅ ਵਿੱਚ ਕੀ ਹੁੰਦਾ ਹੈ",
    flowDetailDesc: "ਇਹ ਸਿਰਫ ਜਾਣਕਾਰੀ ਨਹੀਂ, ਸਿੱਧੀ ਕੰਮ ਦੀ ਸਲਾਹ ਦਿੰਦਾ ਹੈ।",
    flowDetails: [
      { title: "ਕਿਸਾਨ ਇਨਪੁੱਟ", desc: "ਫੋਟੋ, ਫਸਲ ਚੋਣ, ਲੋਕੇਸ਼ਨ ਅਤੇ ਭਾਸ਼ਾ ਨਾਲ ਕਾਂਟੈਕਸਟ ਬਣਦਾ ਹੈ।" },
      { title: "AI + ਲਾਈਵ ਡਾਟਾ", desc: "ਪਲਾਂਟ ਵਿਸ਼ਲੇਸ਼ਣ, ਮੌਸਮ ਅਤੇ ਮੰਡੀ ਡਾਟਾ ਮਿਲ ਕੇ ਮਦਦ ਕਰਦੇ ਹਨ।" },
      { title: "ਸਪਸ਼ਟ ਕਾਰਵਾਈ", desc: "ਕਦੋਂ ਸਪਰੇ, ਕਦੋਂ ਪਾਣੀ ਤੇ ਕਦੋਂ ਵੇਚਣਾ ਵਧੀਆ ਹੈ, ਸਾਫ ਦਿਖਦਾ ਹੈ।" },
    ],
    steps: [
      {
        num: "01",
        title: "ਇਨਪੁੱਟ ਦਿਓ",
        desc: "ਕਿਸਾਨ ਭਾਸ਼ਾ ਚੁਣਦਾ, ਫੋਟੋ ਅਪਲੋਡ ਕਰਦਾ ਅਤੇ ਫਸਲ/ਸਟੇਟ ਚੁਣਦਾ ਹੈ।",
      },
      {
        num: "02",
        title: "ਵਿਸ਼ਲੇਸ਼ਣ",
        desc: "AI ਫਸਲ ਦੀ ਹਾਲਤ ਵੇਖਦਾ ਹੈ ਅਤੇ ਮੌਸਮ/ਮੰਡੀ ਡਾਟਾ ਜੋੜਦਾ ਹੈ।",
      },
      {
        num: "03",
        title: "ਕਾਰਵਾਈ",
        desc: "ਸਪਸ਼ਟ ਅਗਲੇ ਕਦਮ ਮਿਲਦੇ ਹਨ: ਪਾਣੀ, ਦਵਾਈ, ਵੇਚਣ ਦਾ ਸਮਾਂ।",
      },
    ],
    features: [
      {
        tag: "AI",
        title: "ਬਿਮਾਰੀ ਤੇ ਕੀਟ ਪਛਾਣ",
        desc: "ਫਸਲ ਦੀ ਤਸਵੀਰ ਸਕੈਨ ਕਰੋ ਅਤੇ ਸਮੱਸਿਆ ਲਈ ਤੁਰੰਤ ਸਲਾਹ ਲਵੋ।",
      },
      {
        tag: "Live",
        title: "ਮੰਡੀ ਭਾਅ",
        desc: "ਰਾਜ ਅਤੇ ਫਸਲ ਮੁਤਾਬਕ ਤਾਜ਼ਾ ਰੇਟ ਵੇਖੋ ਤੇ ਠੀਕ ਵੇਲੇ ਵੇਚੋ।",
      },
      {
        tag: "Local",
        title: "ਮੌਸਮ ਅਨੁਮਾਨ",
        desc: "ਲੋਕਲ ਮੌਸਮ ਅਤੇ ਖੇਤੀ ਸਲਾਹ ਨਾਲ ਦਿਨ-प्रतिदਿਨ ਫੈਸਲੇ ਸੁਧਾਰੋ।",
      },
      {
        tag: "Calendar",
        title: "ਫਸਲ ਕੈਲੰਡਰ",
        desc: "ਬੀਜਾਈ ਤੋਂ ਕਟਾਈ ਤੱਕ ਸਟੇਜ-ਵਾਇਜ਼ ਰਿਮਾਈਂਡਰ ਪਾਓ।",
      },
      {
        tag: "Chat",
        title: "GreenGeenie ਸਹਾਇਕ",
        desc: "ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਵਾਲ ਪੁੱਛੋ ਅਤੇ ਤੁਰੰਤ ਮਦਦ ਲਵੋ।",
      },
      {
        tag: "History",
        title: "ਡਿਟੈਕਸ਼ਨ ਹਿਸਟਰੀ",
        desc: "ਪੁਰਾਣੇ ਨਤੀਜੇ ਵੇਖੋ ਅਤੇ ਫਸਲ ਦੀ ਹਾਲਤ ਟਰੈਕ ਕਰੋ।",
      },
    ],
  },
  ta: {
    eyebrow: "விவசாய உதவியாளர்",
    heroLine1: "ஸ்மார்ட் விவசாயம்",
    heroLine2: "இந்தியாவிற்காக",
    heroAccent: "பாரத்",
    heroDesc:
      "பயிர் பிரச்சினைகளை கண்டறியவும், சந்தை விலைகளை பார்க்கவும், செயல்களை திட்டமிடவும், வானிலை அடிப்படையில் முடிவு எடுக்கவும்.",
    explore: "அம்சங்களை பாருங்கள்",
    howItWorks: "எப்படி வேலை செய்கிறது",
    suiteEyebrow: "முழு அம்சத் தொகுப்பு",
    suiteTitle: "ஆறு கருவிகள். ஒரு சக்திவாய்ந்த பயன்பாடு.",
    guideButton: "வழிகாட்டி கார்டுகளை மீண்டும் காண்க",
    buttonGuides: {
      navExplore: "முழு அம்ச டாஷ்போர்டை திறக்கும்.",
      heroExplore: "நேராக கருவிகளுக்கு சென்று பயன்படுத்த தொடங்கவும்.",
      howItWorks: "அம்ச விளக்கம் மற்றும் ஓட்டத்தைப் பார்க்க கீழே செல்லவும்.",
      replay: "டெமோவுக்கு வழிகாட்டி கார்டுகளை மீண்டும் தொடங்கவும்.",
    },
    flowTitle: "நிஜ விவசாயத்தில் இது எப்படி செயல்படுகிறது",
    flowDesc: "படத்திலிருந்து செயலுக்கு: பயன்பாடு விவசாய தரவை நேரடி முடிவுகளாக மாற்றுகிறது.",
    flowDetailTitle: "ஒவ்வொரு கட்டத்திலும் என்ன நடக்கிறது",
    flowDetailDesc: "இது தகவல் மட்டும் அல்ல, நேரடி செயல் வழிகாட்டலை தருகிறது.",
    flowDetails: [
      { title: "விவசாயி உள்ளீடு", desc: "படம், பயிர் தேர்வு, இடம், மொழி ஆகியவற்றால் சூழல் உருவாகிறது." },
      { title: "AI + நேரடி தரவு", desc: "பயிர் பகுப்பாய்வு, வானிலை, சந்தை தரவு ஒன்றாக இணைகிறது." },
      { title: "செயல்பாட்டு முடிவு", desc: "எப்போது தெளிக்க, எப்போது நீர்ப்பாசனம் செய்ய, எப்போது விற்பது என்று தெளிவாக கிடைக்கும்." },
    ],
    steps: [
      {
        num: "01",
        title: "உள்ளீடு கொடுக்கவும்",
        desc: "விவசாயி மொழியை தேர்ந்து படம் பதிவேற்றி பயிர்/மாநிலத்தை தேர்வுசெய்கிறார்.",
      },
      {
        num: "02",
        title: "பகுப்பாய்வு",
        desc: "AI பயிரை பகுப்பாய்வு செய்கிறது; வானிலை மற்றும் சந்தை தரவு சேர்க்கப்படுகிறது.",
      },
      {
        num: "03",
        title: "நடவடிக்கை",
        desc: "நீர்ப்பாசனம், தெளிப்பு, விற்பனை நேரம் போன்ற தெளிவான அடுத்த படிகள் கிடைக்கும்.",
      },
    ],
    features: [
      {
        tag: "AI",
        title: "நோய் மற்றும் பூச்சி கண்டறிதல்",
        desc: "பயிர் படத்தை ஸ்கேன் செய்து சாத்தியமான பிரச்சினைக்கு உடனடி வழிகாட்டுதல் பெறுங்கள்.",
      },
      {
        tag: "Live",
        title: "சந்தை விலைகள்",
        desc: "மாநிலம் மற்றும் பயிர் அடிப்படையில் நேரடி விலைகளை பார்த்து சரியான நேரத்தில் விற்பனை செய்யுங்கள்.",
      },
      {
        tag: "Local",
        title: "வானிலை முன்னறிவு",
        desc: "உள்ளூர் வானிலை மற்றும் விவசாய ஆலோசனையுடன் தினசரி முடிவுகளை மேம்படுத்துங்கள்.",
      },
      {
        tag: "Calendar",
        title: "பயிர் காலண்டர்",
        desc: "விதைப்பு முதல் அறுவடை வரை கட்டம் கட்டமாக நினைவூட்டல்கள் பெறுங்கள்.",
      },
      {
        tag: "Chat",
        title: "GreenGeenie உதவியாளர்",
        desc: "உங்கள் மொழியில் கேள்வி கேட்டு உடனடி உதவி பெறுங்கள்.",
      },
      {
        tag: "History",
        title: "கண்டறிதல் வரலாறு",
        desc: "முந்தைய பகுப்பாய்வுகளை பார்த்து பயிர் நல மாற்றத்தை கண்காணிக்கவும்.",
      },
    ],
  },
};

const helperLabels = {
  en: {
    goesTo: "Goes to",
    miniGuide: "Mini guide",
    whatThisDoes: "What this does",
    whereToFind: "Where to find",
    openExploreFallback: "Open Explore Features to access this module.",
  },
  hi: {
    goesTo: "यहां जाता है",
    miniGuide: "छोटा गाइड",
    whatThisDoes: "यह क्या करता है",
    whereToFind: "कहां मिलेगा",
    openExploreFallback: "इस मॉड्यूल के लिए फीचर्स सेक्शन खोलें।",
  },
  pa: {
    goesTo: "ਇੱਥੇ ਜਾਂਦਾ ਹੈ",
    miniGuide: "ਮਿੰਨੀ ਗਾਈਡ",
    whatThisDoes: "ਇਹ ਕੀ ਕਰਦਾ ਹੈ",
    whereToFind: "ਕਿੱਥੇ ਮਿਲੇਗਾ",
    openExploreFallback: "ਇਹ ਮੋਡੀਊਲ ਵਰਤਣ ਲਈ ਫੀਚਰ ਖੋਲ੍ਹੋ।",
  },
  ta: {
    goesTo: "இங்கு செல்கிறது",
    miniGuide: "சிறு வழிகாட்டி",
    whatThisDoes: "இது என்ன செய்கிறது",
    whereToFind: "எங்கே கிடைக்கும்",
    openExploreFallback: "இந்த அம்சத்தை திறக்க Explore Features செல்லவும்.",
  },
};

const buttonRouteLabels = {
  en: {
    navExplore: "Feature Hub dashboard",
    heroExplore: "Feature Hub home",
    howItWorks: "Feature explanation section",
    replay: "Feature guide replay",
  },
  hi: {
    navExplore: "फीचर हब डैशबोर्ड",
    heroExplore: "फीचर हब होम",
    howItWorks: "फीचर जानकारी सेक्शन",
    replay: "गाइड रीप्ले",
  },
  pa: {
    navExplore: "ਫੀਚਰ ਹੱਬ ਡੈਸ਼ਬੋਰਡ",
    heroExplore: "ਫੀਚਰ ਹੱਬ ਹੋਮ",
    howItWorks: "ਫੀਚਰ ਜਾਣਕਾਰੀ ਸੈਕਸ਼ਨ",
    replay: "ਗਾਈਡ ਰੀਪਲੇ",
  },
  ta: {
    navExplore: "அம்ச ஹப் டாஷ்போர்டு",
    heroExplore: "அம்ச ஹப் முகப்பு",
    howItWorks: "அம்ச விளக்கம் பகுதி",
    replay: "வழிகாட்டி மீள்பார்வு",
  },
};

const featureGuidesByLanguage = {
  en: landingContent.en.featureGuides,
  hi: [
    { access: "कैसे खोलें: फीचर्स देखें -> रोग और कीट पहचान -> फसल फोटो अपलोड करें।", meaning: "यह क्या करता है: AI फसल की जांच करके संभावित बीमारी/कीट संकेत और अगला कदम बताता है।" },
    { access: "कैसे खोलें: फीचर्स देखें -> मंडी भाव -> राज्य चुनें और डेटा लाएं।", meaning: "यह क्या करता है: बिक्री से पहले अलग-अलग मंडी भाव की तुलना करने में मदद करता है।" },
    { access: "कैसे खोलें: फीचर्स देखें -> मौसम पूर्वानुमान -> लोकेशन पता करें।", meaning: "यह क्या करता है: स्थानीय मौसम और सिंचाई/स्प्रे के लिए सलाह देता है।" },
    { access: "कैसे खोलें: फीचर्स देखें -> फसल कैलेंडर -> फसल चुनें।", meaning: "यह क्या करता है: बुवाई से कटाई तक चरणवार रिमाइंडर देता है।" },
    { access: "कैसे खोलें: फीचर हब में ग्रीनजीनी चैट/वॉइस बटन का उपयोग करें।", meaning: "यह क्या करता है: आपकी भाषा में खेती से जुड़े सवालों का तुरंत जवाब देता है।" },
    { access: "कैसे खोलें: नेविगेशन से डिटेक्शन हिस्ट्री खोलें।", meaning: "यह क्या करता है: पुराने स्कैन रिपोर्ट देखकर फसल की हालत ट्रैक करने में मदद करता है।" },
  ],
  pa: [
    { access: "ਕਿਵੇਂ ਖੋਲ੍ਹੋ: ਫੀਚਰ ਵੇਖੋ -> ਬਿਮਾਰੀ ਤੇ ਕੀਟ ਪਛਾਣ -> ਫਸਲ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ।", meaning: "ਇਹ ਕੀ ਕਰਦਾ: AI ਫਸਲ ਦੀ ਹਾਲਤ ਵੇਖ ਕੇ ਸੰਭਾਵੀ ਸਮੱਸਿਆ ਅਤੇ ਅਗਲਾ ਕਦਮ ਦਿੰਦਾ ਹੈ।" },
    { access: "ਕਿਵੇਂ ਖੋਲ੍ਹੋ: ਫੀਚਰ ਵੇਖੋ -> ਮੰਡੀ ਭਾਅ -> ਸਟੇਟ ਚੁਣੋ ਅਤੇ ਡਾਟਾ ਲਵੋ।", meaning: "ਇਹ ਕੀ ਕਰਦਾ: ਵੇਚਣ ਤੋਂ ਪਹਿਲਾਂ ਮੰਡੀ ਭਾਅ ਤੁਲਨਾ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।" },
    { access: "ਕਿਵੇਂ ਖੋਲ੍ਹੋ: ਫੀਚਰ ਵੇਖੋ -> ਮੌਸਮ ਅਨੁਮਾਨ -> ਲੋਕੇਸ਼ਨ ਡਿਟੈਕਟ ਕਰੋ।", meaning: "ਇਹ ਕੀ ਕਰਦਾ: ਲੋਕਲ ਮੌਸਮ ਨਾਲ ਪਾਣੀ ਅਤੇ ਸਪਰੇ ਲਈ ਸਲਾਹ ਦਿੰਦਾ ਹੈ।" },
    { access: "ਕਿਵੇਂ ਖੋਲ੍ਹੋ: ਫੀਚਰ ਵੇਖੋ -> ਫਸਲ ਕੈਲੰਡਰ -> ਫਸਲ ਚੁਣੋ।", meaning: "ਇਹ ਕੀ ਕਰਦਾ: ਬੀਜਾਈ ਤੋਂ ਕਟਾਈ ਤੱਕ ਸਟੇਜ-ਵਾਇਜ਼ ਯਾਦ ਦਿਵਾਉਂਦਾ ਹੈ।" },
    { access: "ਕਿਵੇਂ ਖੋਲ੍ਹੋ: ਫੀਚਰ ਹੱਬ ਵਿੱਚ GreenGeenie ਚੈਟ/ਵੋਇਸ ਬਟਨ ਵਰਤੋ।", meaning: "ਇਹ ਕੀ ਕਰਦਾ: ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਵਿੱਚ ਖੇਤੀ ਸਵਾਲਾਂ ਦੇ ਤੁਰੰਤ ਜਵਾਬ ਦਿੰਦਾ ਹੈ।" },
    { access: "ਕਿਵੇਂ ਖੋਲ੍ਹੋ: ਨੇਵੀਗੇਸ਼ਨ ਤੋਂ ਡਿਟੈਕਸ਼ਨ ਹਿਸਟਰੀ ਖੋਲ੍ਹੋ।", meaning: "ਇਹ ਕੀ ਕਰਦਾ: ਪੁਰਾਣੇ ਸਕੈਨ ਨਤੀਜੇ ਨਾਲ ਫਸਲ ਹਾਲਤ ਟਰੈਕ ਕਰ ਸਕਦੇ ਹੋ।" },
  ],
  ta: [
    { access: "எப்படி திறப்பது: அம்சங்கள் -> நோய் மற்றும் பூச்சி கண்டறிதல் -> பயிர் படத்தை பதிவேற்றவும்.", meaning: "இது என்ன செய்கிறது: AI பயிர் நிலையை பகுப்பாய்வு செய்து அடுத்த நடவடிக்கையை சொல்கிறது." },
    { access: "எப்படி திறப்பது: அம்சங்கள் -> சந்தை விலைகள் -> மாநிலத்தை தேர்வு செய்து தரவை பெறவும்.", meaning: "இது என்ன செய்கிறது: விற்பனைக்கு முன் மண்டி விலைகளை ஒப்பிட உதவுகிறது." },
    { access: "எப்படி திறப்பது: அம்சங்கள் -> வானிலை -> இருப்பிடத்தை கண்டறியவும்.", meaning: "இது என்ன செய்கிறது: உள்ளூர் வானிலை மற்றும் பாசனம்/தெளிப்பு ஆலோசனையை தருகிறது." },
    { access: "எப்படி திறப்பது: அம்சங்கள் -> பயிர் காலண்டர் -> பயிரை தேர்வு செய்யவும்.", meaning: "இது என்ன செய்கிறது: விதைப்பு முதல் அறுவடை வரை கட்டப்படியான நினைவூட்டலை வழங்குகிறது." },
    { access: "எப்படி திறப்பது: அம்ச ஹபில் GreenGeenie அரட்டை/குரல் பொத்தான்களை பயன்படுத்தவும்.", meaning: "இது என்ன செய்கிறது: உங்கள் மொழியில் விவசாய கேள்விகளுக்கு உடனடி பதில் தருகிறது." },
    { access: "எப்படி திறப்பது: வழிசெலுத்தலிலிருந்து கண்டறிதல் வரலாற்றை திறக்கவும்.", meaning: "இது என்ன செய்கிறது: பழைய ஸ்கேன் முடிவுகளை பார்த்து பயிர் நிலை மாற்றத்தை கண்காணிக்க உதவுகிறது." },
  ],
};

const exploreContent = {
  en: {
    tabs: { home: "Home", detection: "Plant Detection", history: "History", back: "Back to Landing" },
    heroEyebrow: "Feature Hub",
    heroTitle: "Use all tools from one clean dashboard",
    heroDesc: "Quick access to disease diagnosis, crop timeline, weather advisory, market signals, and voice-enabled assistant.",
    diseaseTitle: "Disease and Pest Scan",
    diseaseDesc: "Upload crop image to detect possible disease signals and see health guidance instantly.",
    uploadPhoto: "Upload Crop Photo",
    focusFeature: "Focus Feature",
    analyzingImage: "Analyzing image...",
    cropTimelineTitle: "Crop Timeline",
    cropTimelineDesc: "Select a crop and follow stage-wise tasks from sowing to harvest with actionable reminders.",
    cropTimelineSummary: "schedule includes",
    cropTimelineStages: "stages.",
    cropTimelineFallback: "Pick a crop to preview your seasonal plan.",
    weatherTitle: "Weather and Advisory",
    weatherDesc: "Fetch real location weather and get practical farming advisories for irrigation and spray timing.",
    detectLocation: "Detect Location",
    getWeather: "Get Weather",
    fetchingWeather: "Fetching weather...",
    noWeatherLoaded: "No weather loaded yet.",
    forecastTitle: "7 Day Forecast",
    humidity: "Humidity",
    feelsLike: "Feels Like",
    wind: "Wind",
    rainProb: "Rain Prob",
    marketTitle: "Market Snapshot",
    marketDesc: "Compare mandi rates quickly and track your selected crop price trend before selling.",
    refreshPrices: "Refresh Prices",
    loadingMarket: "Loading market data...",
    noMarketLoaded: "No market data loaded yet.",
    cropLabel: "Crop",
    unitFallback: "quintal",
    assistantTitle: "GreenGeenie Assistant",
    assistantDesc: "Ask farming questions in your language, use voice input, and get instant AI responses for practical field decisions.",
    openAssistant: "Open Assistant",
    voiceInput: "Voice Input",
    historyTitle: "Plant Detection History",
    historyDesc: "Recent detection results are listed here, so you can track crop health changes without opening another page.",
    refreshHistory: "Refresh History View",
    loadingHistory: "Loading recent detections...",
    noHistory: "No detection history yet. Upload a crop photo to create records.",
    plantFallback: "Plant",
    conditionFallback: "Condition unknown",
  },
  hi: {
    tabs: { home: "होम", detection: "प्लांट डिटेक्शन", history: "हिस्ट्री", back: "लैंडिंग पर वापस" },
    heroEyebrow: "फीचर हब",
    heroTitle: "एक डैशबोर्ड से सभी टूल्स चलाएं",
    heroDesc: "रोग पहचान, फसल टाइमलाइन, मौसम सलाह, मंडी संकेत और वॉइस सहायक एक ही जगह।",
    diseaseTitle: "रोग और कीट स्कैन",
    diseaseDesc: "फसल फोटो अपलोड करें और तुरंत रोग संकेत व स्वास्थ्य मार्गदर्शन पाएं।",
    uploadPhoto: "फसल फोटो अपलोड करें",
    focusFeature: "फीचर पर जाएं",
    analyzingImage: "छवि का विश्लेषण हो रहा है...",
    cropTimelineTitle: "फसल टाइमलाइन",
    cropTimelineDesc: "फसल चुनें और बुवाई से कटाई तक चरणवार कार्य देखें।",
    cropTimelineSummary: "शेड्यूल में",
    cropTimelineStages: "चरण हैं।",
    cropTimelineFallback: "मौसमी योजना देखने के लिए फसल चुनें।",
    weatherTitle: "मौसम और सलाह",
    weatherDesc: "लोकेशन आधारित मौसम और सिंचाई/स्प्रे के लिए उपयोगी सलाह पाएं।",
    detectLocation: "लोकेशन पता करें",
    getWeather: "मौसम देखें",
    fetchingWeather: "मौसम देखा जा रहा है...",
    noWeatherLoaded: "अभी मौसम डेटा उपलब्ध नहीं है।",
    forecastTitle: "7 दिन का पूर्वानुमान",
    humidity: "नमी",
    feelsLike: "महसूस तापमान",
    wind: "हवा",
    rainProb: "बारिश संभावना",
    marketTitle: "मंडी स्नैपशॉट",
    marketDesc: "मंडी भाव तुलना करें और बिक्री से पहले सही निर्णय लें।",
    refreshPrices: "भाव रीफ्रेश करें",
    loadingMarket: "मंडी डेटा लोड हो रहा है...",
    noMarketLoaded: "अभी मंडी डेटा उपलब्ध नहीं है।",
    cropLabel: "फसल",
    unitFallback: "क्विंटल",
    assistantTitle: "ग्रीनजीनी सहायक",
    assistantDesc: "अपनी भाषा में सवाल पूछें, वॉइस इनपुट करें और तुरंत जवाब पाएं।",
    openAssistant: "सहायक खोलें",
    voiceInput: "वॉइस इनपुट",
    historyTitle: "डिटेक्शन हिस्ट्री",
    historyDesc: "हाल की रिपोर्ट यहां दिखती हैं ताकि आप बदलाव ट्रैक कर सकें।",
    refreshHistory: "हिस्ट्री रीफ्रेश करें",
    loadingHistory: "हाल की रिपोर्ट लोड हो रही हैं...",
    noHistory: "अभी कोई डिटेक्शन हिस्ट्री नहीं है। फसल फोटो अपलोड करें।",
    plantFallback: "पौधा",
    conditionFallback: "स्थिति अज्ञात",
  },
  pa: {
    tabs: { home: "ਹੋਮ", detection: "ਪਲਾਂਟ ਡਿਟੈਕਸ਼ਨ", history: "ਹਿਸਟਰੀ", back: "ਲੈਂਡਿੰਗ ਤੇ ਵਾਪਸ" },
    heroEyebrow: "ਫੀਚਰ ਹੱਬ",
    heroTitle: "ਇੱਕ ਡੈਸ਼ਬੋਰਡ ਤੋਂ ਸਾਰੇ ਟੂਲ ਵਰਤੋ",
    heroDesc: "ਬਿਮਾਰੀ ਪਛਾਣ, ਫਸਲ ਟਾਈਮਲਾਈਨ, ਮੌਸਮ ਸਲਾਹ, ਮੰਡੀ ਸੰਕੇਤ ਅਤੇ ਵੋਇਸ ਸਹਾਇਕ ਇਕੱਠੇ।",
    diseaseTitle: "ਬਿਮਾਰੀ ਅਤੇ ਕੀਟ ਸਕੈਨ",
    diseaseDesc: "ਫਸਲ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ ਅਤੇ ਤੁਰੰਤ ਸਿਹਤ ਸਲਾਹ ਲਵੋ।",
    uploadPhoto: "ਫਸਲ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ",
    focusFeature: "ਫੀਚਰ ਤੇ ਜਾਓ",
    analyzingImage: "ਤਸਵੀਰ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    cropTimelineTitle: "ਫਸਲ ਟਾਈਮਲਾਈਨ",
    cropTimelineDesc: "ਫਸਲ ਚੁਣੋ ਅਤੇ ਬੀਜਾਈ ਤੋਂ ਕਟਾਈ ਤੱਕ ਸਟੇਜ-ਵਾਇਜ਼ ਕੰਮ ਵੇਖੋ।",
    cropTimelineSummary: "ਸ਼ਡਿਊਲ ਵਿੱਚ",
    cropTimelineStages: "ਸਟੇਜ ਹਨ।",
    cropTimelineFallback: "ਮੌਸਮੀ ਯੋਜਨਾ ਵੇਖਣ ਲਈ ਫਸਲ ਚੁਣੋ।",
    weatherTitle: "ਮੌਸਮ ਅਤੇ ਸਲਾਹ",
    weatherDesc: "ਲੋਕੇਸ਼ਨ ਅਧਾਰਤ ਮੌਸਮ ਅਤੇ ਸਿੰਚਾਈ/ਸਪਰੇ ਲਈ ਸਲਾਹ ਪਾਓ।",
    detectLocation: "ਲੋਕੇਸ਼ਨ ਪਤਾ ਕਰੋ",
    getWeather: "ਮੌਸਮ ਵੇਖੋ",
    fetchingWeather: "ਮੌਸਮ ਲੱਭ ਰਿਹਾ ਹੈ...",
    noWeatherLoaded: "ਹਾਲੇ ਮੌਸਮ ਡਾਟਾ ਨਹੀਂ ਮਿਲਿਆ।",
    forecastTitle: "7 ਦਿਨ ਦਾ ਅਨੁਮਾਨ",
    humidity: "ਨਮੀ",
    feelsLike: "ਅਨੁਭਵ ਤਾਪਮਾਨ",
    wind: "ਹਵਾ",
    rainProb: "ਬਰਸਾਤ ਸੰਭਾਵਨਾ",
    marketTitle: "ਮੰਡੀ ਸਨੈਪਸ਼ਾਟ",
    marketDesc: "ਮੰਡੀ ਰੇਟ ਤੁਲਨਾ ਕਰੋ ਅਤੇ ਵੇਚਣ ਤੋਂ ਪਹਿਲਾਂ ਫੈਸਲਾ ਕਰੋ।",
    refreshPrices: "ਰੇਟ ਰਿਫਰੈਸ਼ ਕਰੋ",
    loadingMarket: "ਮੰਡੀ ਡਾਟਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    noMarketLoaded: "ਹਾਲੇ ਮੰਡੀ ਡਾਟਾ ਨਹੀਂ ਮਿਲਿਆ।",
    cropLabel: "ਫਸਲ",
    unitFallback: "ਕੁਇੰਟਲ",
    assistantTitle: "GreenGeenie ਸਹਾਇਕ",
    assistantDesc: "ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਵਾਲ ਪੁੱਛੋ, ਵੋਇਸ ਵਰਤੋ ਅਤੇ ਤੁਰੰਤ ਜਵਾਬ ਲਵੋ।",
    openAssistant: "ਸਹਾਇਕ ਖੋਲ੍ਹੋ",
    voiceInput: "ਵੋਇਸ ਇਨਪੁੱਟ",
    historyTitle: "ਡਿਟੈਕਸ਼ਨ ਹਿਸਟਰੀ",
    historyDesc: "ਹਾਲੀਆ ਰਿਪੋਰਟ ਇੱਥੇ ਮਿਲਦੀ ਹੈ ਤਾਂ ਜੋ ਤੁਸੀਂ ਬਦਲਾਵ ਟਰੈਕ ਕਰੋ।",
    refreshHistory: "ਹਿਸਟਰੀ ਰਿਫਰੈਸ਼ ਕਰੋ",
    loadingHistory: "ਹਾਲੀਆ ਰਿਪੋਰਟ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...",
    noHistory: "ਹਾਲੇ ਕੋਈ ਡਿਟੈਕਸ਼ਨ ਹਿਸਟਰੀ ਨਹੀਂ। ਫਸਲ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ।",
    plantFallback: "ਪੌਧਾ",
    conditionFallback: "ਹਾਲਤ ਅਣਜਾਣ",
  },
  ta: {
    tabs: { home: "முகப்பு", detection: "பிளாண்ட் கண்டறிதல்", history: "வரலாறு", back: "லேண்டிங்கிற்கு திரும்பு" },
    heroEyebrow: "அம்ச ஹப்",
    heroTitle: "ஒரே டாஷ்போர்டில் எல்லா கருவிகளும்",
    heroDesc: "நோய் கண்டறிதல், பயிர் காலவரிசை, வானிலை ஆலோசனை, சந்தை தகவல், குரல் உதவி அனைத்தும் ஒரே இடத்தில்.",
    diseaseTitle: "நோய் மற்றும் பூச்சி ஸ்கேன்",
    diseaseDesc: "பயிர் படத்தை பதிவேற்றி உடனடி ஆரோக்கிய வழிகாட்டலை பெறுங்கள்.",
    uploadPhoto: "பயிர் படத்தை பதிவேற்றவும்",
    focusFeature: "அம்சத்தை திறக்கவும்",
    analyzingImage: "படம் பகுப்பாய்வு செய்யப்படுகிறது...",
    cropTimelineTitle: "பயிர் காலவரிசை",
    cropTimelineDesc: "பயிரை தேர்ந்து விதைப்பு முதல் அறுவடை வரை கட்டப்படியான பணிகளைப் பின்பற்றுங்கள்.",
    cropTimelineSummary: "அட்டவணையில்",
    cropTimelineStages: "நிலைகள் உள்ளன.",
    cropTimelineFallback: "பருவத் திட்டம் பார்க்க பயிரை தேர்வு செய்யவும்.",
    weatherTitle: "வானிலை மற்றும் ஆலோசனை",
    weatherDesc: "இருப்பிட வானிலை மற்றும் பாசனம்/தெளிப்பு பயன்பாட்டு ஆலோசனைகளை பெறுங்கள்.",
    detectLocation: "இருப்பிடத்தை கண்டறி",
    getWeather: "வானிலை பெற",
    fetchingWeather: "வானிலை பெறப்படுகிறது...",
    noWeatherLoaded: "இன்னும் வானிலை தரவு இல்லை.",
    forecastTitle: "7 நாள் முன்னறிவு",
    humidity: "ஈரப்பதம்",
    feelsLike: "உணரும் வெப்பநிலை",
    wind: "காற்று",
    rainProb: "மழை வாய்ப்பு",
    marketTitle: "சந்தை சுருக்கம்",
    marketDesc: "மண்டி விலைகளை ஒப்பிட்டு விற்பனை முடிவை மேம்படுத்துங்கள்.",
    refreshPrices: "விலை புதுப்பிக்க",
    loadingMarket: "சந்தை தரவு ஏற்றப்படுகிறது...",
    noMarketLoaded: "இன்னும் சந்தை தரவு இல்லை.",
    cropLabel: "பயிர்",
    unitFallback: "க்வின்டல்",
    assistantTitle: "GreenGeenie உதவியாளர்",
    assistantDesc: "உங்கள் மொழியில் கேளுங்கள், குரல் உள்ளீடு பயன்படுத்துங்கள், உடனடி பதில் பெறுங்கள்.",
    openAssistant: "உதவியாளரை திறக்க",
    voiceInput: "குரல் உள்ளீடு",
    historyTitle: "கண்டறிதல் வரலாறு",
    historyDesc: "சமீபத்திய அறிக்கைகள் இங்கே இருக்கும்; மாற்றங்களை கண்காணிக்கலாம்.",
    refreshHistory: "வரலாற்றை புதுப்பிக்க",
    loadingHistory: "சமீபத்திய அறிக்கைகள் ஏற்றப்படுகிறது...",
    noHistory: "இன்னும் கண்டறிதல் வரலாறு இல்லை. பயிர் படம் பதிவேற்றவும்.",
    plantFallback: "தாவரம்",
    conditionFallback: "நிலை தெரியவில்லை",
  },
};

const activeLanding = landingContent[language] || landingContent.en;
const activeButtonGuides = activeLanding.buttonGuides || landingContent.en.buttonGuides;
const activeButtonRoutes = buttonRouteLabels[language] || buttonRouteLabels.en;
const activeFeatureGuides = featureGuidesByLanguage[language] || featureGuidesByLanguage.en;
const activeHelperLabels = helperLabels[language] || helperLabels.en;
const activeExplore = exploreContent[language] || exploreContent.en;
const buttonGuideOrder = ["language", "heroExplore", "howItWorks"];
const activeButtonGuideKey = buttonGuideOrder[activeButtonGuideIndex] || "language";
const languageGuideRoutes = {
  en: "Language selector",
  hi: "भाषा चयन",
  pa: "ਭਾਸ਼ਾ ਚੋਣ",
  ta: "மொழி தேர்வு",
};
const languageGuideTexts = {
  en: "Change app language for the landing and feature hub screens.",
  hi: "लैंडिंग और फीचर हब की भाषा बदलें।",
  pa: "ਲੈਂਡਿੰਗ ਅਤੇ ਫੀਚਰ ਹੱਬ ਲਈ ਭਾਸ਼ਾ ਬਦਲੋ।",
  ta: "லேண்டிங் மற்றும் அம்ச ஹப் மொழியை மாற்றுங்கள்.",
};
const effectiveUserId = userId || GUEST_USER_ID;

React.useEffect(() => {
  if (showFeatureHub) return;

  setShowButtonGuide(true);
  setActiveButtonGuideIndex(0);
  let hideTimeout;
  let nextTimeout;
  let cancelled = false;

  const runButtonCycle = () => {
    if (cancelled) return;

    setShowButtonGuide(true);
    hideTimeout = setTimeout(() => {
      if (!cancelled) setShowButtonGuide(false);
    }, 2500);

    nextTimeout = setTimeout(() => {
      if (cancelled) return;
      setActiveButtonGuideIndex((prev) => (prev + 1) % buttonGuideOrder.length);
      runButtonCycle();
    }, 3800);
  };

  runButtonCycle();

  return () => {
    cancelled = true;
    clearTimeout(hideTimeout);
    clearTimeout(nextTimeout);
  };
}, [showFeatureHub, language]);

React.useEffect(() => {
  if (showFeatureHub) return;

  setActiveFeatureGuideIndex(0);
  setShowFeatureGuide(true);

  let hideTimeout;
  let nextTimeout;
  let cancelled = false;

  const runGuideCycle = () => {
    if (cancelled) return;

    setShowFeatureGuide(true);
    hideTimeout = setTimeout(() => {
      if (!cancelled) setShowFeatureGuide(false);
    }, 2600);

    nextTimeout = setTimeout(() => {
      if (cancelled) return;
      setActiveFeatureGuideIndex((prev) => (prev + 1) % activeLanding.features.length);
      runGuideCycle();
    }, 4300);
  };

  runGuideCycle();

  return () => {
    cancelled = true;
    clearTimeout(hideTimeout);
    clearTimeout(nextTimeout);
  };
}, [showFeatureHub, featureGuideCycle, language, activeLanding.features.length]);

React.useEffect(() => {
  if (!showFeatureHub) return;

  const loadHistoryPreview = async () => {
    try {
      setHistoryLoading(true);
      const response = await axios.get(`${API_URL}/api/plant-detection/history/${effectiveUserId}`);
      setHistoryPreview(Array.isArray(response.data) ? response.data.slice(0, 3) : []);
    } catch (err) {
      setHistoryPreview([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  loadHistoryPreview();
}, [showFeatureHub, effectiveUserId]);

React.useEffect(() => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ks-current-view", currentView);
}, [currentView]);

React.useEffect(() => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ks-active-screen", showFeatureHub ? "explore" : "landing");
}, [showFeatureHub]);

if (!showFeatureHub) {
  return (
    <div className="ks-landing">
      <div className="ks-grid" aria-hidden="true" />
      <header className="ks-nav">
        <div className="ks-brand">
          <span className="ks-brand-mark">F</span>
          <span>Krishi Saarthi</span>
        </div>

        <div className="ks-nav-actions">
          <div className="ks-btn-guide-anchor">
            <div className="ks-language-wrap">
              <span className="ks-language-icon" aria-hidden="true">A</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="ks-language"
                aria-label="Select language"
              >
                {Object.entries(languageNames).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              <span className="ks-language-caret" aria-hidden="true">v</span>
            </div>
            {showButtonGuide && activeButtonGuideKey === "language" && (
              <span className="ks-btn-guide" role="note">
                <span className="ks-btn-guide-title">{activeHelperLabels.goesTo} {"->"} {languageGuideRoutes[language] || languageGuideRoutes.en}</span>
                <p>{languageGuideTexts[language] || languageGuideTexts.en}</p>
              </span>
            )}
          </div>
          <div className="ks-btn-guide-anchor">
            <button
              className="ks-cta"
              type="button"
              onClick={() => {
                setShowFeatureHub(true);
                setCurrentView("home");
              }}
            >
              {activeLanding.explore}
            </button>
          </div>
        </div>
      </header>

      <main className="ks-main">
        <section className="ks-hero">
          <p className="ks-eyebrow">{activeLanding.eyebrow}</p>
          <h1>
            {activeLanding.heroLine1}
            <br />
            {activeLanding.heroLine2} <em>{activeLanding.heroAccent}</em>
          </h1>
          <p className="ks-hero-copy">
            {activeLanding.heroDesc}
          </p>
          <div className="ks-hero-actions">
            <div className="ks-btn-guide-anchor">
              <button
                type="button"
                className="ks-cta"
                onClick={() => {
                  setShowFeatureHub(true);
                  setCurrentView("home");
                }}
              >
                {activeLanding.explore}
              </button>
              {showButtonGuide && activeButtonGuideKey === "heroExplore" && (
                <span className="ks-btn-guide" role="note">
                  <span className="ks-btn-guide-title">{activeHelperLabels.goesTo} {"->"} {activeButtonRoutes.heroExplore}</span>
                  <p>{activeButtonGuides.heroExplore}</p>
                </span>
              )}
            </div>

            <div className="ks-btn-guide-anchor">
              <button
                type="button"
                className="ks-ghost"
                onClick={() => document.getElementById("ks-features")?.scrollIntoView({ behavior: "smooth" })}
              >
                {activeLanding.howItWorks}
              </button>
              {showButtonGuide && activeButtonGuideKey === "howItWorks" && (
                <span className="ks-btn-guide" role="note">
                  <span className="ks-btn-guide-title">{activeHelperLabels.goesTo} {"->"} {activeButtonRoutes.howItWorks}</span>
                  <p>{activeButtonGuides.howItWorks}</p>
                </span>
              )}
            </div>
          </div>
        </section>

        <section id="ks-features" className="ks-features-wrap">
          <p className="ks-eyebrow">{activeLanding.suiteEyebrow}</p>
          <h2>{activeLanding.suiteTitle}</h2>
          <div className="ks-guide-control-row">
            <div className="ks-btn-guide-anchor">
              <button
                type="button"
                className="ks-guide-btn"
                onClick={() => {
                  document.getElementById("ks-features")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setFeatureGuideCycle((prev) => prev + 1);
                }}
              >
                {activeLanding.guideButton || landingContent.en.guideButton}
              </button>
            </div>
          </div>

          <div className="ks-steps-wrap">
            <div className="ks-steps-head">
              <h3>{activeLanding.flowTitle}</h3>
              <p>{activeLanding.flowDesc}</p>
            </div>
            <div className="ks-step-grid">
              {activeLanding.steps.map((step, index) => (
                <article className="ks-step-card" key={step.num + step.title}>
                  <span className="ks-step-num">{step.num}</span>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="ks-flow-detail-wrap">
            <h4>{activeLanding.flowDetailTitle || landingContent.en.flowDetailTitle}</h4>
            <p>{activeLanding.flowDetailDesc || landingContent.en.flowDetailDesc}</p>
            <div className="ks-flow-detail-grid">
              {(activeLanding.flowDetails || landingContent.en.flowDetails).map((item) => (
                <article key={item.title} className="ks-flow-detail-card">
                  <h5>{item.title}</h5>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="ks-feature-grid">
            {activeLanding.features.map((feature, index) => (
              <article key={feature.title} className="ks-feature-card" style={{ animationDelay: `${index * 0.07}s` }}>
                <span className="ks-feature-tag">{feature.tag}</span>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
                {showFeatureGuide && index === activeFeatureGuideIndex && (
                  <div className="ks-guide-chip" role="note" aria-live="polite">
                    <p>{activeFeatureGuides?.[index]?.access}</p>
                    <p>{activeFeatureGuides?.[index]?.meaning}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

if (showFeatureHub) {
  const jumpToFeature = (featureId, view) => {
    setCurrentView(view);
    setTimeout(() => {
      document.getElementById(featureId)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };

  return (
    <div className="ks-explore-root">
      <div className="ks-grid" aria-hidden="true" />

      <nav className="ks-explore-nav">
        <div className="ks-brand">
          <span className="ks-brand-mark">F</span>
          <span>Krishi Saarthi</span>
        </div>

        <div className="ks-explore-nav-actions">
          <button className={`ks-explore-tab ${currentView === "home" ? "ks-explore-tab-active" : ""}`} onClick={() => jumpToFeature("feature-top", "home")}>{activeExplore.tabs.home}</button>
          <button className={`ks-explore-tab ${currentView === "detection" ? "ks-explore-tab-active" : ""}`} onClick={() => jumpToFeature("feature-detection", "detection")}>{activeExplore.tabs.detection}</button>
          <button className={`ks-explore-tab ${currentView === "history" ? "ks-explore-tab-active" : ""}`} onClick={() => jumpToFeature("feature-history", "history")}>{activeExplore.tabs.history}</button>
          <div className="ks-language-wrap">
            <span className="ks-language-icon" aria-hidden="true">A</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="ks-language"
              aria-label="Select language"
            >
              {Object.entries(languageNames).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
            <span className="ks-language-caret" aria-hidden="true">v</span>
          </div>
          <button className="ks-ghost" onClick={() => setShowFeatureHub(false)}>{activeExplore.tabs.back}</button>
        </div>
      </nav>

      <main className="ks-explore-main">
        <section id="feature-top" className="ks-explore-hero">
          <p className="ks-eyebrow">{activeExplore.heroEyebrow}</p>
          <h1>{activeExplore.heroTitle}</h1>
          <p>
            {activeExplore.heroDesc}
          </p>
        </section>

        <section className="ks-explore-row">
          <article id="feature-detection" className="ks-explore-card">
            <span className="ks-feature-tag">AI</span>
            <h3>{activeExplore.diseaseTitle}</h3>
            <p>{activeExplore.diseaseDesc}</p>
            <input
              id="diseaseInputModern"
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleDiseaseImageChange}
            />
            <div className="ks-explore-actions">
              <button className="ks-cta" onClick={() => document.getElementById("diseaseInputModern")?.click()}>
                {activeExplore.uploadPhoto}
              </button>
              <button className="ks-ghost" onClick={() => jumpToFeature("feature-detection", "detection")}>{activeExplore.focusFeature}</button>
            </div>
            {diseaseLoading && <p className="ks-inline-note">{activeExplore.analyzingImage}</p>}
            {diseaseResult && <p className="ks-inline-note">{diseaseResult.status}: {diseaseResult.message}</p>}
          </article>

          <article className="ks-explore-card">
            <span className="ks-feature-tag">Calendar</span>
            <h3>{activeExplore.cropTimelineTitle}</h3>
            <p>{activeExplore.cropTimelineDesc}</p>
            <div className="ks-explore-actions">
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="ks-explore-select"
              >
                {cropOptions.map((crop) => (
                  <option key={crop.name} value={crop.name}>{crop.icon} {crop.name}</option>
                ))}
              </select>
            </div>
            <p className="ks-inline-note">
              {selectedCrop !== "Select"
                ? `${selectedCrop} ${activeExplore.cropTimelineSummary} ${cropOptions.find((c) => c.name === selectedCrop)?.calendar.length || 0} ${activeExplore.cropTimelineStages}`
                : activeExplore.cropTimelineFallback}
            </p>
          </article>
        </section>

        <section className="ks-explore-row">
          <article className="ks-explore-card">
            <span className="ks-feature-tag">Local</span>
            <h3>{activeExplore.weatherTitle}</h3>
            <p>{activeExplore.weatherDesc}</p>
            <div className="ks-explore-actions">
              <button className="ks-ghost" onClick={fetchGeoLocation}>{activeExplore.detectLocation}</button>
              <button className="ks-cta" onClick={fetchWeather}>{activeExplore.getWeather}</button>
            </div>
            <p className="ks-inline-note">
              {weatherLoading
                ? activeExplore.fetchingWeather
                : weather
                ? `${weather.location}: ${weather.temperature}, ${weather.condition}`
                : weatherError || activeExplore.noWeatherLoaded}
            </p>

            {weather && !weatherLoading && (
              <div className="ks-weather-panel">
                <div className="ks-weather-top">
                  <span>{weather.icon || "🌤️"}</span>
                  <strong>{weather.temperature}</strong>
                  <span>{weather.condition}</span>
                </div>

                <div className="ks-weather-metrics">
                  <div className="ks-weather-chip">{activeExplore.humidity}: {weather.humidity || "N/A"}</div>
                  <div className="ks-weather-chip">{activeExplore.feelsLike}: {weather.feelsLike || "N/A"}</div>
                  <div className="ks-weather-chip">{activeExplore.wind}: {weather.windspeed || "N/A"}</div>
                  <div className="ks-weather-chip">{activeExplore.rainProb}: {weather.precipProbability || "N/A"}</div>
                </div>

                {Array.isArray(weather.farmingAdvisory) && weather.farmingAdvisory.length > 0 && (
                  <ul className="ks-weather-advisory">
                    {weather.farmingAdvisory.slice(0, 2).map((advice, idx) => (
                      <li key={idx}>{advice}</li>
                    ))}
                  </ul>
                )}

                {Array.isArray(forecast) && forecast.length > 0 && (
                  <div className="ks-forecast-strip">
                    <p className="ks-forecast-title">{activeExplore.forecastTitle}</p>
                    <div className="ks-forecast-grid">
                      {forecast.slice(0, 7).map((day, idx) => (
                        <div key={`${day.date}-${idx}`} className="ks-forecast-card">
                          <span className="ks-forecast-date">{day.date}</span>
                          <span className="ks-forecast-icon">{day.icon}</span>
                          <span className="ks-forecast-temp">{day.maxTemp} / {day.minTemp}</span>
                          <span className="ks-forecast-rain">{day.rainProb}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </article>

          <article className="ks-explore-card">
            <span className="ks-feature-tag">Live Data</span>
            <h3>{activeExplore.marketTitle}</h3>
            <p>{activeExplore.marketDesc}</p>
            <div className="ks-explore-actions">
              <button className="ks-cta" onClick={fetchMarket}>{activeExplore.refreshPrices}</button>
            </div>
            <p className="ks-inline-note">
              {marketLoading
                ? activeExplore.loadingMarket
                : market.length
                ? `${market[0]?.commodity || activeExplore.cropLabel}: Rs ${market[0]?.modalPrice || "-"} / ${market[0]?.unit || activeExplore.unitFallback}`
                : activeExplore.noMarketLoaded}
            </p>
          </article>
        </section>

        <section className="ks-explore-row ks-explore-row-single">
          <article className="ks-explore-card">
            <span className="ks-feature-tag">Smart Chat</span>
            <h3>{activeExplore.assistantTitle}</h3>
            <p>
              {activeExplore.assistantDesc}
            </p>
            <div className="ks-explore-actions">
              <button className="ks-cta" onClick={() => setChatOpen(true)}>{activeExplore.openAssistant}</button>
              <button className="ks-ghost" onClick={handleVoiceInput}>{activeExplore.voiceInput}</button>
            </div>
          </article>
        </section>

        <section className="ks-explore-row ks-explore-row-single">
          <article id="feature-history" className="ks-explore-card">
            <span className="ks-feature-tag">ML</span>
            <h3>{activeExplore.historyTitle}</h3>
            <p>{activeExplore.historyDesc}</p>
            <div className="ks-explore-actions">
              <button className="ks-cta" onClick={() => jumpToFeature("feature-history", "history")}>{activeExplore.refreshHistory}</button>
            </div>

            {historyLoading ? (
              <p className="ks-inline-note">{activeExplore.loadingHistory}</p>
            ) : historyPreview.length > 0 ? (
              <div className="ks-history-preview-list">
                {historyPreview.map((item) => (
                  <div key={item._id} className="ks-history-preview-item">
                    <strong>{item.detectedPlant?.name || activeExplore.plantFallback}</strong>
                    <span>{item.detectedDisease?.name || activeExplore.conditionFallback}</span>
                    <small>{new Date(item.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="ks-inline-note">{activeExplore.noHistory}</p>
            )}
          </article>
        </section>
      </main>

      {/* Floating Chat Button */}
      <button
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 5000,
          background: COLORS.primary,
          color: COLORS.buttonText,
          border: "none",
          borderRadius: "50%",
          width: 56,
          height: 56,
          boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          cursor: "pointer",
          outline: "none",
        }}
        title="Open GreenGeenie"
        onClick={() => setChatOpen(true)}
      >
        <span role="img" aria-label="Chat">💬</span>
      </button>

      {/* GreenGeenie Modal */}
      {chatOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.45)",
            zIndex: 6000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setChatOpen(false)}
        >
          <div
            style={{
              background: "#0e170e",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 18,
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
              minWidth: 320,
              maxWidth: 400,
              width: "90vw",
              minHeight: 380,
              maxHeight: 520,
              display: "flex",
              flexDirection: "column",
              padding: 0,
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: "rgba(127,255,106,0.1)",
                borderBottom: `1px solid ${COLORS.border}`,
                color: COLORS.text,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                padding: "16px 20px",
                fontWeight: 700,
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{t.chatbot}</span>
              <button
                onClick={() => setChatOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: COLORS.text,
                  fontSize: 22,
                  cursor: "pointer",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <div
              ref={chatContainerRef}
              style={{
                flex: 1,
                padding: 18,
                overflowY: "auto",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {chatHistory.length === 0 && !chatLoading && (
                <div style={{ color: COLORS.text, opacity: 0.7, textAlign: "center", marginTop: 40 }}>
                  {t.askAnything}
                </div>
              )}
              {chatHistory.map((msg, idx) => (
                <div key={idx} style={{ margin: "10px 0", textAlign: msg.from === "user" ? "right" : "left" }}>
                  <span
                    style={{
                      display: "inline-block",
                      background: msg.from === "user" ? "rgba(127,255,106,0.16)" : "rgba(255,255,255,0.06)",
                      color: COLORS.text,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 12,
                      padding: "8px 14px",
                      maxWidth: "75%",
                      fontSize: 15,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
              {chatLoading && <div style={{ color: COLORS.text, opacity: 0.7 }}>{t.thinking}</div>}
            </div>
            <form onSubmit={sendChatMessage} style={{ display: "flex", gap: 8, padding: 12, borderTop: `1px solid ${COLORS.border}` }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t.typeMessage}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  border: `1px solid ${COLORS.border}`,
                  padding: "10px 12px",
                  outline: "none",
                  background: "rgba(255,255,255,0.05)",
                  color: COLORS.text,
                }}
              />
              <button type="submit" style={{ ...buttonStyle, margin: 0 }} disabled={chatLoading}>{t.send}</button>
            </form>
          </div>
        </div>
      )}

      <ReadPopup />
    </div>
  );
}

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.background,
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
        padding: 0,
        margin: 0,
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          width: "100%",
          minHeight: 62,
          background: "rgba(6,10,6,0.84)",
          color: COLORS.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          borderBottom: `1px solid ${COLORS.border}`,
          backdropFilter: "blur(16px)",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 1.5,
          zIndex: 100,
          position: "sticky",
          top: 0,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 24, letterSpacing: 1.2, color: COLORS.text }}>
          🌱 Krishi Saarthi
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* Plant / disease detection: available without login; history only when signed in */}
          <button
            onClick={() => setCurrentView("home")}
            style={{
              background: currentView === "home" ? COLORS.primaryDark : "transparent",
              color: COLORS.buttonText,
              border: "none",
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            💬 Home
          </button>
          <button
            onClick={() => setCurrentView("detection")}
            style={{
              background: currentView === "detection" ? COLORS.primaryDark : "transparent",
              color: COLORS.buttonText,
              border: "none",
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            🌱 Disease Detection
          </button>
          {userId && (
            <button
              onClick={() => setCurrentView("history")}
              style={{
                background: currentView === "history" ? COLORS.primaryDark : "transparent",
                color: COLORS.buttonText,
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              📋 History
            </button>
          )}
          {/* Bell Icon for Notification */}
          <button
            onClick={() => {
              if (!notification)
                showNotification("No new notifications", "info");
              else setNotifOpen((v) => !v);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 28,
              color: notifOpen ? COLORS.primary : COLORS.buttonText,
              outline: "none",
              position: "relative",
              marginRight: 8,
            }}
            title="Show notifications"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notifOpen && notification && (
              <span
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  background: "#d32f2f",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 16,
                  height: 16,
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                !
              </span>
            )}
          </button>
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: `1px solid ${COLORS.border}`,
              fontSize: 15,
              background: COLORS.inputBg,
              color: COLORS.text,
              fontWeight: 600,
            }}
          >
            <option value="pa">ਗੁਰਮੁਖੀ</option>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="ur">اردو</option>
            <option value="ta">தமிழ்</option>
          </select>
        </div>
      </nav>
      {/* Notification Alert */}
      {notifOpen && notification && (
        <div
          style={{
            position: "fixed",
            top: 60,
            right: 40,
            background:
              notification.type === "success"
                ? "linear-gradient(90deg,#43e97b,#38f9d7)"
                : notification.type === "error"
                ? "#d32f2f"
                : "#388e3c",
            color: "#fff",
            padding: "16px 36px",
            borderRadius: 16,
            boxShadow: "0 4px 24px #0003",
            fontSize: 18,
            fontWeight: 600,
            zIndex: 4000,
            animation: "notifSlide 0.5s cubic-bezier(.5,1.5,.5,1)",
            letterSpacing: 0.5,
            minWidth: 220,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            gap: 16,
            transform: "scale(1)",
            opacity: 1,
            transition:
              "transform 0.4s cubic-bezier(.5,1.5,.5,1), opacity 0.4s",
          }}
        >
          <span style={{ flex: 1 }}>{notification.msg}</span>
          <button
            onClick={() => setNotifOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 22,
              cursor: "pointer",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
      {/* Fruit falling animation layer */}
      <div
        style={{
          position: "fixed",
          pointerEvents: "none",
          zIndex: 3000,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }}
      >
        {fruits.map((fruit) => (
          <span
            key={fruit.id}
            style={{
              position: "absolute",
              left: fruit.left,
              top: fruit.top,
              animation: `fruitDrop 1.1s cubic-bezier(.5,1.5,.5,1) ${fruit.delay}s forwards`,
              zIndex: 3001,
              pointerEvents: "none",
            }}
            dangerouslySetInnerHTML={{ __html: fruit.svg }}
          />
        ))}
      </div>
      {/* Language Selector */}

      {/* Render Different Views Based on currentView State */}
      {currentView === "home" ? (
        <>
      {/* Dashboard Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: COLORS.accent,
          borderRadius: 24,
          boxShadow: COLORS.cardShadow,
          border: `1px solid ${COLORS.border}`,
          padding: "32px 16px",
          maxWidth: 1120,
          margin: "28px auto 0 auto",
          minHeight: 400,
        }}
      >
        {/* Autoplay Video Banner */}
        <img
          src="pic.jpg" // Replace with your farming/nature image
          alt="Farming Banner"
          style={{
            width: 300,
            height: 161,
            objectFit: "cover",
            borderRadius: 16,
            boxShadow: COLORS.cardShadow,
            marginBottom: 18,
            background: COLORS.card,
          }}
        />

        {/* Dashboard cards */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 20,
            background: COLORS.accent,
            borderRadius: 24,
            boxShadow: COLORS.cardShadow,
            padding: "32px 16px",
            maxWidth: 900,
            margin: "0 auto",
            minHeight: 400,
          }}
        >
          

          {/* Disease & Pest Detection Card */}
          <section
            style={{
              position: "relative", // needed for the flag
              background: COLORS.card,
              borderRadius: 12,
              boxShadow: COLORS.cardShadow,
              padding: "18px 14px",
              minWidth: 220,
              maxWidth: 250,
              flex: "1 1 220px",
              marginBottom: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: "cardEntrance 0.9s cubic-bezier(.5,1.5,.5,1)",
            }}
          >
            {/* AI Powered Flag */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                background: "#f41404ff",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 6,
                zIndex: 5,
                textTransform: "uppercase",
              }}
            >
              AI Powered
            </div>

            <h2 style={cardTitle}>{t.diseasePest}</h2>

            <input
              id="diseaseInput"
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleDiseaseImageChange}
            />

            <button
              style={{ ...buttonStyle, marginBottom: 10, width: "100%" }}
              onClick={(e) => {
                document.getElementById("diseaseInput").click();
                const rect = e.target.getBoundingClientRect();
                dropFruits(rect);
              }}
            >
              Upload/Scan Crop Photo
            </button>

            <p
              style={{ textAlign: "center", fontSize: 14, color: COLORS.text }}
            >
              See the disease by uploading a photo.
            </p>

            {diseaseLoading && (
              <div style={{ color: "#388e3c", margin: "10px 0" }}>
                Analyzing image...
              </div>
            )}

            {diseaseResult && (
              <div
                style={{
                  marginTop: 10,
                  background: diseaseResult.details?.isPlantImage === false ? "#fff3e0" : "#f1f8e9",
                  borderRadius: 8,
                  padding: 12,
                  textAlign: "left",
                  border: diseaseResult.details?.isPlantImage === false ? "2px solid #ff6f00" : "none",
                }}
              >
                {diseaseResult.details?.isPlantImage === false && (
                  <div style={{ marginBottom: 10, padding: 8, background: "#ffeaa7", borderRadius: 6 }}>
                    <b style={{ color: "#ff6f00" }}>⚠️ Image Validation Alert</b>
                    <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#d84315" }}>
                      {diseaseResult.details?.validationMessage || "This image does not appear to be a crop or plant. Please upload a plant/crop image for accurate analysis."}
                    </p>
                  </div>
                )}

                <b style={{ color: diseaseResult.color }}>
                  {diseaseResult.status}
                </b>
                <p style={{ margin: "6px 0 0 0" }}>{diseaseResult.message}</p>

                {diseaseResult.details?.localized?.summary && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 10,
                      background: "#e8f5e9",
                      borderRadius: 6,
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: COLORS.text,
                    }}
                  >
                    <b style={{ display: "block", marginBottom: 6 }}>Summary</b>
                    {diseaseResult.details.localized.summary}
                  </div>
                )}

                {diseaseResult.details?.predictions && (
                  <div style={{ marginTop: 10, fontSize: 12, color: COLORS.text }}>
                    {diseaseResult.details.localized?.topCrop != null && diseaseResult.details.localized.topCrop !== "" ? (
                      <p style={{ margin: "4px 0" }}>
                        <b>Crop / plant:</b> {diseaseResult.details.localized.topCrop}
                      </p>
                    ) : (
                      diseaseResult.details.plant && (
                        <p style={{ margin: "4px 0" }}>
                          <b>Crop / plant:</b> {diseaseResult.details.plant}
                        </p>
                      )
                    )}
                    <p style={{ margin: "4px 0", wordBreak: "break-word" }}>
                      <b>Model label:</b> {diseaseResult.details.name}
                    </p>
                    <p style={{ margin: "8px 0 4px 0", fontWeight: 600 }}>All scores</p>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {(diseaseResult.details.localized?.predictions?.length > 0
                        ? diseaseResult.details.localized.predictions
                        : diseaseResult.details.predictions
                      )
                        .slice(0, 5)
                        .map((p, i) => (
                          <li key={i} style={{ margin: "2px 0" }}>
                            {p.label}: {p.confidencePercent ?? Math.round(p.score * 1000) / 10}%
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {diseaseResult.details?.detectedPlant && !diseaseResult.details?.predictions && (
                  <div style={{ marginTop: 8, fontSize: 12, color: COLORS.text }}>
                    <p style={{ margin: "4px 0" }}>
                      <b>Detected Plant:</b> {diseaseResult.details.detectedPlant.name} ({diseaseResult.details.detectedPlant.confidence}% confident)
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Crop Calendar Card */}
          <section
            style={{
              background: COLORS.card,
              borderRadius: 12,
              boxShadow: COLORS.cardShadow,
              padding: "18px 14px",
              minWidth: 320,
              maxWidth: 400,
              flex: "1 1 320px",
              marginBottom: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: "cardEntrance 0.9s cubic-bezier(.5,1.5,.5,1)",
            }}
          >
            <h2 style={cardTitle}>
              <span style={{ verticalAlign: "middle", marginRight: 8 }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="4"
                    fill="#ffb300"
                  />
                  <rect
                    x="7"
                    y="7"
                    width="10"
                    height="2"
                    rx="1"
                    fill="#fffde7"
                  />
                  <rect
                    x="7"
                    y="11"
                    width="6"
                    height="2"
                    rx="1"
                    fill="#fffde7"
                  />
                  <rect
                    x="7"
                    y="15"
                    width="8"
                    height="2"
                    rx="1"
                    fill="#fffde7"
                  />
                </svg>
              </span>
              {t.cropCalendar}
            </h2>
            
            {/* Crop Selection with Icon */}
            <div style={{ margin: "12px 0", display: "flex", alignItems: "center", gap: 10 }}>
              <label htmlFor="cropSelect" style={{ fontWeight: 600, color: COLORS.text }}>
                {t.selectCrop}
              </label>
              <select
                id="cropSelect"
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: `2px solid ${COLORS.primary}`,
                  fontSize: 15,
                  fontWeight: 500,
                  background: COLORS.inputBg,
                  cursor: "pointer",
                }}
              >
                {cropOptions.map((crop) => (
                  <option key={crop.name} value={crop.name}>
                    {crop.icon} {crop.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            {selectedCrop !== "Select" && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button
                  onClick={() => setCalendarView("timeline")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: "none",
                    background: calendarView === "timeline" ? COLORS.primary : COLORS.accent,
                    color: calendarView === "timeline" ? "#fff" : COLORS.text,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  📊 Timeline
                </button>
                <button
                  onClick={() => setCalendarView("list")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: "none",
                    background: calendarView === "list" ? COLORS.primary : COLORS.accent,
                    color: calendarView === "list" ? "#fff" : COLORS.text,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  📋 List
                </button>
              </div>
            )}

            {/* Calendar Content */}
            {selectedCrop !== "Select" && (
              <div
                style={{
                  background: "#fffde7",
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: "0 2px 8px #ffb30022",
                  width: "100%",
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                {/* Crop Header with Icon */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 32 }}>
                    {cropOptions.find((c) => c.name === selectedCrop)?.icon}
                  </span>
                  <div>
                    <h3 style={{ margin: 0, color: COLORS.primaryDark, fontSize: 18 }}>
                      {selectedCrop}
                    </h3>
                    <span style={{ fontSize: 12, color: "#666" }}>
                      {cropOptions.find((c) => c.name === selectedCrop)?.calendar.length} stages
                    </span>
                  </div>
                </div>

                {/* Timeline View */}
                {calendarView === "timeline" && (
                  <div style={{ position: "relative", paddingLeft: 20 }}>
                    {/* Vertical Line */}
                    <div style={{
                      position: "absolute",
                      left: 8,
                      top: 10,
                      bottom: 10,
                      width: 3,
                      background: `linear-gradient(to bottom, ${COLORS.primary}, ${COLORS.accent})`,
                      borderRadius: 2,
                    }} />
                    
                    {cropOptions
                      .find((c) => c.name === selectedCrop)
                      ?.calendar.map((item, idx, arr) => {
                        const currentStage = getCurrentStage(arr);
                        const isCompleted = idx < currentStage;
                        const isCurrent = idx === currentStage;
                        const isPending = idx > currentStage;
                        
                        return (
                          <div
                            key={idx}
                            style={{
                              position: "relative",
                              marginBottom: 16,
                              paddingLeft: 20,
                              animation: `fadeIn 0.3s ease ${idx * 0.1}s both`,
                            }}
                          >
                            {/* Stage Circle */}
                            <div style={{
                              position: "absolute",
                              left: -12,
                              top: 4,
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: isCompleted ? COLORS.primary : isCurrent ? "#ffb300" : "#ddd",
                              border: isCurrent ? "3px solid #ff6f00" : "2px solid #fff",
                              boxShadow: isCurrent ? "0 0 10px #ffb300" : "0 1px 3px rgba(0,0,0,0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 10,
                              color: "#fff",
                              fontWeight: "bold",
                            }}>
                              {isCompleted ? "✓" : idx + 1}
                            </div>
                            
                            {/* Stage Content */}
                            <div style={{
                              background: isCurrent ? "#fff8e1" : "#fff",
                              borderRadius: 10,
                              padding: "12px 14px",
                              border: isCurrent ? "2px solid #ffb300" : "1px solid #e0e0e0",
                              boxShadow: isCurrent ? "0 3px 12px rgba(255,179,0,0.3)" : "0 1px 4px rgba(0,0,0,0.08)",
                            }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ 
                                    fontWeight: 600, 
                                    color: COLORS.primaryDark,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}>
                                    {item.stage}
                                    {isCurrent && (
                                      <span style={{
                                        background: "#ff6f00",
                                        color: "#fff",
                                        fontSize: 10,
                                        padding: "2px 6px",
                                        borderRadius: 10,
                                        fontWeight: "bold",
                                      }}>
                                        NOW
                                      </span>
                                    )}
                                  </div>
                                  <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginTop: 6,
                                  }}>
                                    <span style={{
                                      background: isCompleted ? COLORS.primary : "#ffb300",
                                      color: "#fff",
                                      borderRadius: 6,
                                      padding: "3px 10px",
                                      fontWeight: 600,
                                      fontSize: 12,
                                    }}>
                                      📅 {item.date}
                                    </span>
                                    <button
                                      onClick={() => addCropReminder(selectedCrop, item.stage, item.date)}
                                      style={{
                                        background: isReminderSet(selectedCrop, item.stage) ? COLORS.primary : "transparent",
                                        color: isReminderSet(selectedCrop, item.stage) ? "#fff" : COLORS.primary,
                                        border: `1px solid ${COLORS.primary}`,
                                        borderRadius: 4,
                                        padding: "2px 8px",
                                        fontSize: 12,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 3,
                                      }}
                                      title="Set Reminder"
                                    >
                                      🔔 {isReminderSet(selectedCrop, item.stage) ? "✓" : "+"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Tip Section */}
                              {item.tip && (
                                <div style={{
                                  marginTop: 10,
                                  padding: "8px 10px",
                                  background: "#e8f5e9",
                                  borderRadius: 8,
                                  fontSize: 12,
                                  color: COLORS.text,
                                  borderLeft: `3px solid ${COLORS.primary}`,
                                }}>
                                  💡 <strong>Tip:</strong> {item.tip}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* List View */}
                {calendarView === "list" && (
                  <div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: COLORS.primary, color: "#fff" }}>
                          <th style={{ padding: 10, textAlign: "left", borderRadius: "8px 0 0 0" }}>#</th>
                          <th style={{ padding: 10, textAlign: "left" }}>Stage</th>
                          <th style={{ padding: 10, textAlign: "center" }}>Date</th>
                          <th style={{ padding: 10, textAlign: "center", borderRadius: "0 8px 0 0" }}>🔔</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cropOptions
                          .find((c) => c.name === selectedCrop)
                          ?.calendar.map((item, idx, arr) => {
                            const currentStage = getCurrentStage(arr);
                            const isCompleted = idx < currentStage;
                            const isCurrent = idx === currentStage;
                            
                            return (
                              <tr 
                                key={idx}
                                style={{
                                  background: isCurrent ? "#fff8e1" : isCompleted ? "#e8f5e9" : "#fff",
                                  borderBottom: "1px solid #eee",
                                }}
                              >
                                <td style={{ 
                                  padding: 10, 
                                  fontWeight: 600,
                                  color: isCompleted ? COLORS.primary : "#666",
                                }}>
                                  {isCompleted ? "✓" : idx + 1}
                                </td>
                                <td style={{ padding: 10 }}>
                                  <div style={{ fontWeight: 500 }}>{item.stage}</div>
                                  {item.tip && (
                                    <div style={{ fontSize: 11, color: "#666", marginTop: 3 }}>
                                      💡 {item.tip}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: 10, textAlign: "center" }}>
                                  <span style={{
                                    background: "#ffb300",
                                    color: "#fff",
                                    padding: "3px 8px",
                                    borderRadius: 4,
                                    fontSize: 11,
                                    fontWeight: 600,
                                  }}>
                                    {item.date}
                                  </span>
                                </td>
                                <td style={{ padding: 10, textAlign: "center" }}>
                                  <button
                                    onClick={() => addCropReminder(selectedCrop, item.stage, item.date)}
                                    style={{
                                      background: isReminderSet(selectedCrop, item.stage) ? COLORS.primary : "transparent",
                                      color: isReminderSet(selectedCrop, item.stage) ? "#fff" : "#666",
                                      border: "1px solid #ddd",
                                      borderRadius: 4,
                                      padding: "4px 8px",
                                      cursor: "pointer",
                                      fontSize: 14,
                                    }}
                                  >
                                    🔔
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Active Reminders Summary */}
                {cropReminders.filter(r => r.crop === selectedCrop).length > 0 && (
                  <div style={{
                    marginTop: 14,
                    padding: "10px 12px",
                    background: "#e3f2fd",
                    borderRadius: 8,
                    fontSize: 12,
                  }}>
                    <strong>🔔 Active Reminders:</strong>
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {cropReminders
                        .filter(r => r.crop === selectedCrop)
                        .map(r => (
                          <span 
                            key={r.id}
                            style={{
                              background: COLORS.primary,
                              color: "#fff",
                              padding: "3px 8px",
                              borderRadius: 12,
                              fontSize: 11,
                            }}
                          >
                            {r.stage} ({r.date})
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {selectedCrop === "Select" && (
              <div style={{
                padding: 30,
                textAlign: "center",
                color: "#888",
              }}>
                <span style={{ fontSize: 48 }}>🌱</span>
                <p style={{ marginTop: 10 }}>Select a crop to view its calendar</p>
              </div>
            )}
          </section>
          {/* Scan Product Card */}
          <section
            style={{
              position: "relative", // needed for the flag
              background: COLORS.card,
              borderRadius: 12,
              boxShadow: COLORS.cardShadow,
              padding: "18px 14px",
              minWidth: 220,
              maxWidth: 250,
              flex: "1 1 220px",
              marginBottom: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: "cardEntrance 0.9s cubic-bezier(.5,1.5,.5,1)",
            }}
          >
            {/* New Flag */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                background: "#ff5722",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 6,
                zIndex: 5,
                textTransform: "uppercase",
              }}
            >
              New
            </div>

            <h2 style={cardTitle}>{t.uploadScan}</h2>

            {/* Input + Mic + Camera in one line */}
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <input
                type="text"
                placeholder="Product Na.."
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                style={{ ...inputStyle, flex: 1 }} // flex:1 makes input expand
              />

              {/* Mic Button */}
              <button
                style={{
                  ...iconButtonStyle,
                  background: listening ? "#ffeb3b" : COLORS.card,
                  color: listening ? "#222" : COLORS.primary,
                  border: `2px solid ${COLORS.primary}`,
                }}
                title="Speak product name"
                onClick={handleVoiceInput}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={COLORS.primary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
                  <line x1="12" y1="22" x2="12" y2="18" />
                  <line x1="8" y1="22" x2="16" y2="22" />
                </svg>
              </button>

              {/* Camera Button */}
              <button
                style={{ ...iconButtonStyle }}
                title="Scan with Camera"
                onClick={(e) => {
                  e.preventDefault();
                  if (fileInputRef.current) fileInputRef.current.click();
                  const rect = e.target.getBoundingClientRect();
                  dropFruits(rect);
                }}
                onMouseDown={(e) => {
                  const rect = e.target.getBoundingClientRect();
                  dropFruits(rect);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <rect
                    width="20"
                    height="14"
                    x="2"
                    y="7"
                    rx="3"
                    fill="#388e3c"
                  />
                  <circle cx="12" cy="14" r="4" fill="#fff" />
                  <circle cx="12" cy="14" r="2" fill="#388e3c" />
                  <rect
                    width="6"
                    height="2"
                    x="9"
                    y="4"
                    rx="1"
                    fill="#388e3c"
                  />
                </svg>
              </button>

              <input
                id="cameraInput"
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>

            {/* Modal Popup for Scan Result */}
            {showModal && scanResult && (
              <div
                style={{
                  ...modalOverlayStyle,
                  animation: "notifSlide 0.5s cubic-bezier(.5,1.5,.5,1)",
                }}
                onClick={() => setShowModal(false)}
              >
                <div
                  style={{
                    ...modalStyle,
                    transform: "scale(1)",
                    opacity: 1,
                    transition:
                      "transform 0.4s cubic-bezier(.5,1.5,.5,1), opacity 0.4s",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 style={{ color: "#388e3c", marginBottom: 10 }}>
                    Scan Result
                  </h3>
                  <p>
                    <b>Product:</b> {scanResult.product}
                  </p>
                  <p>
                    <b>Status:</b>{" "}
                    <span
                      style={{
                        color: scanResult.safeToUse ? "#388e3c" : "#d32f2f",
                        fontWeight: 600,
                      }}
                    >
                      {scanResult.safeToUse ? "Safe" : "Not Safe"}
                    </span>
                  </p>
                  <p
  style={{
    color: "#d32f2f",            // red text to indicate caution
    fontWeight: 700,             // bold text
    backgroundColor: "#ffe6e6",  // light red background
    padding: "8px 12px",         // some padding
    borderRadius: 6,             // rounded corners
    textAlign: "center",         // center the text
    fontSize: 15,                // slightly larger font
    textTransform: "uppercase"   // uppercase for emphasis
  }}
>
  {scanResult.message}
</p>

                  {scanResult.aiAnalysis && (
                    <div
                      style={{
                        marginTop: 16,
                        background: "#f1f8e9",
                        borderRadius: 8,
                        padding: 12,
                        textAlign: "left",
                      }}
                    >
                      <h4 style={{ margin: "0 0 8px 0", color: "#388e3c" }}>
                        AI Analysis
                      </h4>
                      <p>
                        <b>Detected Class:</b>{" "}
                        {scanResult.aiAnalysis.detectedClass}
                      </p>
                      <p>
                        <b>Quality:</b> {scanResult.aiAnalysis.quality}
                      </p>
                      <p>
                        <b>Disease:</b> {scanResult.aiAnalysis.disease}
                      </p>
                      <p>
                        <b>Confidence:</b>{" "}
                        {(scanResult.aiAnalysis.confidence * 100).toFixed(1)}%
                      </p>
                      <p>
                        <b>Notes:</b> {scanResult.aiAnalysis.notes}
                      </p>
                    </div>
                  )}
                  <button
                    style={{
                      ...buttonStyle,
                      background: "#d32f2f",
                      marginTop: 18,
                    }}
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Weather Card - Agricultural Weather */}
          <section
            style={{
              position: "relative",
              background: COLORS.card,
              borderRadius: 12,
              boxShadow: COLORS.cardShadow,
              padding: "16px 12px",
              minWidth: 280,
              maxWidth: 320,
              flex: "1 1 280px",
              marginBottom: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: "cardEntrance 0.9s cubic-bezier(.5,1.5,.5,1)",
            }}
          >
            {/* Local Weather Flag */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                background: "#2196f3",
                color: "#fff",
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: 6,
                zIndex: 5,
                textTransform: "uppercase",
              }}
            >
              📍 Local
            </div>

            <h2 style={cardTitle}>
              {/* Weather SVG icon */}
              <span style={{ verticalAlign: "middle", marginRight: 8 }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="6"
                    fill="#ffeb3b"
                    stroke="#fbc02d"
                    strokeWidth="2"
                  />
                  <g stroke="#fbc02d" strokeWidth="2">
                    <line x1="12" y1="2" x2="12" y2="5" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="5" y2="12" />
                    <line x1="19" y1="12" x2="22" y2="12" />
                    <line x1="4.2" y1="4.2" x2="6.3" y2="6.3" />
                    <line x1="17.7" y1="17.7" x2="19.8" y2="19.8" />
                    <line x1="4.2" y1="19.8" x2="6.3" y2="17.7" />
                    <line x1="17.7" y1="6.3" x2="19.8" y2="4.2" />
                  </g>
                </svg>
              </span>
              {t.weatherPrediction}
            </h2>

            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <button
                style={iconButtonStyle}
                title="Get Weather"
                onClick={fetchWeather}
              >
                {/* Cloud SVG icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <ellipse cx="12" cy="17" rx="7" ry="4" fill="#90caf9" />
                  <ellipse cx="16" cy="15" rx="5" ry="3" fill="#64b5f6" />
                </svg>
              </button>
              <button
                style={iconButtonStyle}
                title="Detect Location"
                onClick={fetchGeoLocation}
              >
                {/* Location SVG icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="10" r="3" fill="#388e3c" />
                  <path
                    d="M12 2C7 2 3 6.03 3 11.25c0 4.13 3.4 7.98 8.1 10.6a2 2 0 0 0 1.8 0C17.6 19.23 21 15.38 21 11.25 21 6.03 17 2 12 2Z"
                    stroke="#388e3c"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </button>
            </div>

            {/* Loading State */}
            {weatherLoading && (
              <div style={{ marginTop: 18, textAlign: "center" }}>
                <div style={{ fontSize: 32, animation: "weatherPulse 1.5s infinite" }}>🌤️</div>
                <p style={{ color: COLORS.text, opacity: 0.7, marginTop: 8 }}>{t.fetchingWeather}</p>
              </div>
            )}

            {/* Error State */}
            {weatherError && !weatherLoading && (
              <div style={{ marginTop: 18, textAlign: "center", color: "#d32f2f", fontSize: 14 }}>
                {weatherError}
              </div>
            )}

            {/* Weather Data */}
            {weather && !weatherLoading && (
              <div style={{ marginTop: 12, textAlign: "center", width: "100%" }}>
                {/* Main temperature display */}
                <div style={{ fontSize: 42, marginBottom: 4 }}>{weather.icon || "🌡️"}</div>
                <p style={{ fontSize: 32, fontWeight: 700, color: COLORS.text, margin: "2px 0" }}>
                  {weather.temperature}
                </p>
                <p style={{ fontSize: 12, color: COLORS.text, opacity: 0.6, margin: "0" }}>
                  Feels like {weather.feelsLike}
                </p>
                <p style={{ fontSize: 14, color: COLORS.text, opacity: 0.85, margin: "4px 0" }}>
                  {weather.condition}
                </p>
                
                {/* Location with coordinates */}
                <div style={{ background: COLORS.inputBg, borderRadius: 8, padding: "8px", margin: "8px 0" }}>
                  <p style={{ fontSize: 13, color: COLORS.text, fontWeight: 600, margin: "2px 0" }}>
                    📍 {weather.location}
                  </p>
                  <p style={{ fontSize: 10, color: COLORS.text, opacity: 0.6, margin: "2px 0" }}>
                    {weather.coordinates}
                  </p>
                </div>
                
                {/* Agricultural Data Grid */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: 6, 
                  marginTop: 10,
                  fontSize: 11,
                }}>
                  <div style={{ background: "#e3f2fd", borderRadius: 6, padding: "6px 4px" }}>
                    <div style={{ fontSize: 16 }}>💧</div>
                    <div style={{ fontWeight: 600, color: "#1565c0" }}>{weather.humidity}</div>
                    <div style={{ color: "#666", fontSize: 9 }}>Humidity</div>
                  </div>
                  <div style={{ background: "#e8f5e9", borderRadius: 6, padding: "6px 4px" }}>
                    <div style={{ fontSize: 16 }}>🌱</div>
                    <div style={{ fontWeight: 600, color: "#2e7d32" }}>{weather.soilTemp}</div>
                    <div style={{ color: "#666", fontSize: 9 }}>Soil Temp</div>
                  </div>
                  <div style={{ background: "#fff3e0", borderRadius: 6, padding: "6px 4px" }}>
                    <div style={{ fontSize: 16 }}>☀️</div>
                    <div style={{ fontWeight: 600, color: "#ef6c00" }}>{weather.uvIndex}</div>
                    <div style={{ color: "#666", fontSize: 9 }}>UV Index</div>
                  </div>
                  <div style={{ background: "#e1f5fe", borderRadius: 6, padding: "6px 4px" }}>
                    <div style={{ fontSize: 16 }}>🌧️</div>
                    <div style={{ fontWeight: 600, color: "#0277bd" }}>{weather.precipProbability}</div>
                    <div style={{ color: "#666", fontSize: 9 }}>Rain Prob</div>
                  </div>
                </div>
                
                {/* Wind and Sun times */}
                <div style={{ display: "flex", justifyContent: "space-around", marginTop: 8, fontSize: 11, color: COLORS.text }}>
                  <span>💨 {weather.windspeed}</span>
                  <span>🌅 {weather.sunrise}</span>
                  <span>🌇 {weather.sunset}</span>
                </div>
                
                {/* Farming Advisory */}
                {weather.farmingAdvisory && weather.farmingAdvisory.length > 0 && (
                  <div style={{ 
                    marginTop: 10, 
                    background: "#fffde7", 
                    borderRadius: 8, 
                    padding: "8px",
                    borderLeft: "3px solid #fbc02d"
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#f57f17", margin: "0 0 4px 0" }}>
                      🌾 Farming Advisory
                    </p>
                    {weather.farmingAdvisory.map((advice, idx) => (
                      <p key={idx} style={{ fontSize: 10, color: "#5d4037", margin: "2px 0", textAlign: "left" }}>
                        {advice}
                      </p>
                    ))}
                  </div>
                )}
                
                {/* Last updated */}
                <p style={{ fontSize: 9, color: COLORS.text, opacity: 0.5, marginTop: 8 }}>
                  Updated: {weather.lastUpdated}
                </p>
                
                {/* 7-Day Forecast */}
                {forecast.length > 0 && (
                  <div style={{ marginTop: 12, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>📅 7-Day Forecast</p>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
                      {forecast.map((day, idx) => (
                        <div key={idx} style={{
                          background: COLORS.inputBg,
                          borderRadius: 6,
                          padding: "4px 6px",
                          textAlign: "center",
                          minWidth: 42,
                        }}>
                          <div style={{ fontSize: 9, color: COLORS.text, opacity: 0.7 }}>{day.date}</div>
                          <div style={{ fontSize: 16 }}>{day.icon}</div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.text }}>{day.maxTemp}</div>
                          <div style={{ fontSize: 9, color: COLORS.text, opacity: 0.6 }}>{day.minTemp}</div>
                          <div style={{ fontSize: 8, color: "#0277bd" }}>🌧{day.rainProb}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {geoLocation && !weather && !weatherLoading && (
              <div style={{ marginTop: 8, fontSize: 13, color: "#388e3c" }}>
                <span>
                  📍 {geoLocation.village || geoLocation.city || ""}
                  {geoLocation.district ? ", " + geoLocation.district : ""}
                  {geoLocation.region ? ", " + geoLocation.region : ""}
                </span>
                <p style={{ fontSize: 10, opacity: 0.6, margin: "2px 0" }}>
                  {geoLocation.latitude?.toFixed(4)}°N, {geoLocation.longitude?.toFixed(4)}°E
                </p>
                <p style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>Click ☁️ to get local weather</p>
              </div>
            )}
          </section>

          {/* Market Prices Card */}
      
<section
  style={{
    position: "relative",
    background: COLORS.card,
    borderRadius: 12,
    boxShadow: COLORS.cardShadow,
    padding: "18px 14px",
    minWidth: 300,
    maxWidth: 360,
    flex: "1 1 300px",
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    animation: "cardEntrance 0.9s cubic-bezier(.5,1.5,.5,1)",
  }}
>
  {/* Live Flag */}
  <div
    style={{
      position: "absolute",
      top: 12,
      left: 12,
      background: "#ff5722",
      color: "#fff",
      fontSize: 12,
      fontWeight: 600,
      padding: "2px 8px",
      borderRadius: 6,
      zIndex: 5,
      textTransform: "uppercase",
    }}
  >
    Live
  </div>

  <h2 style={cardTitle}>
    <span style={{ verticalAlign: "middle", marginRight: 8 }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        fill="none"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="10" width="4" height="8" rx="1" fill="#8bc34a" />
        <rect x="9" y="6" width="4" height="12" rx="1" fill="#388e3c" />
        <rect x="15" y="13" width="4" height="5" rx="1" fill="#cddc39" />
      </svg>
    </span>
    {t.marketPrices}
  </h2>

  {/* Your Crop Price Card - Shows selected crop from calendar */}
  {selectedCrop && selectedCrop !== "Select" && (
    <div style={{
      width: "100%",
      marginBottom: 12,
      padding: 12,
      background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
      borderRadius: 10,
      border: `2px solid ${COLORS.primary}`,
      boxSizing: "border-box",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 22 }}>{cropOptions.find(c => c.name === selectedCrop)?.icon || "🌱"}</span>
          <span style={{ fontWeight: 700, color: COLORS.primaryDark, fontSize: 14 }}>{t.yourCropPrice}</span>
        </div>
        <button
          onClick={() => setPriceAlertEnabled(!priceAlertEnabled)}
          title={t.notifyPriceChange}
          style={{
            background: priceAlertEnabled ? COLORS.primary : "#ccc",
            border: "none",
            borderRadius: 20,
            padding: "4px 10px",
            fontSize: 11,
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          🔔 {priceAlertEnabled ? "ON" : "OFF"}
        </button>
      </div>
      
      {myCropPriceLoading ? (
        <div style={{ textAlign: "center", padding: 10, color: COLORS.text }}>
          ⏳ {t.trackingYourCrop}...
        </div>
      ) : myCropPrice ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.primaryDark }}>
              {selectedCrop}
            </span>
            {myCropPrice.isLive && (
              <span style={{
                background: "#4caf50",
                color: "#fff",
                padding: "2px 8px",
                borderRadius: 10,
                fontSize: 10,
                fontWeight: 600,
                animation: "livePulse 2s infinite",
              }}>
                ● LIVE
              </span>
            )}
          </div>
          
          <div style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            marginBottom: 8,
          }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: COLORS.primary }}>
              ₹{myCropPrice.avgPrice?.toLocaleString() || "—"}
            </span>
            <span style={{ fontSize: 12, color: "#666" }}>/ {t.perQuintal}</span>
          </div>
          
          <div style={{
            display: "flex",
            gap: 10,
            fontSize: 11,
            color: "#555",
            flexWrap: "wrap",
          }}>
            <span>📉 Min: ₹{myCropPrice.minPrice?.toLocaleString()}</span>
            <span>📈 Max: ₹{myCropPrice.maxPrice?.toLocaleString()}</span>
            {myCropPrice.msp && <span>🏛️ MSP: ₹{myCropPrice.msp?.toLocaleString()}</span>}
          </div>
          
          <div style={{
            marginTop: 8,
            fontSize: 10,
            color: "#777",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span>📍 {myCropPrice.state} • {myCropPrice.mandi}</span>
            <span>🕐 {lastPriceCheck ? new Date(lastPriceCheck).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ""}</span>
          </div>
          
          {myCropPrice.priceCount > 1 && (
            <div style={{ marginTop: 6, fontSize: 10, color: "#888" }}>
              📊 Average of {myCropPrice.priceCount} mandis
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: 10, color: "#666", fontSize: 12 }}>
          {t.selectCropForPrice}
        </div>
      )}
      
      {/* Refresh button */}
      {selectedCrop !== "Select" && (
        <button
          onClick={() => fetchMyCropPrice(selectedCrop)}
          disabled={myCropPriceLoading}
          style={{
            marginTop: 8,
            width: "100%",
            padding: "6px 10px",
            borderRadius: 6,
            border: "none",
            background: COLORS.primary,
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            opacity: myCropPriceLoading ? 0.7 : 1,
          }}
        >
          🔄 {myCropPriceLoading ? "Refreshing..." : "Refresh " + selectedCrop + " Price"}
        </button>
      )}
    </div>
  )}
  
  {/* No crop selected hint */}
  {(!selectedCrop || selectedCrop === "Select") && (
    <div style={{
      width: "100%",
      marginBottom: 12,
      padding: 10,
      background: "#fff3e0",
      borderRadius: 8,
      border: "1px dashed #ff9800",
      textAlign: "center",
      fontSize: 12,
      color: "#e65100",
      boxSizing: "border-box",
    }}>
      💡 {t.selectCropForPrice}
    </div>
  )}

  {/* State Filter */}
  <div style={{ width: "100%", marginBottom: 8 }}>
    <select
      value={selectedState}
      onChange={(e) => setSelectedState(e.target.value)}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 6,
        border: `1px solid ${COLORS.border}`,
        fontSize: 13,
        background: COLORS.inputBg,
      }}
    >
      <option value="PUNJAB">Punjab</option>
      <option value="HARYANA">Haryana</option>
      <option value="JAMMU-AND-KASHMIR">Jammu & Kashmir</option>
      <option value="UTTAR-PRADESH">Uttar Pradesh</option>
      <option value="MADHYA-PRADESH">Madhya Pradesh</option>
      <option value="MAHARASHTRA">Maharashtra</option>
      <option value="GUJARAT">Gujarat</option>
      <option value="RAJASTHAN">Rajasthan</option>
      <option value="KARNATAKA">Karnataka</option>
      <option value="TAMIL-NADU">Tamil Nadu</option>
      <option value="ANDHRA-PRADESH">Andhra Pradesh</option>
      <option value="TELANGANA">Telangana</option>
      <option value="WEST-BENGAL">West Bengal</option>
      <option value="BIHAR">Bihar</option>
    </select>
  </div>

  {/* Search */}
  <div style={{ width: "100%", marginBottom: 8 }}>
    <input
      type="text"
      placeholder="🔍 Search crop or mandi..."
      value={marketSearch}
      onChange={(e) => setMarketSearch(e.target.value)}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 6,
        border: `1px solid ${COLORS.border}`,
        fontSize: 13,
        background: COLORS.inputBg,
        boxSizing: "border-box",
      }}
    />
  </div>

  <div style={{ display: "flex", gap: 6, width: "100%", marginBottom: 10 }}>
    <button
      style={{ ...buttonStyle, flex: 1, padding: "8px 6px", fontSize: 12 }}
      onClick={fetchMarket}
      disabled={marketLoading}
    >
      {marketLoading ? "⏳ Loading..." : "📊 Get Prices"}
    </button>
    <button
      style={{ 
        ...buttonStyle, 
        flex: 1, 
        padding: "8px 6px", 
        fontSize: 12,
        background: "#1976d2",
      }}
      onClick={() => window.open(`https://www.kisandeals.com/mandiprices/district/ALL/${selectedState}/ALL`, "_blank")}
    >
      🌐 KisanDeals
    </button>
  </div>

  {/* Error Message */}
  {marketError && (
    <div style={{ 
      background: "#ffebee", 
      color: "#c62828", 
      padding: "8px 10px", 
      borderRadius: 6, 
      fontSize: 12,
      marginBottom: 8,
      width: "100%",
      boxSizing: "border-box",
    }}>
      {marketError}
    </div>
  )}

  {/* Price List */}
  <div style={{ 
    width: "100%", 
    maxHeight: 280, 
    overflowY: "auto",
    background: "#fafafa",
    borderRadius: 8,
    padding: 8,
  }}>
    {filteredMarket.length === 0 && !marketLoading && (
      <div style={{ textAlign: "center", color: "#888", padding: 16, fontSize: 13 }}>
        Click "Get Prices" to load market data
      </div>
    )}
    
    {filteredMarket.map((item, idx) => (
      <div 
        key={idx} 
        style={{ 
          background: "#fff",
          borderRadius: 8,
          padding: "10px 12px",
          marginBottom: 8,
          border: item.isLive ? "1px solid #4caf50" : "1px solid #e8e8e8",
          boxShadow: item.isLive ? "0 1px 6px rgba(76,175,80,0.15)" : "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{item.icon || "🌾"}</span>
            <div>
              <div style={{ fontWeight: 600, color: COLORS.text, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                {item.commodity}
                {item.isLive && (
                  <span 
                    className="live-badge"
                    style={{ 
                      background: "#4caf50", 
                      color: "#fff", 
                      fontSize: 8, 
                      padding: "2px 5px", 
                      borderRadius: 4,
                      fontWeight: 700,
                    }}
                  >
                    LIVE
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "#888" }}>
                📍 {item.mandi}{item.district ? `, ${item.district}` : ""}{item.state ? `, ${item.state}` : ""}
              </div>
            </div>
          </div>
          <button
            onClick={() => toggleFavorite(item.commodity)}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
              padding: 4,
            }}
          >
            {favoriteItems.includes(item.commodity) ? "⭐" : "☆"}
          </button>
        </div>
        
        {/* Price Range Bar */}
        {item.minPrice && item.maxPrice && (
          <div style={{ 
            margin: "8px 0 4px 0",
            background: "#f5f5f5",
            borderRadius: 6,
            padding: "6px 8px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#666", marginBottom: 4 }}>
              <span>Min: ₹{item.minPrice?.toLocaleString()}</span>
              <span style={{ fontWeight: 600, color: COLORS.primaryDark }}>Modal: ₹{item.modalPrice?.toLocaleString()}</span>
              <span>Max: ₹{item.maxPrice?.toLocaleString()}</span>
            </div>
            <div style={{ 
              height: 6, 
              background: "linear-gradient(90deg, #ffcdd2, #fff9c4, #c8e6c9)", 
              borderRadius: 3,
              position: "relative",
            }}>
              {/* Modal price indicator */}
              <div style={{
                position: "absolute",
                left: `${Math.min(95, Math.max(5, ((item.modalPrice - item.minPrice) / (item.maxPrice - item.minPrice)) * 100))}%`,
                top: -4,
                width: 12,
                height: 12,
                background: COLORS.primary,
                borderRadius: "50%",
                border: "2px solid #fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                transform: "translateX(-50%)",
              }} />
            </div>
          </div>
        )}
        
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginTop: 8,
          paddingTop: 8,
          borderTop: "1px dashed #eee",
        }}>
          <div style={{ 
            fontSize: 16, 
            fontWeight: 700, 
            color: COLORS.primaryDark,
          }}>
            ₹{item.modalPrice?.toLocaleString()}/{item.unit}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {item.arrivalDate && (
              <span style={{ fontSize: 9, color: "#999" }}>
                📅 {item.arrivalDate}
              </span>
            )}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 4,
              background: item.trend === "up" ? "#e8f5e9" : item.trend === "down" ? "#ffebee" : "#f5f5f5",
              padding: "3px 8px",
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 600,
              color: item.trend === "up" ? "#2e7d32" : item.trend === "down" ? "#c62828" : "#666",
            }}>
              {item.trend === "up" ? "📈" : item.trend === "down" ? "📉" : "➡️"}
              {item.changePercent > 0 ? "+" : ""}{item.changePercent}%
            </div>
          </div>
        </div>
        
        {item.msp && (
          <div style={{ 
            fontSize: 10, 
            color: "#666", 
            marginTop: 4,
            display: "flex",
            justifyContent: "space-between",
          }}>
            <span>MSP: ₹{item.msp}</span>
            <span style={{ 
              color: item.modalPrice >= item.msp ? "#2e7d32" : "#c62828",
              fontWeight: 500,
            }}>
              {item.modalPrice >= item.msp ? "✓ Above MSP" : "⚠ Below MSP"}
            </span>
          </div>
        )}
      </div>
    ))}
  </div>
  
  {/* Quick Links */}
  <div style={{ 
    marginTop: 10, 
    display: "flex", 
    flexWrap: "wrap", 
    gap: 4,
    justifyContent: "center",
  }}>
    {["WHEAT", "PADDY", "COTTON", "ONION", "TOMATO"].map(crop => (
      <button
        key={crop}
        onClick={() => window.open(`https://www.kisandeals.com/mandiprices/district/${crop}/${selectedState}/ALL`, "_blank")}
        style={{
          padding: "4px 8px",
          fontSize: 10,
          background: COLORS.accent,
          border: "none",
          borderRadius: 12,
          color: COLORS.text,
          cursor: "pointer",
        }}
      >
        {crop.charAt(0) + crop.slice(1).toLowerCase()}
      </button>
    ))}
  </div>
  
  {/* View on KisanDeals */}
  <div style={{ marginTop: 8, fontSize: 10, color: "#666", textAlign: "center" }}>
    {marketSource && (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        gap: 6,
        marginBottom: 4,
      }}>
        <span style={{ 
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: marketSource.includes("KisanDeals") ? "#e8f5e9" : "#fff3e0",
          padding: "3px 8px",
          borderRadius: 10,
          fontSize: 9,
          fontWeight: 600,
          color: marketSource.includes("KisanDeals") ? "#2e7d32" : "#e65100",
        }}>
          {marketSource.includes("KisanDeals") ? "🟢" : "🟡"} {marketSource}
        </span>
        {marketLastUpdated && (
          <span style={{ fontSize: 9, color: "#999" }}>
            Updated: {new Date(marketLastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    )}
    <span>View more: </span>
    <a 
      href={`https://www.kisandeals.com/mandiprices/district/ALL/${selectedState}/ALL`}
      target="_blank" 
      rel="noopener noreferrer"
      style={{ color: COLORS.primary, textDecoration: "underline" }}
    >
      KisanDeals.com
    </a>
  </div>
</section> 
{/* Vendor Verse Card */}
          <section
            style={{
              position: "relative",
              background: COLORS.card,
              borderRadius: 12,
              boxShadow: COLORS.cardShadow,
              padding: "18px 14px",
              minWidth: 220,
              maxWidth: 250,
              flex: "1 1 220px",
              marginBottom: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: "cardEntrance 0.9s cubic-bezier(.5,1.5,.5,1)",
            }}
          >
           {/* New Flag */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                background: "#ff5722",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 6,
                zIndex: 5,
                textTransform: "uppercase",
              }}
            >
              Coming Soon
            </div>

            <h2 style={cardTitle}>
              <span style={{ verticalAlign: "middle", marginRight: 8 }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="3"
                    fill="#8bc34a"
                  />
                  <circle cx="9" cy="9" r="2" fill="#fff" />
                  <circle cx="15" cy="9" r="2" fill="#fff" />
                  <circle cx="9" cy="15" r="2" fill="#fff" />
                  <circle cx="15" cy="15" r="2" fill="#fff" />
                </svg>
              </span>
              Vendor Verse
            </h2>

            <button
              style={{ ...buttonStyle, marginBottom: 10, width: "100%" }}
              onClick={() =>
                window.open(`${API_URL}/vendorverse`, "_blank")
              }
              disabled
            >
              Connect with Vendors
            </button>

            <p
              style={{ textAlign: "center", fontSize: 14, color: COLORS.text }}
            >
              Find agricultural suppliers, equipment dealers, and service
              providers
            </p>
          </section>

        </div>
      </div>
      </>
      ) : currentView === "detection" ? (
        <PlantImageDetection 
          userId={userId || GUEST_USER_ID} 
          language={language}
          onDetectionComplete={() => {
            if (userId) {
              showNotification("✅ Disease detection completed! Check history to view saved results.", "success");
            } else {
              showNotification("✅ Disease detection completed.", "success");
            }
          }}
        />
      ) : currentView === "history" ? (
        <DetectionHistory userId={userId || GUEST_USER_ID} />
      ) : null}
      {/* Footer */}
      <footer
        style={{
          width: "100%",
          background: COLORS.primary,
          color: COLORS.buttonText,
          textAlign: "center",
          padding: "12px 0",
          fontSize: 15,
          opacity: 0.9,
          marginTop: 40,
          letterSpacing: 1,
        }}
      >
        &copy; {new Date().getFullYear()} Krishi Saarthi
      </footer>

      {/* Voice Assistant Button */}
      <button
        style={{
          position: "fixed",
          bottom: 100,
          right: 32,
          zIndex: 5000,
          background: COLORS.primary,
          color: COLORS.buttonText,
          border: "none",
          borderRadius: "50%",
          width: 60,
          height: 60,
          boxShadow: COLORS.cardShadow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          cursor: "pointer",
          transition: "background 0.2s, box-shadow 0.2s, transform 0.1s",
          outline: "none",
          animation: "buttonPop 0.7s",
        }}
        title="Voice Assistant"
        onClick={handleVoiceInput}
      >
        <span role="img" aria-label="Voice Assistant">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
            <line x1="12" y1="22" x2="12" y2="18" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        </span>
      </button>

      {/* Floating Chat Button */}
      <button
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 5000,
          background: COLORS.primary,
          color: COLORS.buttonText,
          border: "none",
          borderRadius: "50%",
          width: 60,
          height: 60,
          boxShadow: COLORS.cardShadow,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          cursor: "pointer",
          transition: "background 0.2s, box-shadow 0.2s, transform 0.1s",
          outline: "none",
          animation: "buttonPop 0.7s",
        }}
        title="Open GreenGeenie"
        onClick={() => setChatOpen(true)}
      >
        <span role="img" aria-label="Chat">
          💬
        </span>
      </button>
      {/* GreenGeenie Modal */}
      {chatOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.25)",
            zIndex: 6000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "notifSlide 0.5s cubic-bezier(.5,1.5,.5,1)",
          }}
          onClick={() => setChatOpen(false)}
        >
          <div
            style={{
              background: COLORS.card,
              borderRadius: 18,
              boxShadow: COLORS.cardShadow,
              minWidth: 320,
              maxWidth: 400,
              width: "90vw",
              minHeight: 380,
              maxHeight: 520,
              display: "flex",
              flexDirection: "column",
              padding: 0,
              position: "relative",
              transform: "scale(1)",
              opacity: 1,
              transition:
                "transform 0.4s cubic-bezier(.5,1.5,.5,1), opacity 0.4s",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: COLORS.primary,
                color: COLORS.buttonText,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                padding: "16px 20px",
                fontWeight: 700,
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{t.chatbot}</span>
              <button
                onClick={() => setChatOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: 22,
                  cursor: "pointer",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <div
              ref={chatContainerRef}
              style={{
                flex: 1,
                padding: 18,
                overflowY: "auto",
                background: COLORS.inputBg,
              }}
            >
              {chatHistory.length === 0 && !chatLoading && (
                <div
                  style={{
                    color: COLORS.text,
                    opacity: 0.7,
                    textAlign: "center",
                    marginTop: 40,
                  }}
                >
                  {t.askAnything}
                </div>
              )}
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    margin: "10px 0",
                    textAlign: msg.from === "user" ? "right" : "left",
                    animation: "cardEntrance 0.7s cubic-bezier(.5,1.5,.5,1)",
                  }}
                >
                  <div style={{ 
                    display: "inline-flex", 
                    alignItems: "flex-end", 
                    gap: 6,
                    flexDirection: msg.from === "user" ? "row-reverse" : "row",
                  }}>
                    <span
                      style={{
                        display: "inline-block",
                        background:
                          msg.from === "user" ? COLORS.primary : COLORS.accent,
                        color:
                          msg.from === "user" ? COLORS.buttonText : COLORS.text,
                        borderRadius: 12,
                        padding: "8px 14px",
                        maxWidth: "75%",
                        fontSize: 15,
                        wordBreak: "break-word",
                        boxShadow:
                          msg.from === "user"
                            ? "0 2px 8px #43a04722"
                            : "0 2px 8px #b7e4c722",
                        animation: "cardEntrance 0.7s cubic-bezier(.5,1.5,.5,1)",
                      }}
                    >
                      {msg.text}
                    </span>
                    {/* Speaker button for all messages */}
                    <button
                      type="button"
                      onClick={() => speakText(msg.text, idx)}
                      style={{
                        background: speakingMsgIdx === idx ? COLORS.primary : "transparent",
                        color: speakingMsgIdx === idx ? COLORS.buttonText : COLORS.text,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: "50%",
                        width: 28,
                        height: 28,
                        fontSize: 14,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.2s",
                        animation: speakingMsgIdx === idx ? "pulse 1s infinite" : "none",
                      }}
                      title={speakingMsgIdx === idx ? "Stop speaking" : "Listen to this message"}
                    >
                      {speakingMsgIdx === idx ? "⏹️" : "🔊"}
                    </button>
                  </div>
                </div>
              ))}
              {/* Typing indicator */}
              {chatLoading && (
                <div
                  style={{
                    margin: "10px 0",
                    textAlign: "left",
                    animation: "cardEntrance 0.5s cubic-bezier(.5,1.5,.5,1)",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: COLORS.accent,
                      color: COLORS.text,
                      borderRadius: 12,
                      padding: "10px 16px",
                      fontSize: 15,
                    }}
                  >
                    <span style={{ display: "flex", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.primary, animation: "typingDot 1.4s infinite ease-in-out", animationDelay: "0s" }}></span>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.primary, animation: "typingDot 1.4s infinite ease-in-out", animationDelay: "0.2s" }}></span>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.primary, animation: "typingDot 1.4s infinite ease-in-out", animationDelay: "0.4s" }}></span>
                    </span>
                    <span style={{ marginLeft: 8, opacity: 0.7 }}>{t.thinking}</span>
                  </span>
                </div>
              )}
            </div>
            {/* Voice Controls */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              borderTop: `1px solid ${COLORS.inputBorder}`,
              background: COLORS.inputBg,
            }}>
              <button
                type="button"
                onClick={() => setAutoSpeak(!autoSpeak)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: autoSpeak ? COLORS.primary : "transparent",
                  color: autoSpeak ? COLORS.buttonText : COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 20,
                  padding: "6px 12px",
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                title={autoSpeak ? t.autoSpeakOn : t.autoSpeakOff}
              >
                🔊 {autoSpeak ? "ON" : "OFF"}
              </button>
              <span style={{ fontSize: 12, color: COLORS.text, opacity: 0.7 }}>
                {chatListening ? `🎤 ${t.listening}` : t.tapToSpeak}
              </span>
            </div>
            <form
              onSubmit={sendChatMessage}
              style={{
                display: "flex",
                borderTop: `1px solid ${COLORS.inputBorder}`,
                background: COLORS.card,
                borderBottomLeftRadius: 18,
                borderBottomRightRadius: 18,
              }}
            >
              {/* Microphone Button */}
              <button
                type="button"
                onClick={handleChatVoiceInput}
                disabled={chatLoading}
                style={{
                  background: chatListening ? "#ff5722" : COLORS.accent,
                  color: chatListening ? "#fff" : COLORS.text,
                  border: "none",
                  borderBottomLeftRadius: 18,
                  padding: "0 14px",
                  fontSize: 22,
                  cursor: chatLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  animation: chatListening ? "pulse 1s infinite" : "none",
                }}
                title={chatListening ? "Stop listening" : "Speak your message"}
              >
                🎤
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t.typeMessage}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  padding: "14px 16px",
                  fontSize: 16,
                  background: COLORS.inputBg,
                  color: COLORS.text,
                }}
                autoFocus
                disabled={chatLoading || chatListening}
              />
              <button
                type="submit"
                disabled={chatLoading}
                style={{
                  background: chatLoading ? "#9ccc9c" : COLORS.primary,
                  color: COLORS.buttonText,
                  border: "none",
                  borderBottomRightRadius: 18,
                  padding: "0 22px",
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: chatLoading ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  opacity: chatLoading ? 0.7 : 1,
                }}
              >
                {chatLoading ? "..." : t.send}
              </button>
            </form>
          </div>
        </div>
      )}
          <ReadPopup /> 
    </div>
  );
}

// --- Simple CSS-in-JS styles ---
const cardStyle = {
  background: COLORS.card,
  borderRadius: 12,
  boxShadow: COLORS.cardShadow,
  padding: "16px 10px", // reduced padding
  minWidth: 180, // reduced min width
  maxWidth: 210, // reduced max width
  flex: "1 1 180px",
  marginBottom: 14,
  background: COLORS.card,
  borderRadius: 12,
  boxShadow: COLORS.cardShadow,
  padding: "16px 10px", // reduced padding
  minWidth: 180, // reduced min width
  maxWidth: 210, // reduced max width
  flex: "1 1 180px",
  marginBottom: 14,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
const cardTitle = {
  marginBottom: 18,
  color: COLORS.text,
  fontSize: 24,
  fontWeight: 500,
  letterSpacing: 1,
};
const buttonStyle = {
  background: COLORS.primary,
  color: COLORS.buttonText,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "7px 18px",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
  transition: "background 0.2s, box-shadow 0.2s, transform 0.13s, scale 0.13s",
  outline: "none",
  margin: "6px 0",
  letterSpacing: 0.5,
};

// Add global button/input hover/focus animation styles
if (typeof window !== "undefined" && !window.__agrinext_btn_anim) {
  const style = document.createElement("style");
  style.innerHTML = `
    button, input[type="button"], input[type="submit"] {
      transition: background 0.2s, box-shadow 0.2s, transform 0.2s, border-color 0.2s;
    }
    /* Only style buttons without defined classes — respect CSS class definitions */
    button:not([class]):hover, button:not([class]):focus {
      background: rgba(127, 255, 106, 0.15);
      box-shadow: 0 4px 12px rgba(127, 255, 106, 0.1);
      transform: translateY(-1px);
    }
    input[type="text"]:focus, input[type="email"]:focus, input[type="password"]:focus, textarea:focus {
      box-shadow: 0 0 0 4px rgba(127,255,106,0.2) !important;
      border-color: #7fff6a !important;
      transition: box-shadow 0.2s, border 0.2s;
    }
  `;
  document.head.appendChild(style);
  window.__agrinext_btn_anim = true;
}
const iconButtonStyle = {
  background: COLORS.card,
  border: `2px solid ${COLORS.primary}`,
  background: COLORS.card,
  border: `2px solid ${COLORS.primary}`,
  borderRadius: "50%",
  padding: 8,
  padding: 8,
  cursor: "pointer",
  boxShadow: COLORS.cardShadow,
  boxShadow: COLORS.cardShadow,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.2s, border 0.2s, transform 0.1s",
  color: COLORS.primary,
  fontSize: 20,
  outline: "none",
  margin: "4px",
};
const inputStyle = {
  padding: "8px 12px",
  borderRadius: 6,
  border: `1px solid ${COLORS.inputBorder}`,
  fontSize: 16,
  color: COLORS.text,
  background: COLORS.inputBg,
  marginBottom: 10,
  width: "100%",
  boxSizing: "border-box",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};
const modalStyle = {
  background: "#0d150d",
  color: COLORS.text,
  borderRadius: 12,
  border: `1px solid ${COLORS.border}`,
  boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
  padding: "32px 28px",
  minWidth: 280,
  maxWidth: 350,
  textAlign: "center",
};

// --- Animation Styles (place after export default App) ---
const heroSectionStyle = {
  position: "relative",
  width: "100%",
  minHeight: 260,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  marginBottom: 40,
};
const heroBgStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "linear-gradient(120deg, #43e97b 0%, #38f9d7 100%)",
  zIndex: 1,
  animation: "bgMove 8s linear infinite alternate",
};
const heroContentStyle = {
  position: "relative",
  zIndex: 2,
  textAlign: "center",
  width: "100%",
};
const gradientTextStyle = {
  background: "linear-gradient(90deg, #fff 40%, #e0ffe0 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 700,
};
const waveAnimStyle = {
  display: "inline-block",
  animation: "wave 1.5s infinite",
  transformOrigin: "70% 70%",
};
const floatingIconBase = {
  position: "absolute",
  fontSize: 38,
  opacity: 0.7,
  zIndex: 2,
  pointerEvents: "none",
};
const floatingIconStyle1 = {
  ...floatingIconBase,
  left: 40,
  top: 40,
  animation: "float1 5s ease-in-out infinite",
};
const floatingIconStyle2 = {
  ...floatingIconBase,
  right: 60,
  top: 60,
  animation: "float2 6s ease-in-out infinite",
};
const floatingIconStyle3 = {
  ...floatingIconBase,
  left: "50%",
  bottom: 20,
  animation: "float3 7s ease-in-out infinite",
};

// Add keyframes to the page (only once)
if (typeof window !== "undefined" && !window.__krishisaarthi_hero_anim) {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes wave {
      0% { transform: rotate(0deg); }
      20% { transform: rotate(-15deg); }
      40% { transform: rotate(10deg); }
      60% { transform: rotate(-10deg); }
      80% { transform: rotate(5deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes float1 {
      0% { transform: translateY(0); }
      50% { transform: translateY(-18px); }
      100% { transform: translateY(0); }
    }
    @keyframes float2 {
      0% { transform: translateY(0); }
      50% { transform: translateY(16px); }
      100% { transform: translateY(0); }
    }
    @keyframes float3 {
      0% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
      100% { transform: translateY(0); }
    }
    @keyframes bgMove {
      0% { filter: hue-rotate(0deg); }
      100% { filter: hue-rotate(30deg); }
    }
    @keyframes fruitDrop {
      0% { opacity:1; transform: translateY(0) scale(1) rotate(0deg); }
      80% { opacity:1; }
      100% { opacity:0; transform: translateY(120px) scale(1.2) rotate(30deg); }
    }
    @keyframes notifSlide {
      0% { opacity:0; transform:translateY(-40px) scale(0.95); }
      60% { opacity:1; transform:translateY(0) scale(1.03); }
      100% { opacity:1; transform:translateY(0) scale(1); }
    }
    @keyframes fruitDrop {
      0% { opacity:1; transform: translateY(0) scale(1) rotate(0deg); }
      80% { opacity:1; }
      100% { opacity:0; transform: translateY(120px) scale(1.2) rotate(30deg); }
    }
    @keyframes notifSlide {
      0% { opacity:0; transform:translateY(-40px) scale(0.95); }
      60% { opacity:1; transform:translateY(0) scale(1.03); }
      100% { opacity:1; transform:translateY(0) scale(1); }
    }
  `;
  document.head.appendChild(style);
  window.__krishisaarthi_hero_anim = true;
}

// --- Animation Keyframes (add to <style> on mount) ---
if (typeof window !== "undefined" && !window.__agrinext_heavy_anim) {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes cardEntrance {
      0% { opacity: 0; transform: translateY(60px) scale(0.9) rotate(-3deg); }
      60% { opacity: 1; transform: translateY(-8px) scale(1.05) rotate(2deg); }
      100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
    }
    @keyframes buttonPop {
      0% { transform: scale(0.8); opacity: 0; }
      60% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes dashboardFadeIn {
      0% { opacity: 0; filter: blur(12px); }
      100% { opacity: 1; filter: blur(0); }
    }
    @keyframes bgGradientMove {
      0% { background-position: 0% 50%; }
      100% { background-position: 100% 50%; }
    }
    @keyframes inputFocus {
      0% { box-shadow: 0 0 0 0 #43a04744; }
      100% { box-shadow: 0 0 0 6px #43a04744; }
    }
    /* Floating icons and hero background already have float1, float2, float3, bgMove keyframes above. */
  `;
  document.head.appendChild(style);
  window.__agrinext_heavy_anim = true;
}

export default App;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { load } from "cheerio";
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import PriceAlert from "./models/PriceAlert.js";
import PlantDetection from "./models/PlantDetection.js";
import plantDetectionRouter from "./routes/plantDetection.js";
import cropDiseaseRouter from "./routes/cropDisease.js";
import Exa from "exa-js";

//connect to MongoDB
dotenv.config();

console.log("🚀 Starting server...");
console.log("📦 Connecting to MongoDB...");

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/krishi-sarthi", {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000,
})
.then(() => {
  console.log("✅ MongoDB connected successfully!");
})
.catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
  console.log("⚠️ Continuing without database...");
});


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("uploads")); // Serve uploaded files

// Initialize Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  // optionally, if using Vertex AI, you might add vertexai, project, location options
  // vertexai: true,
  // project: process.env.GOOGLE_CLOUD_PROJECT,
  // location: process.env.GOOGLE_CLOUD_LOCATION,
});

// Make AI client available to routes
app.set("aiClient", ai);


// register
app.post("/auth/register", async (req, res) => {
  try{
    const { email, password, phone, location, language} = req.body;
    const existingUser = await User.findOne({ email });
    if(existingUser){
      return res.status(400).json({error: "User already exists" });

    }
    const user = new User({
      email,
      password, 
      phone, 
      location, 
      language,
    });

    await user.save();
    res.json({success: true, userId: user._id });



  } catch( err ){
    res.status(500).json({error: err.message });
  }

});

//login
app.post("/auth/login", async (req, res) =>{
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcryptjs.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, userId: user._id, language: user.language, location: user.location });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// ger user profile

app.get("/user/:id", async (req, res) =>{
  try{
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);

  }catch(err){
    res.status(500).json({ error: err.message });
  }
});


//update the selected crops
app.post("/user/:id/crops", async(req, res) =>{
  try{
    const {crops} = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { selectedCrops: crops},
      {new: true }
    );
    res.json(user);
  } catch(err){
    res.status(500).json({ error: err.message });

  }
});


// create price alert
// Create price alert
app.post("/alerts", async (req, res) => {
  try {
    const { userId, commodity, targetPrice, state } = req.body;
    const alert = new PriceAlert({
      userId,
      commodity,
      targetPrice,
      state,
    });
    await alert.save();
    res.json({ success: true, alertId: alert._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's alerts
app.get("/alerts/:userId", async (req, res) => {
  try {
    const alerts = await PriceAlert.find({ userId: req.params.userId });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if price alert should trigger
app.post("/alerts/:id/check", async (req, res) => {
  try {
    const { currentPrice } = req.body;
    const alert = await PriceAlert.findById(req.params.id);

    if (currentPrice <= alert.targetPrice) {
      // Alert triggered! Send notification
      console.log(`⚠️ Price alert for ${alert.commodity}: ₹${currentPrice}`);
    }

    alert.lastPriceCheck = new Date();
    await alert.save();
    res.json({ triggered: currentPrice <= alert.targetPrice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





app.post("/generate-text", async (req, res) => {
  try {
    console.log("📨 /generate-text request received");
    const userMsg = req.body.prompt;
    const language = req.body.language || "English";
    
    console.log("📝 Message:", userMsg, "Language:", language);
    
    if (!userMsg) {
      return res.status(400).json({ reply: "Prompt is required" });
    }

    // Create a system prompt that instructs the AI to respond in the specified language
    const fullPrompt = `You are GreenGeenie, a helpful agricultural assistant for Indian farmers. You help with farming advice, crop information, weather guidance, and market prices. 

IMPORTANT: You MUST respond in ${language} language only. Do not use any other language in your response.

User's question: ${userMsg}`;

    console.log("🤖 Calling Gemini API with gemini-2.5-flash...");
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: fullPrompt }
          ]
        }
      ]
    });

    const replyText = result.candidates[0]?.content?.parts[0]?.text || "Unable to generate response";
    console.log("✅ Response generated:", replyText.substring(0, 50) + "...");
    return res.json({ reply: replyText });
  } catch (err) {
    console.error("❌ GenAI Error:", err.message);
    // handle specific error cases, e.g. invalid arguments
    if (err.status === 400) {
      return res.status(400).json({ reply: "Bad request to Gemini API" });
    }
    res.status(500).json({ reply: "Internal Server Error: " + err.message });
  }
});


app.get("/api/weather", async (req, res) => {
  try {
    const city = req.query.city || "Delhi";
    const apiKey = process.env.API_KEY;

    console.log("Fetching weather for:", city);
    console.log("Using API key:", apiKey ? "Yes" : "No");

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    const data = response.data;
    console.log("OpenWeatherMap response:", data);

    res.json({
      location: data.name,
      temperature: `${data.main.temp}°C`,
      condition: data.weather[0].description,
      prediction: "Fallback weather from backend",
    });
  } catch (error) {
    console.error("Weather API error:", error.response?.data || error.message);
    res.status(500).json({
      location: "N/A",
      temperature: "N/A",
      condition: "N/A",
      prediction: "Failed to fetch weather data",
    });
  }
});

// Market Prices API - Realistic mandi price data for Indian commodities
app.get("/api/market-prices", async (req, res) => {
  try {
    const state = req.query.state || "all";
    const commodity = req.query.commodity || "all";
    
    // Comprehensive commodity database with realistic Indian mandi prices
    const commodityData = {
      "Wheat": { basePrice: 2275, unit: "quintal", category: "Cereals", icon: "🌾", msp: 2275 },
      "Rice (Paddy)": { basePrice: 2183, unit: "quintal", category: "Cereals", icon: "🍚", msp: 2183 },
      "Maize": { basePrice: 2090, unit: "quintal", category: "Cereals", icon: "🌽", msp: 2090 },
      "Bajra": { basePrice: 2500, unit: "quintal", category: "Cereals", icon: "🌿", msp: 2500 },
      "Jowar": { basePrice: 3180, unit: "quintal", category: "Cereals", icon: "🌾", msp: 3180 },
      "Barley": { basePrice: 1850, unit: "quintal", category: "Cereals", icon: "🌾", msp: 1850 },
      "Cotton": { basePrice: 6620, unit: "quintal", category: "Fibre", icon: "☁️", msp: 6620 },
      "Sugarcane": { basePrice: 315, unit: "quintal", category: "Cash Crops", icon: "🎋", msp: 315 },
      "Groundnut": { basePrice: 6377, unit: "quintal", category: "Oilseeds", icon: "🥜", msp: 6377 },
      "Mustard": { basePrice: 5650, unit: "quintal", category: "Oilseeds", icon: "💛", msp: 5650 },
      "Soybean": { basePrice: 4600, unit: "quintal", category: "Oilseeds", icon: "🫘", msp: 4600 },
      "Sunflower": { basePrice: 6760, unit: "quintal", category: "Oilseeds", icon: "🌻", msp: 6760 },
      "Potato": { basePrice: 1200, unit: "quintal", category: "Vegetables", icon: "🥔", msp: null },
      "Onion": { basePrice: 1800, unit: "quintal", category: "Vegetables", icon: "🧅", msp: null },
      "Tomato": { basePrice: 2500, unit: "quintal", category: "Vegetables", icon: "🍅", msp: null },
      "Chana (Gram)": { basePrice: 5440, unit: "quintal", category: "Pulses", icon: "🫘", msp: 5440 },
      "Tur (Arhar)": { basePrice: 7000, unit: "quintal", category: "Pulses", icon: "🫛", msp: 7000 },
      "Moong": { basePrice: 8558, unit: "quintal", category: "Pulses", icon: "🫛", msp: 8558 },
      "Urad": { basePrice: 6950, unit: "quintal", category: "Pulses", icon: "🫛", msp: 6950 },
      "Masur (Lentil)": { basePrice: 6425, unit: "quintal", category: "Pulses", icon: "🫘", msp: 6425 },
    };
    
    // Major mandis across Indian states
    const mandiData = {
      "Punjab": [
        { name: "Khanna", district: "Ludhiana" },
        { name: "Jalandhar", district: "Jalandhar" },
        { name: "Amritsar", district: "Amritsar" },
        { name: "Bathinda", district: "Bathinda" },
        { name: "Patiala", district: "Patiala" },
      ],
      "Haryana": [
        { name: "Karnal", district: "Karnal" },
        { name: "Hisar", district: "Hisar" },
        { name: "Sirsa", district: "Sirsa" },
        { name: "Ambala", district: "Ambala" },
      ],
      "Uttar Pradesh": [
        { name: "Lucknow", district: "Lucknow" },
        { name: "Agra", district: "Agra" },
        { name: "Kanpur", district: "Kanpur" },
        { name: "Varanasi", district: "Varanasi" },
        { name: "Meerut", district: "Meerut" },
      ],
      "Madhya Pradesh": [
        { name: "Indore", district: "Indore" },
        { name: "Bhopal", district: "Bhopal" },
        { name: "Ujjain", district: "Ujjain" },
        { name: "Gwalior", district: "Gwalior" },
      ],
      "Maharashtra": [
        { name: "Nashik", district: "Nashik" },
        { name: "Pune", district: "Pune" },
        { name: "Nagpur", district: "Nagpur" },
        { name: "Solapur", district: "Solapur" },
      ],
      "Gujarat": [
        { name: "Rajkot", district: "Rajkot" },
        { name: "Ahmedabad", district: "Ahmedabad" },
        { name: "Surat", district: "Surat" },
        { name: "Junagadh", district: "Junagadh" },
      ],
      "Rajasthan": [
        { name: "Jaipur", district: "Jaipur" },
        { name: "Jodhpur", district: "Jodhpur" },
        { name: "Kota", district: "Kota" },
        { name: "Bikaner", district: "Bikaner" },
      ],
      "Tamil Nadu": [
        { name: "Chennai", district: "Chennai" },
        { name: "Coimbatore", district: "Coimbatore" },
        { name: "Madurai", district: "Madurai" },
        { name: "Salem", district: "Salem" },
      ],
    };
    
    // Generate realistic price variations
    const generatePrice = (basePrice, mandiName, commodityName) => {
      // Add some variation based on mandi and commodity hash
      const hash = (mandiName + commodityName).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      const variation = ((hash + dayOfYear) % 20 - 10) / 100; // -10% to +10%
      const price = Math.round(basePrice * (1 + variation));
      
      // Calculate trend based on previous day
      const yesterdayVariation = ((hash + dayOfYear - 1) % 20 - 10) / 100;
      const yesterdayPrice = Math.round(basePrice * (1 + yesterdayVariation));
      const change = price - yesterdayPrice;
      const changePercent = ((change / yesterdayPrice) * 100).toFixed(2);
      
      return {
        minPrice: Math.round(price * 0.95),
        maxPrice: Math.round(price * 1.05),
        modalPrice: price,
        change: change,
        changePercent: parseFloat(changePercent),
        trend: change > 0 ? "up" : change < 0 ? "down" : "stable"
      };
    };
    
    // Build response
    const results = [];
    const statesToProcess = state === "all" ? Object.keys(mandiData) : [state];
    
    for (const stateName of statesToProcess) {
      if (!mandiData[stateName]) continue;
      
      for (const mandi of mandiData[stateName]) {
        const commoditiesToProcess = commodity === "all" 
          ? Object.keys(commodityData) 
          : [commodity];
        
        for (const commodityName of commoditiesToProcess) {
          if (!commodityData[commodityName]) continue;
          
          const priceInfo = generatePrice(
            commodityData[commodityName].basePrice, 
            mandi.name, 
            commodityName
          );
          
          results.push({
            commodity: commodityName,
            icon: commodityData[commodityName].icon,
            category: commodityData[commodityName].category,
            unit: commodityData[commodityName].unit,
            msp: commodityData[commodityName].msp,
            state: stateName,
            mandi: mandi.name,
            district: mandi.district,
            ...priceInfo,
            arrivalDate: new Date().toISOString().split('T')[0],
            lastUpdated: new Date().toISOString(),
          });
        }
      }
    }
    
    // Sort by commodity name
    results.sort((a, b) => a.commodity.localeCompare(b.commodity));
    
    // Limit results to avoid overwhelming response
    const limitedResults = results.slice(0, 100);
    
    res.json({
      success: true,
      count: limitedResults.length,
      totalAvailable: results.length,
      date: new Date().toISOString().split('T')[0],
      states: Object.keys(mandiData),
      commodities: Object.keys(commodityData),
      data: limitedResults,
    });
    
  } catch (error) {
    console.error("Market prices error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch market prices",
      data: [],
    });
  }
});

// Live Market Prices from KisanDeals - Scrapes real mandi prices
app.get("/api/live-market-prices", async (req, res) => {
  try {
    const commodity = req.query.commodity || "ALL";
    const state = req.query.state || "PUNJAB";
    const mandi = req.query.mandi || "ALL";
    
    // State name mapping to KisanDeals format (full names with hyphens)
    const stateMapping = {
      'PUNJAB': 'PUNJAB',
      'HARYANA': 'HARYANA',
      'JAMMU': 'JAMMU-AND-KASHMIR',
      'JAMMU-AND-KASHMIR': 'JAMMU-AND-KASHMIR',
      'UTTAR-PRADESH': 'UTTAR-PRADESH',
      'MADHYA-PRADESH': 'MADHYA-PRADESH',
      'MAHARASHTRA': 'MAHARASHTRA',
      'GUJARAT': 'GUJARAT',
      'RAJASTHAN': 'RAJASTHAN',
      'KARNATAKA': 'KARNATAKA',
      'TAMIL-NADU': 'TAMIL-NADU',
      'ANDHRA-PRADESH': 'ANDHRA-PRADESH',
      'TELANGANA': 'TELANGANA',
      'WEST-BENGAL': 'WEST-BENGAL',
      'BIHAR': 'BIHAR',
      'ODISHA': 'ODISHA',
      'KERALA': 'KERALA',
      'JHARKHAND': 'JHARKHAND',
      'CHHATTISGARH': 'CHHATTISGARH',
      'UTTARAKHAND': 'UTTARAKHAND',
      'HIMACHAL-PRADESH': 'HIMACHAL-PRADESH',
      'GOA': 'GOA',
      'ASSAM': 'ASSAM',
    };
    
    // Build KisanDeals URL using correct pattern: /mandiprices/{COMMODITY}/{STATE}/{MANDI}
    const stateFormatted = stateMapping[state.toUpperCase().replace(/\s+/g, '-')] || state.toUpperCase().replace(/\s+/g, '-');
    const commodityFormatted = commodity.toUpperCase().replace(/\s+/g, '-');
    const mandiFormatted = mandi.toUpperCase().replace(/\s+/g, '-');
    
    // URL Pattern: https://www.kisandeals.com/mandiprices/POTATO/JAMMU-AND-KASHMIR/ALL
    const url = `https://www.kisandeals.com/mandiprices/${commodityFormatted}/${stateFormatted}/${mandiFormatted}`;
    
    console.log("Fetching live prices from KisanDeals:", url);
    
    // Fetch the page with browser-like headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Referer': 'https://www.kisandeals.com/mandiprices',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
      },
      timeout: 20000,
      maxRedirects: 5,
    });
    
    const $ = load(response.data);
    const prices = [];
    
    // Method 1: Parse the summary table at top (quick commodity prices)
    // Format: | Apple | ₹115.0 | ₹11500.0 |
    $('table').each((tableIdx, table) => {
      $(table).find('tr').each((i, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 2) {
          const commodityName = $(cells[0]).text().trim();
          const priceText1 = $(cells[1]).text().trim();
          const priceText2 = cells.length >= 3 ? $(cells[2]).text().trim() : "";
          
          // Extract numeric values
          const price1 = parseFloat(priceText1.replace(/[^\d.]/g, '')) || 0;
          const price2 = parseFloat(priceText2.replace(/[^\d.]/g, '')) || 0;
          
          if (commodityName && !commodityName.includes('Commodity') && (price1 || price2)) {
            const modalPrice = price2 > price1 ? price2 : price1 * 100; // Convert to quintal if needed
            
            prices.push({
              commodity: commodityName,
              variety: commodityName,
              state: stateFormatted.replace(/-/g, ' '),
              district: '',
              mandi: mandiFormatted !== 'ALL' ? mandiFormatted.replace(/-/g, ' ') : 'APMC Market',
              minPrice: Math.round(modalPrice * 0.85),
              modalPrice: Math.round(modalPrice),
              maxPrice: Math.round(modalPrice * 1.15),
              pricePerKg: price1,
              unit: "quintal",
              arrivalDate: new Date().toLocaleDateString('en-IN'),
              source: "KisanDeals",
              isLive: true,
            });
          }
        }
      });
    });
    
    // Method 2: Parse detailed cards using regex on raw HTML
    // Pattern: Commodity X | Variety X | State Y | District Z | Mandi W | Min Price ₹ A | Modal Price ₹ B | Max Price ₹ C
    const htmlText = response.data;
    
    // Look for structured data in various formats
    const patterns = [
      // Pattern 1: Pipe-separated format
      /Commodity\s+([^|<]+?)(?:\s*\||\s*<)[^|]*?State\s+([^|<]+?)(?:\s*\||\s*<)[^|]*?District\s+([^|<]+?)(?:\s*\||\s*<)[^|]*?(?:Mandi|Market)[^|]*?([^|<]+?)(?:\s*\||\s*<)[^|]*?Min\s*Price[^₹]*?₹\s*([\d,]+)[^|]*?Modal\s*Price[^₹]*?₹\s*([\d,]+)[^|]*?Max\s*Price[^₹]*?₹\s*([\d,]+)/gi,
      // Pattern 2: Alternative format
      /commodity[:\s]+([^,|<\n]+)[^]*?state[:\s]+([^,|<\n]+)[^]*?district[:\s]+([^,|<\n]+)[^]*?(?:mandi|market)[:\s]+([^,|<\n]+)[^]*?min[^₹]*₹\s*([\d,]+)[^]*?modal[^₹]*₹\s*([\d,]+)[^]*?max[^₹]*₹\s*([\d,]+)/gi,
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(htmlText)) !== null) {
        const item = {
          commodity: match[1].trim().replace(/<[^>]*>/g, ''),
          variety: match[1].trim().replace(/<[^>]*>/g, ''),
          state: match[2].trim().replace(/<[^>]*>/g, ''),
          district: match[3].trim().replace(/<[^>]*>/g, ''),
          mandi: match[4].trim().replace(/<[^>]*>/g, ''),
          minPrice: parseInt(match[5].replace(/,/g, '')) || 0,
          modalPrice: parseInt(match[6].replace(/,/g, '')) || 0,
          maxPrice: parseInt(match[7].replace(/,/g, '')) || 0,
          unit: "quintal",
          arrivalDate: new Date().toLocaleDateString('en-IN'),
          source: "KisanDeals",
          isLive: true,
        };
        
        if (item.modalPrice > 0) {
          prices.push(item);
        }
      }
    }
    
    // Remove duplicates
    const uniquePrices = [];
    const seen = new Set();
    for (const p of prices) {
      const key = `${p.commodity.toLowerCase()}-${p.mandi.toLowerCase()}`;
      if (!seen.has(key) && p.commodity.length > 1) {
        seen.add(key);
        // Add commodity icon
        p.icon = getCommodityIcon(p.commodity);
        uniquePrices.push(p);
      }
    }
    
    console.log(`Parsed ${uniquePrices.length} prices from KisanDeals`);
    
    res.json({
      success: uniquePrices.length > 0,
      source: "KisanDeals",
      sourceUrl: url,
      count: uniquePrices.length,
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
      state: stateFormatted,
      data: uniquePrices,
      message: uniquePrices.length > 0 
        ? `Found ${uniquePrices.length} live prices` 
        : "No prices found for this selection. Try a different state.",
    });
    
  } catch (error) {
    console.error("KisanDeals fetch error:", error.message);
    
    // Return fallback data so app still works
    const fallbackData = getFallbackMarketData(req.query.state || "PUNJAB");
    
    res.json({
      success: true,
      source: "Estimated (KisanDeals unavailable)",
      sourceUrl: "",
      count: fallbackData.length,
      date: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
      data: fallbackData,
      message: "Using estimated prices. Live data temporarily unavailable.",
      error: error.message,
    });
  }
});

// Helper: Get commodity icon
function getCommodityIcon(commodity) {
  const icons = {
    'wheat': '🌾', 'rice': '🍚', 'paddy': '🍚', 'maize': '🌽', 'corn': '🌽',
    'cotton': '☁️', 'sugarcane': '🎋', 'potato': '🥔', 'onion': '🧅',
    'tomato': '🍅', 'apple': '🍎', 'banana': '🍌', 'orange': '🍊',
    'mango': '🥭', 'grape': '🍇', 'pomegranate': '🍎', 'guava': '🍐',
    'mustard': '💛', 'groundnut': '🥜', 'soybean': '🫘', 'chana': '🫘',
    'gram': '🫘', 'tur': '🫛', 'moong': '🫛', 'urad': '🫛',
    'cabbage': '🥬', 'cauliflower': '🥦', 'carrot': '🥕', 'brinjal': '🍆',
    'bhindi': '🥒', 'capsicum': '🫑', 'chilli': '🌶️', 'garlic': '🧄',
    'ginger': '🫚', 'lemon': '🍋', 'papaya': '🍈', 'watermelon': '🍉',
    'egg': '🥚', 'milk': '🥛', 'curd': '🥛', 'ghee': '🧈',
  };
  
  const lower = commodity.toLowerCase();
  for (const [key, icon] of Object.entries(icons)) {
    if (lower.includes(key)) return icon;
  }
  return '🌱';
}

// Helper: Fallback market data when scraping fails
function getFallbackMarketData(state) {
  const baseData = [
    { commodity: "Wheat", icon: "🌾", basePrice: 2275, msp: 2275 },
    { commodity: "Rice (Paddy)", icon: "🍚", basePrice: 2183, msp: 2183 },
    { commodity: "Maize", icon: "🌽", basePrice: 2090, msp: 2090 },
    { commodity: "Cotton", icon: "☁️", basePrice: 6620, msp: 6620 },
    { commodity: "Mustard", icon: "💛", basePrice: 5650, msp: 5650 },
    { commodity: "Potato", icon: "🥔", basePrice: 1200, msp: null },
    { commodity: "Onion", icon: "🧅", basePrice: 1800, msp: null },
    { commodity: "Tomato", icon: "🍅", basePrice: 2500, msp: null },
    { commodity: "Sugarcane", icon: "🎋", basePrice: 315, msp: 315 },
    { commodity: "Groundnut", icon: "🥜", basePrice: 6377, msp: 6377 },
  ];
  
  const dayVariation = (new Date().getDate() % 10 - 5) / 100;
  
  return baseData.map(item => ({
    ...item,
    variety: item.commodity,
    state: state.replace(/-/g, ' '),
    district: "",
    mandi: "State Market",
    minPrice: Math.round(item.basePrice * (0.9 + dayVariation)),
    modalPrice: Math.round(item.basePrice * (1 + dayVariation)),
    maxPrice: Math.round(item.basePrice * (1.1 + dayVariation)),
    unit: "quintal",
    arrivalDate: new Date().toLocaleDateString('en-IN'),
    source: "Estimated",
    isLive: false,
  }));
}

// Quick reference endpoint for KisanDeals direct links
app.get("/api/kisandeals-links", (req, res) => {
  const stateDistricts = {
    "PUNJAB": ["LUDHIANA", "AMRITSAR", "JALANDHAR", "BATHINDA", "PATIALA", "MOGA", "FEROZEPUR"],
    "HARYANA": ["KARNAL", "HISAR", "SIRSA", "AMBALA", "SONIPAT", "PANIPAT", "ROHTAK"],
    "JAMMU": ["JAMMU", "KATHUA", "UDHAMPUR", "SAMBA"],
    "UTTAR-PRADESH": ["LUCKNOW", "AGRA", "KANPUR", "VARANASI", "MEERUT", "BAREILLY", "ALIGARH"],
    "MADHYA-PRADESH": ["INDORE", "BHOPAL", "UJJAIN", "GWALIOR", "JABALPUR", "SAGAR"],
    "MAHARASHTRA": ["NASHIK", "PUNE", "NAGPUR", "SOLAPUR", "KOLHAPUR", "AHMEDNAGAR"],
    "GUJARAT": ["RAJKOT", "AHMEDABAD", "SURAT", "JUNAGADH", "BHAVNAGAR", "JAMNAGAR"],
    "RAJASTHAN": ["JAIPUR", "JODHPUR", "KOTA", "BIKANER", "AJMER", "UDAIPUR"],
    "KARNATAKA": ["BANGALORE", "HUBLI", "BELGAUM", "MYSORE", "DAVANGERE"],
    "TAMIL-NADU": ["CHENNAI", "COIMBATORE", "MADURAI", "SALEM", "TRICHY"],
    "ANDHRA-PRADESH": ["HYDERABAD", "VIJAYAWADA", "GUNTUR", "KURNOOL", "VISAKHAPATNAM"],
    "TELANGANA": ["HYDERABAD", "WARANGAL", "NIZAMABAD", "KARIMNAGAR"],
  };
  
  const commodities = ["WHEAT", "PADDY", "COTTON", "SOYABEAN", "MAIZE", "ONION", "POTATO", "TOMATO", "MUSTARD", "GRAM", "CHANA", "GROUNDNUT"];
  
  // Generate district links
  const districtLinks = {};
  for (const [state, districts] of Object.entries(stateDistricts)) {
    districtLinks[state] = districts.map(d => ({
      district: d,
      url: `https://www.kisandeals.com/mandiprices/district/ALL/${state}/${d}`
    }));
  }
  
  res.json({
    success: true,
    description: "Direct links to KisanDeals for live mandi prices",
    urlPatterns: {
      byDistrict: "https://www.kisandeals.com/mandiprices/district/{COMMODITY}/{STATE}/{DISTRICT}",
      byCommodity: "https://www.kisandeals.com/mandiprices/{COMMODITY}",
      example: "https://www.kisandeals.com/mandiprices/district/ALL/JAMMU/ALL"
    },
    states: Object.keys(stateDistricts),
    commodities,
    districtLinks,
    tools: {
      excelDownload: "Click 'Export To Excel' button on any prices page",
      pricePredictor: "https://www.kisandeals.com/apmc/predict",
      comparePrices: "https://www.kisandeals.com/apmc/compare",
    },
  });
});


// Govt Schemes for Farmers using Exa
app.post("/api/schemes", async (req, res) => {
  try {
    const { state, crop, farmSize, language = "English" } = req.body;

    if (!state || !crop) {
      return res.status(400).json({ error: "State and crop are required" });
    }

    console.log(`🌾 Fetching schemes for ${farmSize} farmer, ${crop}, ${state}`);

    // Step 1 — Exa searches live govt websites
    const exa = new Exa(process.env.EXA_API_KEY);
    const query = `government schemes subsidies for ${farmSize} farmers growing ${crop} in ${state} India 2024 2025`;

    const exaResults = await exa.searchAndContents(query, {
      numResults: 5,
      includeDomains: [
        "pmkisan.gov.in",
        "agricoop.nic.in",
        "india.gov.in",
        "farmer.gov.in",
        "mkisan.gov.in",
        "jkagri.nic.in",
        "jkhorticulture.nic.in",
      ],
      useAutoprompt: true,
      text: { maxCharacters: 1000 },
    });

    console.log(`✅ Exa found ${exaResults.results.length} results`);

    // Step 2 — Pass to Gemini to summarize simply
    const schemesText = exaResults.results
      .map((r) => `${r.title}: ${r.text}`)
      .join("\n\n");

    const prompt = `You are a helpful assistant for Indian farmers.
Based on this information about government schemes:
${schemesText}

List the top 3-4 most relevant schemes for a ${farmSize} farmer growing ${crop} in ${state}.

For each scheme provide:
- Scheme name
- What benefit they get (in very simple language)
- Who is eligible
- How to apply (steps)
- Website or helpline number

IMPORTANT: Respond in ${language} language only. Keep it very simple and easy for a farmer to understand.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const summary =
      result.candidates[0]?.content?.parts[0]?.text ||
      "Unable to fetch schemes";

    res.json({
      success: true,
      schemes: summary,
      sources: exaResults.results.map((r) => ({
        title: r.title,
        url: r.url,
      })),
    });
  } catch (err) {
    console.error("❌ Schemes error:", err.message);
    res.status(500).json({ error: "Failed to fetch schemes: " + err.message });
  }
});

// Crop Failure Guide + PM Fasal Bima Insurance
app.post("/api/crop-insurance", async (req, res) => {
  try {
    const { crop, state, language = "English" } = req.body;

    if (!crop || !state) {
      return res.status(400).json({ error: "Crop and state are required" });
    }

    console.log(`🌾 Fetching crop failure guide for ${crop} in ${state}`);

    const prompt = `You are a helpful assistant for Indian farmers who have experienced crop failure.

A ${crop} farmer in ${state} needs help. Provide:

1. Immediate Steps (what to do in first 72 hours after crop failure)
2. PM Fasal Bima Yojana (crop insurance scheme):
   - Am I eligible?
   - How to register (step by step)
   - Documents needed
   - How to file a claim
   - Time limit to file claim
   - Expected compensation
3. State-specific schemes for ${state} farmers
4. Helpline numbers (PM Fasal Bima, state agriculture dept)
5. Next crop advice (what to plant next season after ${crop} failure)

IMPORTANT: Respond in ${language} language only. Keep it very simple for a farmer to understand. Use numbered steps.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const guide = result.candidates[0]?.content?.parts[0]?.text ||
                  "Unable to generate guide";

    res.json({
      success: true,
      crop,
      state,
      guide,
      quickInfo: {
        pmfbyHelpline: "1800-180-1551",
        pmfbyWebsite: "https://pmfby.gov.in",
        claimWindow: "72 hours after crop damage",
        registrationDeadline: "Before sowing season ends",
      }
    });

  } catch (err) {
    console.error("❌ Crop insurance error:", err.message);
    res.status(500).json({ error: "Failed to generate guide: " + err.message });
  }
});













// Plant Detection Routes
app.use("/api/plant-detection", plantDetectionRouter);
app.use("/api", cropDiseaseRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`📝 Endpoints:`);
  console.log(`   POST http://localhost:${port}/generate-text`);
  console.log(`   GET  http://localhost:${port}/api/market-prices`);
  console.log(`   GET  http://localhost:${port}/api/weather`);
  console.log(`   POST http://localhost:${port}/api/plant-detection/detect`);
  console.log(`   GET  http://localhost:${port}/api/plant-detection/history/:userId`);
  console.log(`   POST http://localhost:${port}/api/detect-disease`);
  console.log(`📝 Endpoints:`);
  console.log(`   POST http://localhost:${port}/generate-text`);
  console.log(`   GET  http://localhost:${port}/api/market-prices`);
  console.log(`   GET  http://localhost:${port}/api/weather`);
});

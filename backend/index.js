import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
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
import { getMandiRates, getMandiPriceTrend } from "./services/mandiRatesService.js";
import { searchMandiWebResults } from "./src/services/exaSearchService.js";

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
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
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

    // Create a system prompt that instructs the AI to respond in the specified language with markdown formatting
    const fullPrompt = `You are GreenGeenie, a helpful agricultural assistant for Indian farmers. You help with farming advice, crop information, weather guidance, and market prices.

IMPORTANT FORMATTING INSTRUCTIONS:
1. Format your response using markdown for better readability
2. Use **bold** for important terms, crops, and numbers
3. Use bullet points (- or *) for lists and options
4. Use numbered lists (1. 2. 3.) for steps and procedures
5. Use headers (## or ###) to organize main sections
6. Use > for important quotes or warnings
7. Always respond in ${language} language ONLY. No other languages.

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

// Mandi rates — 7-day price trend (Agmarknet)
app.get("/api/mandi-rates/trend", async (req, res) => {
  try {
    const stateRaw = req.query.state;
    const districtRaw = req.query.district;
    const commodityRaw = req.query.commodity;

    const state =
      stateRaw === undefined || stateRaw === null
        ? "all"
        : String(stateRaw).trim() || "all";
    const district =
      districtRaw === undefined || districtRaw === null
        ? "all"
        : String(districtRaw).trim() || "all";
    const commodity =
      commodityRaw !== undefined && commodityRaw !== null
        ? String(commodityRaw).trim()
        : "";

    if (!commodity) {
      return res.status(400).json({ error: "commodity is required" });
    }

    const payload = await getMandiPriceTrend({ state, district, commodity });
    return res.json({
      success: true,
      ...payload,
    });
  } catch (err) {
    console.error("Mandi price trend error:", err.message);
    res.status(500).json({ error: err.message || "Failed to fetch mandi price trend" });
  }
});

// Mandi rates from Agmarknet (data.gov.in)
// Use state=all and/or district=all (or omit) to skip those filters and query the full dataset (paginated).
// exaFallback=false → Agmarknet only (for two-step UI). Omit or true → run Exa when Agmarknet returns no rows (offset 0 only).
app.get("/api/mandi-rates", async (req, res) => {
  try {
    const stateRaw = req.query.state;
    const districtRaw = req.query.district;
    const state =
      stateRaw === undefined || stateRaw === null
        ? "all"
        : String(stateRaw).trim() || "all";
    const district =
      districtRaw === undefined || districtRaw === null
        ? "all"
        : String(districtRaw).trim() || "all";

    const limitRaw = parseInt(req.query.limit, 10);
    const offsetRaw = parseInt(req.query.offset, 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 50;
    const offset = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;

    const commodity = req.query.commodity ? String(req.query.commodity).trim() : undefined;
    const date = req.query.date ? String(req.query.date).trim() : undefined;

    const exaFb = req.query.exaFallback;
    const skipExa =
      exaFb === "false" ||
      exaFb === "0" ||
      String(exaFb).toLowerCase() === "false";

    const data = await getMandiRates({
      state,
      district,
      commodity,
      arrivalDate: date,
      limit,
      offset,
    });

    const records = data.records || [];

    if (records.length > 0) {
      return res.json({
        success: true,
        agmarknetAvailable: true,
        total: data.total,
        count: data.count,
        records,
      });
    }

    if (skipExa || offset > 0) {
      return res.json({
        success: true,
        agmarknetAvailable: false,
        total: data.total,
        count: 0,
        records: [],
      });
    }

    let webResults = [];
    let webSearchError;
    try {
      webResults = await searchMandiWebResults({
        commodity,
        district: districtRaw !== undefined && districtRaw !== null ? String(districtRaw) : "",
        state: stateRaw !== undefined && stateRaw !== null ? String(stateRaw) : "",
      });
    } catch (exaErr) {
      console.error("Exa mandi fallback error:", exaErr.message);
      webSearchError = "Could not fetch live results. Please try again.";
    }

    return res.json({
      success: true,
      agmarknetAvailable: false,
      message: "No data available on Agmarknet for this query.",
      webResults,
      ...(webSearchError ? { webSearchError } : {}),
      total: data.total,
      count: 0,
      records: [],
    });
  } catch (err) {
    console.error("Mandi rates error:", err.message);
    res.status(500).json({ error: err.message || "Failed to fetch mandi rates" });
  }
});

// Govt Schemes for Farmers using Exa
app.post("/api/schemes", async (req, res) => {
  try {
    const { state, crop, farmSize, language = "English" } = req.body;

    if (!state || !crop) {
      return res.status(400).json({ error: "State and crop are required" });
    }

    console.log(`Fetching schemes for ${farmSize} farmer, ${crop}, ${state} in language: ${language}`);

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

Format your response with **markdown** for clarity:
- Use ## for each scheme name
- Use **bold** for important terms and deadlines
- Use bullet points for benefits, eligibility, and application steps
- Use numbered lists for step-by-step procedures

For each scheme provide:
- Scheme name (as header)
- What benefit they get (bullet points, simple language)
- Who is eligible (bullet points)
- How to apply (numbered steps)
- Website or helpline number

**CRITICAL INSTRUCTION: You MUST respond ONLY in ${language}. Do NOT respond in any other language. All content must be in ${language}.**

Keep it very simple and easy for a farmer to understand.`;

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

    console.log(`Fetching crop failure guide for ${crop} in ${state} in language: ${language}`);

    const prompt = `You are a helpful assistant for Indian farmers who have experienced crop failure.

A ${crop} farmer in ${state} needs help. Provide:

1. **Immediate Steps** (what to do in first 72 hours after crop failure)
2. **PM Fasal Bima Yojana** (crop insurance scheme):
   - Am I eligible?
   - How to register (step by step with numbered lists)
   - Documents needed (bullet points)
   - How to file a claim
   - Time limit to file claim
   - Expected compensation
3. **State-specific schemes** for ${state} farmers
4. **Helpline numbers** (PM Fasal Bima, state agriculture dept)
5. **Next crop advice** (what to plant next season after ${crop} failure)

Format your response with **markdown**:
- Use ## for main section headers
- Use **bold** for important terms, deadlines, and schemes
- Use bullet points (-) for lists and options
- Use numbered lists (1. 2. 3.) for step-by-step procedures
- Use > for important warnings or critical actions

**CRITICAL INSTRUCTION: You MUST respond ONLY in ${language}. Do NOT respond in any other language. All content must be in ${language}.**

Keep it very simple for a farmer to understand.`;

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
  console.log(`   GET  http://localhost:${port}/api/mandi-rates`);
  console.log(`   GET  http://localhost:${port}/api/mandi-rates/trend`);
  console.log(`   GET  http://localhost:${port}/api/weather`);
  console.log(`   POST http://localhost:${port}/api/plant-detection/detect`);
  console.log(`   GET  http://localhost:${port}/api/plant-detection/history/:userId`);
  console.log(`   POST http://localhost:${port}/api/detect-disease`);
});

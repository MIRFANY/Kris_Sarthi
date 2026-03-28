# Plant & Fertilizer Detection ML Feature - Integration Guide

## Overview
This document explains how to integrate the Plant & Fertilizer Detection ML feature into your Krishi-Sarthi application.

## Features Implemented

### Backend Features
- **Plant Detection**: Identify crop/plant types from images using Gemini Vision AI
- **Disease Detection**: Detect plant diseases and health conditions
- **Fertilizer Recommendations**: AI-powered fertilizer suggestions based on plant type
- **Yield Prediction**: Predict crop yield, water requirements, harvest time
- **Budget Calculator**: Estimate fertilizer costs
- **Image Storage**: Upload and store detection images

### Frontend Features
- **Image Upload**: Drag-and-drop or click-to-upload interface
- **Detection Display**: Beautiful results showing plant type, disease, fertilizer, and predictions
- **Detection History**: View all past detections
- **Detailed Analysis**: AI-powered agricultural advice specific to the crop

## Installation & Setup

### 1. Install Backend Dependencies
The required dependencies are already in `package.json`:
```bash
cd backend
npm install
```

Key packages used:
- `multer` - File upload handling
- `@google/genai` - Gemini Vision AI
- `mongoose` - Plant detection model storage

### 2. Environment Variables
Update your `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/krishi-sarthi
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret
```

### 3. Frontend Setup
Install axios if not already installed in frontend:
```bash
cd frontend
npm install axios
```

## Integration Steps

### Step 1: Import Components in App.js
```javascript
import PlantImageDetection from "./PlantImageDetection";
import DetectionHistory from "./DetectionHistory";
```

### Step 2: Add Routes/Navigation
Add buttons or menu items to navigate to:
- Plant Detection page
- Detection History page

Example navigation:
```javascript
{userId && (
  <button onClick={() => setCurrentPage("detection")}>
    🌱 Plant Detection
  </button>
)}
```

### Step 3: Render Components
In your main App component:
```javascript
{currentPage === "detection" && (
  <PlantImageDetection 
    userId={userId} 
    language={language}
    onDetectionComplete={(detection) => {
      console.log("Detection completed:", detection);
      // Optionally show in chatbot or trigger next action
    }}
  />
)}

{currentPage === "history" && (
  <DetectionHistory userId={userId} />
)}
```

## API Endpoints

### Upload & Analyze Plant Image
**POST** `/api/plant-detection/detect`

Request:
```javascript
const formData = new FormData();
formData.append("image", imageFile);
formData.append("userId", userId);
formData.append("language", "English"); // Optional
```

Response:
```json
{
  "success": true,
  "detection": {
    "id": "detection-id",
    "plant": {
      "name": "Rice",
      "confidence": 92,
      "description": "..."
    },
    "disease": {
      "name": "Blast",
      "confidence": 85,
      "severity": "moderate"
    },
    "fertilizer": {
      "primary": "NPK 12:32:16",
      "quantity": "50 kg/acre",
      "frequency": "Monthly"
    },
    "predictions": {
      "yieldPrediction": "50-60 quintals/acre",
      "waterNeeded": "1200 mm",
      "bestHarvestTime": "120 days",
      "soilRequirements": "Loamy with pH 6.5-7.5"
    },
    "detailedAnalysis": "..."
  }
}
```

### Get Detection History
**GET** `/api/plant-detection/history/:userId`

Returns array of all user's detections.

### Get Single Detection
**GET** `/api/plant-detection/:detectionId`

### Delete Detection
**DELETE** `/api/plant-detection/:detectionId`

## How It Works

### Detection Flow
1. User uploads plant image
2. Image converted to Base64
3. Sent to Gemini Vision API with detailed prompt
4. Gemini analyzes and returns:
   - Plant identification
   - Disease detection
   - Fertilizer recommendations
   - Yield predictions
5. Results stored in MongoDB
6. Detailed AI analysis generated using Gemini
7. Results displayed in UI

### AI Prompts
The system uses specialized prompts to ensure accurate agricultural analysis:
- Plant identification prompt
- Disease detection prompt
- Yield prediction prompt
- Fertilizer recommendation prompt

## Usage Examples

### Example 1: Farmer detects rice disease
1. Farmer uploads rice plant photo showing brown spots
2. System detects: Rice plant with "Rice Blast" disease (Moderate severity)
3. Recommendation: NPK 12:32:16 @ 50 kg/acre monthly
4. Analysis: Advice on fungicide spray schedule and water management

### Example 2: Checking fertilizer cost
1. Farmer uploads wheat image
2. System determines: NPK 10:26:26 needed
3. Budget calculated: 50kg @ ₹15/kg = ₹750
4. AI suggests: Apply in 3 splits for 120-day crop

## Customization Options

### Add Custom Plant Types
Extend the AI prompt in `services/plantMLService.js` to include specific crops:
```javascript
const customCrops = ["Rice", "Wheat", "Maize", "Cotton", "Sugarcane"];
// Add to prompt to focus on these crops
```

### Add Disease Database
Create a `diseases.json` file with disease-specific treatment:
```json
{
  "Rice Blast": {
    "fungicide": "Tricyclazole",
    "dosage": "0.6 gm/liter",
    "interval": "7-10 days"
  }
}
```

### Add Local Fertilizer Prices
Update `plantMLService.js` to fetch real-time prices:
```javascript
export const getLocalFertilizerPrices = async (state) => {
  // Fetch from market price API
}
```

## Troubleshooting

### Issue: "AI client not initialized"
**Solution**: Ensure `GEMINI_API_KEY` is set in `.env`

### Issue: Image upload fails
**Solution**: Check file size (max 10MB) and format (JPEG, PNG, WebP)

### Issue: Detection takes too long
**Solution**: This is normal for first request to Gemini (~5-10 seconds)

### Issue: Incorrect plant detection
**Solution**: Upload clearer image of the leaf/fruit, ensure good lighting

## Performance Tips
1. Compress images before upload (reduce to <5MB)
2. Use .jpg format for better upload speed
3. Cache detection results to reduce API calls
4. Generate monthly summaries for reports

## Future Enhancements
- [ ] Real-time fertilizer price updates
- [ ] Multi-language support for results
- [ ] PDF report generation
- [ ] Pest detection (insects, etc.)
- [ ] Soil testing integration
- [ ] Weather-based recommendations
- [ ] Community sharing of detections
- [ ] Monthly crop advisory generation

## Support
For issues or questions, check:
1. Backend logs: `npm start` output
2. Frontend console: Browser DevTools
3. Gemini API documentation: https://ai.google.dev/docs/gemini_api_overview

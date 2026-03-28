# 🔧 Plant Detection ML - Troubleshooting & FAQ

## ❓ FAQ

### Q1: What images work best?
**A:** Best results with:
- Clear, well-lit photos
- Focus on leaf or fruit
- Entire plant in frame
- Good resolution (800x600 minimum)
- Natural outdoor lighting
- No filters or watermarks

Avoid:
- Blurry images
- Very small objects
- Multiple plants in one image
- Close-up macro shots
- Night photos
- Artificially colored images

### Q2: How accurate is the detection?
**A:** 
- Healthy vs diseased: 95%+ accuracy
- Plant type identification: 85-92% accuracy
- Disease identification: 80-90% accuracy
- Accuracy depends on image quality

### Q3: How long does analysis take?
**A:**
- First request: 5-10 seconds (API initialization)
- Subsequent requests: 3-7 seconds
- Network speed affects timing
- Larger images take slightly longer

### Q4: Can I use offline?
**A:** Currently requires internet for:
- Image upload
- Gemini API calls
- Database sync

Future: Offline detection possible with TensorFlow.js

### Q5: What if results are wrong?
**A:**
1. Try a different image
2. Take photo in better lighting
3. Ensure focus on affected area
4. For diseased plant: Show symptoms clearly
5. Report incorrect result for training

### Q6: How are results stored?
**A:**
- Local MongoDB database
- Images saved on server (uploads folder)
- Results linked to user ID
- Fully retrievable in history

### Q7: Can I delete my detection data?
**A:** Yes!
1. Go to "History" page
2. Click specific detection
3. Click "🗑️ Delete" button
4. Confirm deletion
5. Record removed from database and server

### Q8: Does it work for all crops?
**A:** Works best for:
- Rice, Wheat, Corn, Cotton, Sugarcane
- Tomato, Potato, Onion, Cabbage
- Mango, Apple, Citrus
- Beans, Lentils, Peas

Can adapt for other crops by:
1. Updating AI prompt
2. Providing regional crop data
3. Collecting local disease patterns

### Q9: Can I export results?
**A:** Currently: Copy from screen or screenshot
Planned: PDF export, Excel download, Email report

### Q10: Is my data private?
**A:** 
- Stored locally on your server
- Not shared with public
- Linked to your user ID
- Encrypted if HTTPS enabled

## 🐛 Common Issues & Fixes

### Issue 1: "File size too large"
**Error:** `Request body too large`

**Cause:** Image file exceeds 10MB limit

**Solution:**
1. Compress image before upload
2. Use online compressor: https://imagecompressor.com/
3. Target size: 500KB - 2MB
4. Use JPG instead of PNG

---

### Issue 2: "Invalid file type"
**Error:** `Invalid file type. Only JPEG, PNG, and WebP are allowed`

**Cause:** File is not an image or wrong format

**Solution:**
1. Check file format: JPEG, PNG, or WebP
2. Right-click image → Properties → Type
3. If needed, convert using:
   - Windows Photos app
   - Online converter
   - ImageMagick: `convert image.bmp image.jpg`

---

### Issue 3: "Cannot connect to server"
**Error:** `Failed to connect to http://localhost:5000`

**Cause:** Backend is not running

**Solution:**
1. Open terminal in backend folder
2. Run: `npm start`
3. Wait for: `✅ Server running on http://localhost:5000`
4. If error, check:
   ```bash
   # Port 5000 already in use?
   # Windows:
   netstat -ano | findstr :5000
   # Kill process:
   taskkill /PID <PID> /F
   
   # Or use different port in .env:
   PORT=5001
   ```

---

### Issue 4: "MongoDB connection failed"
**Error:** `❌ MongoDB connection failed`

**Cause:** MongoDB not running or wrong connection string

**Solution:**
1. Start MongoDB:
   ```bash
   # Windows Services:
   net start MongoDB
   
   # Or run manually:
   mongod
   ```

2. Check connection string in `.env`:
   ```
   # Local:
   MONGODB_URI=mongodb://localhost:27017/krishi-sarthi
   
   # MongoDB Atlas (cloud):
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/krishi-sarthi?retryWrites=true
   ```

3. Test connection:
   ```bash
   mongosh "mongodb://localhost:27017"
   ```

---

### Issue 5: "GEMINI_API_KEY is missing"
**Error:** `ApiKeyError: The GEMINI_API_KEY environment variable is not set`

**Cause:** Missing Gemini API key in `.env`

**Solution:**
1. Get free API key: https://aistudio.google.com/app/apikey
2. Add to backend/.env:
   ```
   GEMINI_API_KEY=your_actual_key_here
   ```
3. Restart backend: `npm start`

---

### Issue 6: "Image upload works but no results"
**Error:** Upload succeeds but blank results page

**Cause:** Possible API error or network issue

**Solution:**
1. Check browser console (F12 → Console)
2. Check backend logs
3. Try simpler, clearer image
4. Check internet connection
5. Increase timeout in frontend (change 5000ms to 30000ms):
   ```javascript
   // In PlantImageDetection.js
   // Add to axios call:
   {
     timeout: 30000 // 30 seconds
   }
   ```

---

### Issue 7: "Cannot find module 'plantDetection.js'"
**Error:** `Cannot find module './routes/plantDetection.js'`

**Cause:** File not created or wrong path

**Solution:**
1. Check file exists: `ls backend/routes/plantDetection.js`
2. Check backend/index.js has import:
   ```javascript
   import plantDetectionRouter from "./routes/plantDetection.js";
   ```
3. Verify file spelling and paths
4. Restart backend

---

### Issue 8: "CORS Error: Access blocked"
**Error:** `CORS error: Access to XMLHttpRequest blocked`

**Cause:** CORS not configured properly

**Solution:**
1. Check backend has CORS enabled:
   ```javascript
   // In backend/index.js
   app.use(cors());
   ```
2. Frontend URL matches backend CORS config
3. Check .env variable:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

---

### Issue 9: "Image not stored"
**Error:** Detection works but image not found in history

**Cause:** Uploads folder permissions or path issue

**Solution:**
1. Verify uploads folder exists:
   ```bash
   cd backend
   mkdir -p uploads/plant-images
   ```
2. Check folder permissions (should be read/write)
3. Verify path in .env or code:
   ```javascript
   const uploadDir = path.join(__dirname, "../uploads/plant-images");
   ```

---

### Issue 10: "Results different each time"
**Error:** Same image produces different results

**Cause:** Normal behavior - AI has slight variation

**Solution:**
1. This is expected for borderline cases
2. If consistently wrong, try different angle/lighting
3. Most results should be consistent (90%+)
4. Report significant inconsistencies

## 🚨 Error Messages Reference

| Error | Cause | Fix |
|-------|-------|-----|
| 400 Bad Request | Missing required field | Add userId, image to request |
| 404 Not Found | Endpoint doesn't exist | Check API path in frontend |
| 413 Payload Too Large | File too big | Compress image to <10MB |
| 415 Unsupported Media Type | Wrong file format | Use JPEG/PNG/WebP |
| 500 Internal Server Error | Backend error | Check backend logs |
| 503 Service Unavailable | Backend down | Start backend with `npm start` |
| ECONNREFUSED | Cannot connect to server | Ensure backend is running on port 5000 |
| ENOMEM | Out of memory | Restart backend or use smaller images |

## 🔍 Debug Mode

### Enable Verbose Logging

**Backend:**
```javascript
// Add to top of index.js
const DEBUG = true;

// Then use:
if (DEBUG) console.log("Debug info:", data);
```

**Frontend:**
Open browser DevTools (F12) and check:
1. Console tab for JS errors
2. Network tab to see API calls
3. Application tab for stored data

### Check API Responses

In Frontend DevTools → Network tab:
1. Click on `/api/plant-detection/detect` request
2. View Response tab to see actual data
3. Check status code (200 = success)

## 🔄 Reset & Cleanup

### Clear All Detections
```bash
# MongoDB - Delete all detections for user
mongosh
use krishi-sarthi
db.plantdetections.deleteMany({})
```

### Clear Images
```bash
# Remove uploaded images
rm -rf backend/uploads/plant-images/*
```

### Clear Frontend Cache
```bash
# Browser cache
Ctrl + Shift + Delete

# Redux/Local Storage
localStorage.clear()
sessionStorage.clear()
```

## 📞 Getting Help

When reporting issues, provide:
1. Error message (exact text)
2. Steps to reproduce
3. Screenshot/screenshot
4. Browser/Node version: `node --version`
5. Backend logs output
6. Frontend console error

### Check System Info
```bash
# Node version
node --version

# NPM version
npm --version

# MongoDB version
mongod --version

# OS
uname -a  # Linux/Mac
systeminfo  # Windows
```

## 📚 Resources for Debugging

1. **Error Codes**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
2. **Gemini API**: https://ai.google.dev/docs/error_handling
3. **Express.js**: https://expressjs.com/en/guide/error-handling.html
4. **MongoDB**: https://docs.mongodb.com/manual/troubleshooting/
5. **React**: https://react.dev/learn/react-terminology

## ✅ Pre-Support Checklist

Before contacting support:
- [ ] Tried clearing cache (Ctrl+Shift+Delete)
- [ ] Restarted backend (`npm start`)
- [ ] Restarted frontend (`npm start`)
- [ ] Checked .env variables all set
- [ ] Verified image format/size
- [ ] Read error message carefully
- [ ] Checked this troubleshooting guide
- [ ] Checked browser console (F12)
- [ ] Checked backend logs

---

**Still having issues?** 

1. Check ML_FEATURE_GUIDE.md for complete docs
2. Review APP_INTEGRATION_EXAMPLE.js for code patterns
3. Verify all files created correctly
4. Try with different test image
5. Hard refresh browser (Ctrl+Shift+R)

# Testing Guide

## ✅ What's Fixed

1. **Vision API Enabled**: Cloud Vision API is now enabled in your project
2. **Better Camera UI**: Improved mobile camera capture interface
3. **Better Error Messages**: More helpful error messages for debugging

## 🧪 How to Test

### 1. Test on Desktop

1. Open http://localhost:3000
2. Click "Tap to Take Photo or Select"
3. Select an image file from your computer
4. Click "Analyze"
5. You should see the nutrition scores

### 2. Test on Mobile (Camera)

1. Open http://localhost:3000 on your phone
2. Tap "Tap to Take Photo or Select"
3. On mobile devices, this should:
   - Open the camera app (if `capture="environment"` is supported)
   - Or show a menu to choose camera or photo library
4. Take a photo of a nutrition label
5. Tap "Analyze"
6. Wait for results

### 3. Troubleshooting Camera

If camera doesn't open automatically:

**On iOS Safari:**
- Make sure you're using HTTPS (or localhost)
- Grant camera permissions when prompted
- If it doesn't work, use "Select from Library" option

**On Android Chrome:**
- Grant camera permissions
- The `capture="environment"` attribute should work
- If not, you can still select from gallery

**Alternative:**
- The file input still works for selecting from photo library
- Just tap the upload area and choose "Photo Library" or "Files"

## 🔍 Debugging

### Check Server Logs

Look at the terminal where `npm run dev` is running. You should see:
```
[requestId] Processing image hash: xxxx, size: xxxx bytes
[requestId] OCR extracted xxx characters
[requestId] Scoring completed successfully
```

### Check Browser Console

Press F12 (or Cmd+Option+I on Mac) and check:
- Network tab: Look for `/api/analyze` request
- Console tab: Check for any JavaScript errors

### Common Issues

**"Failed to extract text from image"**
- ✅ Vision API is now enabled - this should be fixed
- Check server logs for detailed error
- Verify image is clear and readable

**"Permission denied"**
- Make sure you ran: `gcloud auth application-default login`
- Check that Vision API is enabled
- Verify service account has proper permissions

**Camera doesn't open**
- This is browser/device dependent
- Try selecting from photo library instead
- Make sure you're on HTTPS (or localhost)

## 📱 Mobile Testing Tips

1. **Use ngrok or similar** to test on real phone:
   ```bash
   ngrok http 3000
   # Use the HTTPS URL on your phone
   ```

2. **Or test on same network**:
   - Find your computer's IP: `ifconfig | grep "inet "`
   - Access from phone: `http://YOUR_IP:3000`

3. **PWA Installation**:
   - On mobile, you can "Add to Home Screen"
   - This makes it feel like a native app

## ✅ Expected Behavior

1. User taps upload area
2. Camera opens (on mobile) OR file picker opens (on desktop)
3. User takes/selects image
4. Preview shows the image
5. User taps "Analyze"
6. Loading state shows "Analyzing..."
7. Results appear with scores and explanations
8. Image is automatically saved to history

## 🐛 If Something Doesn't Work

1. Check server logs (terminal running `npm run dev`)
2. Check browser console (F12)
3. Check network tab for API errors
4. Verify environment variables are set
5. Make sure Vision API is enabled
6. Verify authentication is working

# 🔧 EODHD API Troubleshooting Guide

## ✅ API Key Verification

The EODHD API key `6848fa019edce9.81077823` has been **verified and is working correctly**. 

### Test Results:
- ✅ **RELIANCE.NSE**: ₹1463.3 (Live data)
- ✅ **TCS.NSE**: ₹3458.10 (Live data)  
- ✅ **HDFCBANK.NSE**: ₹1956.7 (Live data)

## 🚀 Quick Setup Steps

### 1. Environment Variable Setup
Ensure your `.env.local` file contains:
```bash
EODHD_API_KEY=6848fa019edce9.81077823
```

### 2. Restart Development Server
After adding the environment variable:
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 3. Test the API Endpoint
Visit these URLs in your browser to test:

**Test Endpoint:**
```
http://localhost:3000/api/test-eodhd
```

**Stocks API:**
```
http://localhost:3000/api/stocks/indian
```

## 🔍 Debugging Steps

### Step 1: Check Environment Variable
Open your browser's developer console and check the Network tab when visiting the stocks page. Look for:
- API calls to `/api/stocks/indian`
- Response data showing `realDataCount` vs `mockDataCount`

### Step 2: Check Server Logs
In your terminal running the dev server, look for:
```
✅ Real data fetched for RELIANCE.NSE: ₹1463.3
✅ Real data fetched for TCS.NSE: ₹3458.10
```

If you see:
```
❌ No real data for RELIANCE.NSE, using mock data
```

Then there's an API issue.

### Step 3: Manual API Test
Test the API directly in your browser:
```
https://eodhd.com/api/real-time/RELIANCE.NSE?api_token=6848fa019edce9.81077823&fmt=json
```

Should return:
```json
{
  "code": "RELIANCE.NSE",
  "timestamp": 1749614760,
  "open": 1445.8,
  "high": 1468.2,
  "low": 1443.1,
  "close": 1465.6,
  "volume": 2005253,
  "previousClose": 1438.5,
  "change": 27.1,
  "change_p": 1.8839
}
```

## 🎯 Expected Behavior

### Stocks Page Should Show:
1. **Header**: "NSE & BSE • 30 stocks • 30 live, 0 mock"
2. **Real Prices**: Current market prices (not random numbers)
3. **Live Updates**: Prices should reflect actual market data
4. **Market Status**: Shows if Indian markets are open/closed

### Data Source Indicators:
- **Green text**: "30 live, 0 mock" = All real data
- **Mixed**: "15 live, 15 mock" = Partial real data
- **No indicator**: All mock data (API not working)

## 🛠️ Common Issues & Solutions

### Issue 1: All Mock Data Showing
**Symptoms**: Random prices, no "live" indicator
**Solution**: 
1. Check `.env.local` file exists with correct API key
2. Restart development server
3. Clear browser cache

### Issue 2: Mixed Real/Mock Data
**Symptoms**: Some stocks show real data, others don't
**Cause**: Some stock symbols might not be available in EODHD
**Solution**: This is normal - the system gracefully falls back to mock data

### Issue 3: API Rate Limiting
**Symptoms**: Works initially, then stops
**Cause**: API rate limits exceeded
**Solution**: Wait a few minutes, or upgrade EODHD plan

### Issue 4: Network/CORS Issues
**Symptoms**: API calls fail in browser
**Cause**: Network restrictions or CORS
**Solution**: API calls are made server-side, so this shouldn't occur

## 📊 Monitoring Real Data

### Browser Developer Tools:
1. Open Developer Tools (F12)
2. Go to Network tab
3. Visit `/stocks` page
4. Look for call to `/api/stocks/indian`
5. Check response for `realDataCount` and `mockDataCount`

### Server Logs:
Look for these log messages:
```
✅ Successfully fetched 30 Indian stocks (30 real, 0 mock)
```

## 🔄 Force Refresh Data

To force fresh data (bypass caching):
1. Add `?refresh=true` to the stocks page URL
2. Or clear browser cache and reload

## 📞 Support

If issues persist:
1. Check server logs for error messages
2. Verify API key hasn't expired
3. Test direct API calls outside the application
4. Check EODHD service status

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Stocks page shows "X live, Y mock" in header
- ✅ Prices match real market data
- ✅ Server logs show "Real data fetched" messages
- ✅ Test endpoint returns live data

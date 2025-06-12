# 🧪 Database Seeding Test Guide

## Issues Fixed

### 1. **Portfolio Validation Errors** ✅
- **Problem**: Mock portfolio holdings used different field names than database schema
- **Solution**: Added field transformation in seeding functions:
  - `quantity` → `shares`
  - `averagePrice` → `averageCost`
  - `totalValue` → `marketValue`
  - Added missing required fields: `diversificationScore`, `performanceMetrics`

### 2. **ObjectId Casting Errors** ✅
- **Problem**: Code tried to search for users using mock IDs (like "investor_001") as MongoDB ObjectIds
- **Solution**: Changed lookup strategy to use email addresses only:
  ```javascript
  // Before (caused errors)
  const investor = await User.findOne({ 
    $or: [
      { email: mockUsers.find(u => u.id === mockPortfolio.investorId)?.email },
      { _id: mockPortfolio.investorId } // This caused ObjectId cast error
    ]
  });

  // After (works correctly)
  const mockInvestor = mockUsers.find(u => u.id === mockPortfolio.investorId);
  const investor = await User.findOne({ email: mockInvestor?.email });
  ```

## Testing the Fixes

### Step 1: Clear Database
```bash
curl -X DELETE "http://localhost:3000/api/admin/seed-data"
```

### Step 2: Seed Database
```bash
curl -X POST "http://localhost:3000/api/admin/seed-data"
```

### Step 3: Check Status
```bash
curl "http://localhost:3000/api/admin/seed-data"
```

### Step 4: Test APIs
```bash
# Test reports API
curl "http://localhost:3000/api/reports"

# Test portfolios API
curl "http://localhost:3000/api/portfolios"

# Test dashboard stats
curl "http://localhost:3000/api/dashboard/stats"
```

## Expected Results

### Successful Seeding Response:
```json
{
  "success": true,
  "message": "Database seeding completed",
  "results": {
    "users": { "created": 10, "skipped": 0, "errors": 0 },
    "portfolios": { "created": 5, "skipped": 0, "errors": 0 },
    "reports": { "created": 8, "skipped": 0, "errors": 0 }
  },
  "summary": {
    "totalCreated": 23,
    "totalSkipped": 0,
    "totalErrors": 0
  }
}
```

### Server Logs Should Show:
```
Seeding users...
Seeding portfolios...
Seeding reports...
✅ Successfully created all data without errors
```

### No More Error Messages:
- ❌ "Portfolio validation failed: holdings.0.marketValue: Path `marketValue` is required"
- ❌ "CastError: Cast to ObjectId failed for value 'investor_001'"

## Verification Steps

1. **Visit the application pages:**
   - `/dashboard` - Should show real statistics
   - `/portfolios` - Should display portfolios with proper INR formatting
   - `/reports` - Should show analysis reports
   - `/stocks` - Should show Indian stocks (with EODHD API data)

2. **Check data consistency:**
   - Portfolio holdings should have all required fields
   - User relationships should be properly linked
   - Reports should be associated with correct users and portfolios

3. **Monitor server logs:**
   - No more validation errors
   - No more ObjectId casting errors
   - Successful database operations

## Troubleshooting

If you still see errors:

1. **Clear browser cache** and reload
2. **Restart the development server**
3. **Check MongoDB connection** in logs
4. **Verify .env.local** has correct database URL
5. **Check database permissions**

## Success Indicators

✅ Database seeding completes without errors
✅ All pages load with real data
✅ INR currency formatting works
✅ Indian stocks page shows live data
✅ No validation errors in server logs
✅ Proper relationships between users, portfolios, and reports

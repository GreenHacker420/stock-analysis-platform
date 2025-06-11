import { NextResponse } from 'next/server';

const EODHD_API_KEY = process.env.EODHD_API_KEY || '6848fa019edce9.81077823';
const EODHD_BASE_URL = 'https://eodhd.com/api';

export async function GET() {
  try {
    console.log('Testing EODHD API...');
    console.log(`API Key: ${EODHD_API_KEY ? 'Present' : 'Missing'}`);
    
    // Test with a single stock
    const testSymbol = 'RELIANCE.NSE';
    const url = `${EODHD_BASE_URL}/real-time/${testSymbol}?api_token=${EODHD_API_KEY}&fmt=json`;
    
    console.log(`Test URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'StockAnalysisPlatform/1.0'
      },
      cache: 'no-store'
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      
      return NextResponse.json({
        success: false,
        error: `API returned ${response.status}`,
        details: errorText,
        url: url.replace(EODHD_API_KEY, 'HIDDEN'),
        timestamp: new Date().toISOString()
      });
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    return NextResponse.json({
      success: true,
      message: 'EODHD API is working!',
      testSymbol,
      data,
      url: url.replace(EODHD_API_KEY, 'HIDDEN'),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Network or parsing error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

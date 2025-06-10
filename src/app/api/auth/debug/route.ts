import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const config = {
      environment: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
      mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Missing',
      geminiApiKey: process.env.GEMINI_API_KEY ? 'Set' : 'Missing',
    }

    // Test database connection
    let dbStatus = 'Unknown'
    try {
      await connectDB()
      dbStatus = 'Connected'
    } catch (error) {
      dbStatus = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    return NextResponse.json({
      config,
      database: {
        status: dbStatus,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

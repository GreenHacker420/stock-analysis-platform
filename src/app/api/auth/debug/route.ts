import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  // Allow in production for debugging authentication issues
  // In a real production app, you might want to add authentication here

  try {
    const config = {
      environment: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
      mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Missing',
      geminiApiKey: process.env.GEMINI_API_KEY ? 'Set' : 'Missing',
      // Additional debug info
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
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

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions)

    // Connect to database
    await connectDB()

    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
          role: session.user?.role,
          isActive: session.user?.isActive,
        }
      } : null,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasMongodbUri: !!process.env.MONGODB_URI,
      },
      headers: {
        host: request.headers.get('host'),
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
        origin: request.headers.get('origin'),
      }
    }

    // If session exists, get user from database
    if (session?.user?.email) {
      try {
        const user = await User.findOne({ email: session.user.email })
        debugInfo.databaseUser = user ? {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
        } : null
      } catch (dbError) {
        debugInfo.databaseError = dbError instanceof Error ? dbError.message : 'Unknown database error'
      }
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Debug endpoint error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'

interface ErrorReport {
  id: string
  message: string
  stack?: string
  level: 'error' | 'warning' | 'info'
  context: {
    userId?: string
    userRole?: string
    portfolioId?: string
    symbol?: string
    action?: string
    timestamp: Date
    userAgent?: string
    url?: string
  }
  fingerprint?: string
}

// In-memory storage for demo purposes
// In production, you'd store these in a database
const errorStore: ErrorReport[] = []

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const errorReport: ErrorReport = await request.json()

    // Add session context if available
    if (session?.user) {
      errorReport.context.userId = session.user.id
      errorReport.context.userRole = session.user.role
    }

    // Store the error report
    errorStore.push(errorReport)

    // Keep only last 1000 errors to prevent memory issues
    if (errorStore.length > 1000) {
      errorStore.splice(0, errorStore.length - 1000)
    }

    // Log critical errors
    if (errorReport.level === 'error') {
      console.error('Client Error:', {
        message: errorReport.message,
        userId: errorReport.context.userId,
        url: errorReport.context.url,
        timestamp: errorReport.context.timestamp,
      })
    }

    return NextResponse.json({ 
      success: true, 
      errorId: errorReport.id 
    }, { status: 201 })

  } catch (error) {
    console.error('Error processing error report:', error)
    return NextResponse.json(
      { error: 'Failed to process error report' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow analysts and admins to view error reports
    if (!session?.user || session.user.role !== 'analyst') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let filteredErrors = errorStore

    // Filter by level if specified
    if (level) {
      filteredErrors = errorStore.filter(error => error.level === level)
    }

    // Sort by timestamp (newest first)
    filteredErrors.sort((a, b) => 
      new Date(b.context.timestamp).getTime() - new Date(a.context.timestamp).getTime()
    )

    // Apply pagination
    const paginatedErrors = filteredErrors.slice(offset, offset + limit)

    // Calculate error statistics
    const stats = {
      total: errorStore.length,
      byLevel: errorStore.reduce((acc, error) => {
        acc[error.level] = (acc[error.level] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byFingerprint: errorStore.reduce((acc, error) => {
        if (error.fingerprint) {
          acc[error.fingerprint] = (acc[error.fingerprint] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>),
    }

    return NextResponse.json({
      errors: paginatedErrors,
      stats,
      pagination: {
        total: filteredErrors.length,
        limit,
        offset,
        hasMore: offset + limit < filteredErrors.length,
      },
    })

  } catch (error) {
    console.error('Error fetching error reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch error reports' },
      { status: 500 }
    )
  }
}

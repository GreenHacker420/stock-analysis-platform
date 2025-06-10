import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
    const { errors }: { errors: ErrorReport[] } = await request.json()

    if (!Array.isArray(errors)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    // Process each error in the batch
    const processedErrors = errors.map(errorReport => {
      // Add session context if available
      if (session?.user) {
        errorReport.context.userId = session.user.id
        errorReport.context.userRole = session.user.role
      }

      return errorReport
    })

    // Store all error reports
    errorStore.push(...processedErrors)

    // Keep only last 1000 errors to prevent memory issues
    if (errorStore.length > 1000) {
      errorStore.splice(0, errorStore.length - 1000)
    }

    // Log critical errors
    const criticalErrors = processedErrors.filter(error => error.level === 'error')
    if (criticalErrors.length > 0) {
      console.error(`Batch: ${criticalErrors.length} critical errors received`, {
        userId: session?.user?.id,
        timestamp: new Date(),
        errorIds: criticalErrors.map(e => e.id),
      })
    }

    return NextResponse.json({ 
      success: true, 
      processed: processedErrors.length,
      errorIds: processedErrors.map(e => e.id)
    }, { status: 201 })

  } catch (error) {
    console.error('Error processing batch error report:', error)
    return NextResponse.json(
      { error: 'Failed to process batch error report' },
      { status: 500 }
    )
  }
}

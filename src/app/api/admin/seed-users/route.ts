import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { seedUsers, clearUsers, verifyUsers, getDemoCredentials } from '@/scripts/seedUsers';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin/analyst
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // For demo purposes, allow any authenticated user to seed
    // In production, you might want to restrict this to admins only
    
    const { action } = await request.json();

    switch (action) {
      case 'seed':
        console.log('🌱 Starting user seeding process...');
        const seedResult = await seedUsers();
        
        return NextResponse.json({
          success: seedResult.success,
          message: seedResult.success 
            ? `Successfully seeded ${seedResult.created} new users and updated ${seedResult.updated} existing users`
            : 'Seeding completed with errors',
          data: {
            created: seedResult.created,
            updated: seedResult.updated,
            errors: seedResult.errors,
            users: seedResult.users,
          }
        });

      case 'clear':
        console.log('🗑️ Starting user clearing process...');
        const clearResult = await clearUsers();
        
        return NextResponse.json({
          success: clearResult.success,
          message: clearResult.success 
            ? `Successfully deleted ${clearResult.deletedCount} users`
            : 'Failed to clear users',
          data: {
            deletedCount: clearResult.deletedCount,
            error: clearResult.error,
          }
        });

      case 'verify':
        console.log('🔍 Starting user verification process...');
        const verifyResult = await verifyUsers();
        
        return NextResponse.json({
          success: verifyResult.success,
          message: verifyResult.success 
            ? `Successfully verified ${verifyResult.verified} users`
            : 'Verification completed with errors',
          data: {
            verified: verifyResult.verified,
            errors: verifyResult.errors,
          }
        });

      case 'demo':
        const demoCredentials = getDemoCredentials();
        
        return NextResponse.json({
          success: true,
          message: 'Demo credentials retrieved',
          data: demoCredentials,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: seed, clear, verify, or demo' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('❌ Seed API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get demo credentials for display
    const demoCredentials = getDemoCredentials();
    
    return NextResponse.json({
      success: true,
      message: 'Demo credentials available',
      data: {
        ...demoCredentials,
        instructions: {
          seed: 'POST /api/admin/seed-users with { "action": "seed" }',
          clear: 'POST /api/admin/seed-users with { "action": "clear" }',
          verify: 'POST /api/admin/seed-users with { "action": "verify" }',
          demo: 'POST /api/admin/seed-users with { "action": "demo" }',
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Seed API GET Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        success: false 
      },
      { status: 500 }
    );
  }
}

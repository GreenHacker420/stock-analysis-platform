import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Demo users data
    const demoUsers = [
      {
        email: 'sarah.johnson@stockanalyzer.com',
        name: 'Sarah Johnson',
        password: 'analyst123!',
        role: 'analyst',
        isActive: true,
        preferences: {
          riskTolerance: 'medium',
          investmentGoals: ['growth', 'income'],
          notifications: {
            email: true,
            push: true,
          },
        },
      },
      {
        email: 'john.doe@email.com',
        name: 'John Doe',
        password: 'investor123!',
        role: 'investor',
        isActive: true,
        preferences: {
          riskTolerance: 'medium',
          investmentGoals: ['retirement', 'growth'],
          notifications: {
            email: true,
            push: false,
          },
        },
      },
    ];

    const results = [];

    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        // Update existing user's password and ensure it's active
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        await User.findByIdAndUpdate(existingUser._id, {
          password: hashedPassword,
          isActive: true,
          role: userData.role,
          name: userData.name,
          preferences: userData.preferences,
          updatedAt: new Date(),
        });
        results.push({ email: userData.email, action: 'updated' });
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        await User.create({
          ...userData,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: null,
        });
        results.push({ email: userData.email, action: 'created' });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo users seeded successfully',
      results,
    });

  } catch (error) {
    console.error('Error seeding demo users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed demo users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    // Check if demo users exist
    const demoEmails = [
      'sarah.johnson@stockanalyzer.com',
      'john.doe@email.com',
    ];

    const existingUsers = await User.find({
      email: { $in: demoEmails }
    }).select('email name role isActive');

    return NextResponse.json({
      success: true,
      demoUsers: existingUsers,
      message: `Found ${existingUsers.length} demo users`,
    });

  } catch (error) {
    console.error('Error checking demo users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check demo users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

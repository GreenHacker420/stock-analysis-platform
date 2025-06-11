/**
 * Database Seeding Script for Mock Users
 * Seeds all mock users into the database for demo login functionality
 */

import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { mockUsers } from '@/data/mockUsers';

interface SeedResult {
  success: boolean;
  created: number;
  updated: number;
  errors: string[];
  users: any[];
}

/**
 * Hash all user passwords before storing in database
 */
async function hashUserPasswords() {
  const hashedUsers = await Promise.all(
    mockUsers.map(async (user) => {
      if (user.password) {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        return {
          ...user,
          password: hashedPassword,
          _id: undefined, // Remove _id to let MongoDB generate it
        };
      }
      return {
        ...user,
        _id: undefined,
      };
    })
  );
  
  return hashedUsers;
}

/**
 * Seed users into the database
 */
export async function seedUsers(): Promise<SeedResult> {
  const result: SeedResult = {
    success: false,
    created: 0,
    updated: 0,
    errors: [],
    users: [],
  };

  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');

    console.log('🔐 Hashing user passwords...');
    const hashedUsers = await hashUserPasswords();
    console.log(`✅ Hashed passwords for ${hashedUsers.length} users`);

    console.log('👥 Seeding users into database...');
    
    for (const userData of hashedUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          // Update existing user
          const updatedUser = await User.findOneAndUpdate(
            { email: userData.email },
            {
              $set: {
                name: userData.name,
                image: userData.image,
                role: userData.role,
                isActive: userData.isActive,
                preferences: userData.preferences,
                lastLogin: userData.lastLogin,
                updatedAt: new Date(),
              }
            },
            { new: true, runValidators: true }
          );
          
          result.updated++;
          result.users.push({
            action: 'updated',
            email: userData.email,
            name: userData.name,
            role: userData.role,
            id: updatedUser._id,
          });
          
          console.log(`🔄 Updated user: ${userData.email} (${userData.role})`);
        } else {
          // Create new user
          const newUser = new User({
            email: userData.email,
            name: userData.name,
            image: userData.image,
            role: userData.role,
            password: userData.password,
            isActive: userData.isActive,
            preferences: userData.preferences,
            lastLogin: userData.lastLogin,
            createdAt: new Date(userData.createdAt),
            updatedAt: new Date(userData.updatedAt),
          });
          
          const savedUser = await newUser.save();
          
          result.created++;
          result.users.push({
            action: 'created',
            email: userData.email,
            name: userData.name,
            role: userData.role,
            id: savedUser._id,
          });
          
          console.log(`✨ Created user: ${userData.email} (${userData.role})`);
        }
      } catch (userError: any) {
        const errorMsg = `Failed to process user ${userData.email}: ${userError.message}`;
        result.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    result.success = result.errors.length === 0;
    
    console.log('\n📊 Seeding Summary:');
    console.log(`✅ Created: ${result.created} users`);
    console.log(`🔄 Updated: ${result.updated} users`);
    console.log(`❌ Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n🚨 Errors encountered:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }

    return result;
    
  } catch (error: any) {
    const errorMsg = `Database seeding failed: ${error.message}`;
    result.errors.push(errorMsg);
    console.error(`💥 ${errorMsg}`);
    return result;
  }
}

/**
 * Clear all users from database (use with caution!)
 */
export async function clearUsers(): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    
    console.log('🗑️  Clearing all users from database...');
    const result = await User.deleteMany({});
    
    console.log(`✅ Deleted ${result.deletedCount} users`);
    
    return {
      success: true,
      deletedCount: result.deletedCount,
    };
  } catch (error: any) {
    const errorMsg = `Failed to clear users: ${error.message}`;
    console.error(`❌ ${errorMsg}`);
    return {
      success: false,
      deletedCount: 0,
      error: errorMsg,
    };
  }
}

/**
 * Verify seeded users can authenticate
 */
export async function verifyUsers(): Promise<{ success: boolean; verified: number; errors: string[] }> {
  const result = { success: false, verified: 0, errors: [] as string[] };
  
  try {
    console.log('🔍 Verifying seeded users...');
    await connectDB();
    
    for (const mockUser of mockUsers) {
      try {
        const dbUser = await User.findOne({ email: mockUser.email });
        
        if (!dbUser) {
          result.errors.push(`User not found: ${mockUser.email}`);
          continue;
        }
        
        if (mockUser.password && dbUser.password) {
          const isValidPassword = await bcrypt.compare(mockUser.password, dbUser.password);
          if (!isValidPassword) {
            result.errors.push(`Password mismatch for: ${mockUser.email}`);
            continue;
          }
        }
        
        result.verified++;
        console.log(`✅ Verified: ${mockUser.email}`);
        
      } catch (error: any) {
        result.errors.push(`Verification failed for ${mockUser.email}: ${error.message}`);
      }
    }
    
    result.success = result.errors.length === 0;
    
    console.log(`\n📊 Verification Summary:`);
    console.log(`✅ Verified: ${result.verified}/${mockUsers.length} users`);
    console.log(`❌ Errors: ${result.errors.length}`);
    
    return result;
    
  } catch (error: any) {
    result.errors.push(`Verification process failed: ${error.message}`);
    return result;
  }
}

/**
 * Get demo login credentials for testing
 */
export function getDemoCredentials() {
  const analysts = mockUsers.filter(u => u.role === 'analyst').slice(0, 3);
  const investors = mockUsers.filter(u => u.role === 'investor').slice(0, 3);
  
  console.log('\n🔐 Demo Login Credentials:');
  console.log('\n👨‍💼 ANALYSTS:');
  analysts.forEach(user => {
    console.log(`  📧 ${user.email}`);
    console.log(`  🔑 ${user.password}`);
    console.log(`  👤 ${user.name} (${user.preferences?.riskTolerance} risk)\n`);
  });
  
  console.log('💼 INVESTORS:');
  investors.forEach(user => {
    console.log(`  📧 ${user.email}`);
    console.log(`  🔑 ${user.password}`);
    console.log(`  👤 ${user.name} (${user.preferences?.riskTolerance} risk)\n`);
  });
  
  return { analysts, investors };
}

// CLI execution
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'seed':
      seedUsers()
        .then(result => {
          if (result.success) {
            console.log('\n🎉 User seeding completed successfully!');
            getDemoCredentials();
          } else {
            console.log('\n⚠️  User seeding completed with errors');
          }
          process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
          console.error('💥 Seeding failed:', error);
          process.exit(1);
        });
      break;
      
    case 'clear':
      clearUsers()
        .then(result => {
          if (result.success) {
            console.log('\n🗑️  Users cleared successfully!');
          } else {
            console.log('\n❌ Failed to clear users');
          }
          process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
          console.error('💥 Clear failed:', error);
          process.exit(1);
        });
      break;
      
    case 'verify':
      verifyUsers()
        .then(result => {
          if (result.success) {
            console.log('\n✅ All users verified successfully!');
          } else {
            console.log('\n⚠️  User verification completed with errors');
          }
          process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
          console.error('💥 Verification failed:', error);
          process.exit(1);
        });
      break;
      
    case 'demo':
      getDemoCredentials();
      process.exit(0);
      break;
      
    default:
      console.log(`
🌱 User Database Seeding Script

Usage:
  npm run seed:users seed    - Seed all mock users into database
  npm run seed:users clear   - Clear all users from database
  npm run seed:users verify  - Verify seeded users can authenticate
  npm run seed:users demo    - Show demo login credentials

Examples:
  npm run seed:users seed
  npm run seed:users demo
      `);
      process.exit(0);
  }
}

export default seedUsers;

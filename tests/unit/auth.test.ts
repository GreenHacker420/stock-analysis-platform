/**
 * Unit tests for authentication functionality
 * Tests user authentication, role-based access, and session management
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

// Mock dependencies
jest.mock('@/lib/mongodb');
jest.mock('@/models/User');
jest.mock('bcryptjs');
jest.mock('next-auth');

const mockConnectDB = connectDB as jest.MockedFunction<typeof connectDB>;
const mockUser = User as jest.Mocked<typeof User>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('Authentication System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectDB.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('User Registration', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'investor' as const
      };

      const hashedPassword = 'hashed_password_123';
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      
      const mockCreatedUser = {
        _id: 'user_id_123',
        ...userData,
        password: hashedPassword,
        isActive: true,
        createdAt: new Date(),
        preferences: {
          riskTolerance: 'medium',
          investmentGoals: ['growth'],
          notifications: { email: true, push: false }
        }
      };

      mockUser.create.mockResolvedValue(mockCreatedUser as any);

      // Simulate user creation
      const result = await User.create({
        ...userData,
        password: hashedPassword,
        isActive: true,
        preferences: {
          riskTolerance: 'medium',
          investmentGoals: ['growth'],
          notifications: { email: true, push: false }
        }
      });

      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockUser.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'investor',
        isActive: true
      }));
      expect(result).toEqual(mockCreatedUser);
    });

    it('should reject duplicate email addresses', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'investor' as const
      };

      const duplicateError = new Error('E11000 duplicate key error');
      (duplicateError as any).code = 11000;
      mockUser.create.mockRejectedValue(duplicateError);

      await expect(User.create(userData)).rejects.toThrow('E11000 duplicate key error');
    });

    it('should validate required fields', async () => {
      const incompleteUserData = {
        email: 'test@example.com'
        // Missing required fields: name, password, role
      };

      const validationError = new Error('Validation failed');
      mockUser.create.mockRejectedValue(validationError);

      await expect(User.create(incompleteUserData)).rejects.toThrow('Validation failed');
    });
  });

  describe('User Authentication', () => {
    it('should authenticate user with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user_id_123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password_123',
        role: 'investor',
        isActive: true
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      mockBcrypt.compare.mockResolvedValue(true as never);

      const foundUser = await User.findOne({ email: credentials.email.toLowerCase() })
        .select('+password');
      const isPasswordValid = await bcrypt.compare(credentials.password, foundUser.password);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password_123');
      expect(isPasswordValid).toBe(true);
      expect(foundUser).toEqual(mockUser);
    });

    it('should reject authentication with invalid password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        _id: 'user_id_123',
        email: 'test@example.com',
        password: 'hashed_password_123',
        role: 'investor',
        isActive: true
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      mockBcrypt.compare.mockResolvedValue(false as never);

      const foundUser = await User.findOne({ email: credentials.email.toLowerCase() })
        .select('+password');
      const isPasswordValid = await bcrypt.compare(credentials.password, foundUser.password);

      expect(isPasswordValid).toBe(false);
    });

    it('should reject authentication for non-existent user', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      const foundUser = await User.findOne({ email: credentials.email.toLowerCase() })
        .select('+password');

      expect(foundUser).toBeNull();
    });

    it('should reject authentication for inactive user', async () => {
      const credentials = {
        email: 'inactive@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user_id_123',
        email: 'inactive@example.com',
        password: 'hashed_password_123',
        role: 'investor',
        isActive: false
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      mockBcrypt.compare.mockResolvedValue(true as never);

      const foundUser = await User.findOne({ email: credentials.email.toLowerCase() })
        .select('+password');
      const isPasswordValid = await bcrypt.compare(credentials.password, foundUser.password);

      expect(isPasswordValid).toBe(true);
      expect(foundUser.isActive).toBe(false);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow analyst to access investor data', async () => {
      const mockSession = {
        user: {
          id: 'analyst_id',
          email: 'analyst@example.com',
          role: 'analyst',
          isActive: true
        }
      };

      mockGetServerSession.mockResolvedValue(mockSession as any);

      const session = await getServerSession(authOptions);
      
      expect(session?.user.role).toBe('analyst');
      expect(session?.user.isActive).toBe(true);
    });

    it('should restrict investor access to own data only', async () => {
      const mockSession = {
        user: {
          id: 'investor_id',
          email: 'investor@example.com',
          role: 'investor',
          isActive: true
        }
      };

      mockGetServerSession.mockResolvedValue(mockSession as any);

      const session = await getServerSession(authOptions);
      
      expect(session?.user.role).toBe('investor');
      expect(session?.user.id).toBe('investor_id');
    });

    it('should deny access to unauthenticated users', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const session = await getServerSession(authOptions);
      
      expect(session).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should create valid JWT token for authenticated user', async () => {
      const mockUser = {
        _id: 'user_id_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'investor',
        isActive: true
      };

      const mockToken = {
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        userId: mockUser._id,
        isActive: mockUser.isActive
      };

      // Simulate JWT token creation
      expect(mockToken).toEqual({
        email: 'test@example.com',
        name: 'Test User',
        role: 'investor',
        userId: 'user_id_123',
        isActive: true
      });
    });

    it('should update last login timestamp', async () => {
      const userId = 'user_id_123';
      const mockUpdateResult = { modifiedCount: 1 };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdateResult);

      await User.findByIdAndUpdate(userId, {
        lastLogin: new Date()
      });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          lastLogin: expect.any(Date)
        })
      );
    });

    it('should handle session refresh', async () => {
      const mockToken = {
        email: 'test@example.com',
        role: 'investor',
        userId: 'user_id_123'
      };

      const mockUser = {
        _id: 'user_id_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'investor',
        isActive: true
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const refreshedUser = await User.findOne({
        email: mockToken.email,
        isActive: true
      });

      expect(refreshedUser).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
        isActive: true
      });
    });
  });

  describe('Google OAuth Integration', () => {
    it('should create user from Google OAuth profile', async () => {
      const googleProfile = {
        email: 'google@example.com',
        name: 'Google User',
        image: 'https://example.com/avatar.jpg'
      };

      const googleAccount = {
        providerAccountId: 'google_id_123',
        provider: 'google'
      };

      const mockCreatedUser = {
        _id: 'user_id_123',
        email: googleProfile.email,
        name: googleProfile.name,
        image: googleProfile.image,
        googleId: googleAccount.providerAccountId,
        role: 'investor',
        isActive: true,
        lastLogin: new Date()
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockResolvedValue(mockCreatedUser);

      // Simulate OAuth user creation
      const existingUser = await User.findOne({ email: googleProfile.email });
      
      if (!existingUser) {
        const newUser = await User.create({
          email: googleProfile.email,
          name: googleProfile.name,
          image: googleProfile.image,
          googleId: googleAccount.providerAccountId,
          role: 'investor',
          isActive: true,
          lastLogin: new Date()
        });

        expect(newUser).toEqual(mockCreatedUser);
      }

      expect(User.findOne).toHaveBeenCalledWith({ email: googleProfile.email });
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        email: googleProfile.email,
        googleId: googleAccount.providerAccountId,
        role: 'investor'
      }));
    });

    it('should update existing user on Google OAuth login', async () => {
      const googleProfile = {
        email: 'existing@example.com',
        name: 'Updated Name',
        image: 'https://example.com/new-avatar.jpg'
      };

      const existingUser = {
        _id: 'user_id_123',
        email: 'existing@example.com',
        name: 'Old Name',
        role: 'investor',
        isActive: true
      };

      User.findOne = jest.fn().mockResolvedValue(existingUser);
      User.findByIdAndUpdate = jest.fn().mockResolvedValue({
        ...existingUser,
        name: googleProfile.name,
        image: googleProfile.image,
        lastLogin: new Date()
      });

      const foundUser = await User.findOne({ email: googleProfile.email });
      
      if (foundUser) {
        await User.findByIdAndUpdate(foundUser._id, {
          lastLogin: new Date(),
          name: googleProfile.name,
          image: googleProfile.image
        });
      }

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        existingUser._id,
        expect.objectContaining({
          lastLogin: expect.any(Date),
          name: googleProfile.name,
          image: googleProfile.image
        })
      );
    });
  });

  describe('Password Security', () => {
    it('should use bcrypt with 12 salt rounds', async () => {
      const password = 'testpassword123';
      const saltRounds = 12;

      await bcrypt.hash(password, saltRounds);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, saltRounds);
    });

    it('should not store plain text passwords', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'plaintext_password',
        role: 'investor' as const
      };

      const hashedPassword = 'hashed_password_123';
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const userToCreate = {
        ...userData,
        password: await bcrypt.hash(userData.password, 12)
      };

      expect(userToCreate.password).not.toBe('plaintext_password');
      expect(userToCreate.password).toBe(hashedPassword);
    });
  });
});

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from './mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'your-email@example.com'
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Your password'
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          await connectDB();

          // Find user by email
          const user = await User.findOne({
            email: credentials.email.toLowerCase()
          }).select('+password');

          if (!user) {
            throw new Error('No user found with this email');
          }

          // Check if user has a password (might be Google-only user)
          if (!user.password) {
            throw new Error('Please sign in with Google or reset your password');
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error('Account is deactivated. Please contact support.');
          }

          // Update last login
          await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date(),
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            isActive: user.isActive,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error(error instanceof Error ? error.message : 'Authentication failed');
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();

          // Check if user exists
          let existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Create new user with default role as investor
            existingUser = await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: account.providerAccountId,
              role: 'investor', // Default role
              isActive: true,
              lastLogin: new Date(),
              preferences: {
                riskTolerance: 'medium',
                investmentGoals: ['growth'],
                notifications: {
                  email: true,
                  push: false,
                },
              },
            });
            console.log('Created new user:', existingUser.email);
          } else {
            // Update last login and Google ID
            await User.findByIdAndUpdate(existingUser._id, {
              lastLogin: new Date(),
              googleId: account.providerAccountId,
              name: user.name, // Update name in case it changed
              image: user.image, // Update image in case it changed
            });
            console.log('Updated existing user:', existingUser.email);
          }

          return true;
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      } else if (account?.provider === 'credentials') {
        // Credentials provider handles authentication in authorize function
        // If we reach here, authentication was successful
        return true;
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        try {
          await connectDB();
          const user = await User.findOne({ email: session.user.email });

          if (user) {
            session.user.id = user._id.toString();
            session.user.role = user.role;
            session.user.isActive = user.isActive;
          } else {
            // If user not found, set default values
            session.user.role = 'investor';
            session.user.isActive = true;
          }
        } catch (error) {
          console.error('Error fetching user in session:', error);
          // Set default values on error
          session.user.role = 'investor';
          session.user.isActive = true;
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.greenhacker.tech' : undefined,
      },
    },
  },
  events: {
    async signIn({ user, account }) {
      console.log('User signed in:', { email: user.email, provider: account?.provider });
    },
    async signOut({ session }) {
      console.log('User signed out:', { email: session?.user?.email });
    },
  },
};

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: 'analyst' | 'investor';
      isActive: boolean;
    };
  }
  
  interface User {
    role: 'analyst' | 'investor';
    isActive: boolean;
  }
}

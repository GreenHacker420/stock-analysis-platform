import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  name: string;
  image?: string;
  role: 'analyst' | 'investor';
  googleId?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastLogin?: Date;
  preferences: {
    riskTolerance: 'low' | 'medium' | 'high';
    investmentGoals: string[];
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['analyst', 'investor'],
    required: true,
    default: 'investor',
  },
  googleId: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    default: null,
    select: false, // Don't include password in queries by default
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  preferences: {
    riskTolerance: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    investmentGoals: [{
      type: String,
    }],
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: false,
      },
    },
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

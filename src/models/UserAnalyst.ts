import mongoose, { Document, Schema } from 'mongoose';

export interface IUserAnalyst extends Document {
  _id: string;
  analystId: mongoose.Types.ObjectId;
  investorId: mongoose.Types.ObjectId;
  status: 'active' | 'inactive' | 'pending';
  assignedAt: Date;
  assignedBy: mongoose.Types.ObjectId;
  permissions: {
    canViewPortfolio: boolean;
    canGenerateReports: boolean;
    canModifyPortfolio: boolean;
    canCommunicate: boolean;
  };
  communicationPreferences: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'on-demand';
    methods: ('email' | 'platform' | 'phone')[];
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserAnalystSchema = new Schema<IUserAnalyst>({
  analystId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  investorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending',
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  permissions: {
    canViewPortfolio: {
      type: Boolean,
      default: true,
    },
    canGenerateReports: {
      type: Boolean,
      default: true,
    },
    canModifyPortfolio: {
      type: Boolean,
      default: false,
    },
    canCommunicate: {
      type: Boolean,
      default: true,
    },
  },
  communicationPreferences: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'on-demand'],
      default: 'weekly',
    },
    methods: [{
      type: String,
      enum: ['email', 'platform', 'phone'],
    }],
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Compound index to ensure unique analyst-investor relationships
UserAnalystSchema.index({ analystId: 1, investorId: 1 }, { unique: true });

// Additional indexes for better query performance
UserAnalystSchema.index({ analystId: 1, status: 1 });
UserAnalystSchema.index({ investorId: 1, status: 1 });
UserAnalystSchema.index({ assignedAt: -1 });

export default mongoose.models.UserAnalyst || mongoose.model<IUserAnalyst>('UserAnalyst', UserAnalystSchema);

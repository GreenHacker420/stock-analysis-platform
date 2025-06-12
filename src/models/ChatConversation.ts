import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    stocks?: string[];
    confidence?: number;
    analysisType?: string;
    tokens?: number;
  };
}

export interface IChatConversation extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IChatMessage[];
  isActive: boolean;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    totalMessages: number;
    totalTokens: number;
    averageConfidence: number;
    topicsDiscussed: string[];
  };
}

const ChatMessageSchema = new Schema<IChatMessage>({
  id: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    stocks: [String],
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    analysisType: {
      type: String,
      enum: [
        'portfolio_analysis',
        'risk_assessment', 
        'stock_recommendation',
        'market_analysis',
        'technical_analysis',
        'general_inquiry'
      ]
    },
    tokens: Number
  }
});

const ChatConversationSchema = new Schema<IChatConversation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  messages: [ChatMessageSchema],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalTokens: {
      type: Number,
      default: 0
    },
    averageConfidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    topicsDiscussed: [String]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ChatConversationSchema.index({ userId: 1, lastMessageAt: -1 });
ChatConversationSchema.index({ userId: 1, isActive: 1, lastMessageAt: -1 });

// Pre-save middleware to update metadata
ChatConversationSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    const messages = this.messages;
    
    // Update total messages
    if (!this.metadata) {
      this.metadata = {
        totalMessages: 0,
        totalTokens: 0,
        averageConfidence: 0,
        topicsDiscussed: []
      };
    }
    this.metadata.totalMessages = messages.length;
    
    // Calculate average confidence from assistant messages with confidence scores
    const assistantMessagesWithConfidence = messages.filter(
      (msg: IChatMessage) => msg.role === 'assistant' && msg.metadata?.confidence
    );
    
    if (assistantMessagesWithConfidence.length > 0) {
      const totalConfidence = assistantMessagesWithConfidence.reduce(
        (sum, msg) => sum + (msg.metadata?.confidence || 0), 0
      );
      this.metadata.averageConfidence = Math.round(
        totalConfidence / assistantMessagesWithConfidence.length
      );
    }
    
    // Extract topics discussed from analysis types
    const analysisTypes = messages
      .filter((msg: IChatMessage) => msg.metadata?.analysisType)
      .map((msg: IChatMessage) => msg.metadata!.analysisType!)
      .filter((type: string, index: number, arr: string[]) => arr.indexOf(type) === index); // Remove duplicates
    
    this.metadata.topicsDiscussed = analysisTypes;
    
    // Update last message timestamp
    if (messages.length > 0) {
      this.lastMessageAt = messages[messages.length - 1].timestamp;
    }
  }
  
  next();
});

// Static methods
ChatConversationSchema.statics.findActiveByUser = function(userId: string) {
  return this.find({ 
    userId, 
    isActive: true 
  }).sort({ lastMessageAt: -1 });
};

ChatConversationSchema.statics.findRecentByUser = function(userId: string, limit = 10) {
  return this.find({ 
    userId,
    isActive: true 
  })
  .sort({ lastMessageAt: -1 })
  .limit(limit)
  .select('title lastMessageAt metadata.totalMessages');
};

// Instance methods
ChatConversationSchema.methods.addMessage = function(message: Omit<IChatMessage, 'timestamp'>) {
  const newMessage: IChatMessage = {
    ...message,
    timestamp: new Date()
  };
  
  this.messages.push(newMessage);
  return this.save();
};

ChatConversationSchema.methods.generateTitle = function() {
  if (this.messages.length === 0) {
    this.title = 'New Conversation';
    return;
  }
  
  // Generate title from first user message
  const firstUserMessage = this.messages.find((msg: IChatMessage) => msg.role === 'user');
  if (firstUserMessage) {
    let title = firstUserMessage.content.substring(0, 50);
    if (firstUserMessage.content.length > 50) {
      title += '...';
    }
    this.title = title;
  } else {
    this.title = 'AI Conversation';
  }
};

ChatConversationSchema.methods.getLastMessages = function(count = 10) {
  return this.messages.slice(-count);
};

ChatConversationSchema.methods.getMessagesByType = function(analysisType: string) {
  return this.messages.filter(
    (msg: IChatMessage) => msg.metadata?.analysisType === analysisType
  );
};

// Export the model
const ChatConversation = mongoose.models.ChatConversation || 
  mongoose.model<IChatConversation>('ChatConversation', ChatConversationSchema);

export default ChatConversation;

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Portfolio from '@/models/Portfolio';
import User from '@/models/User';
import ChatConversation from '@/models/ChatConversation';
import { StockDataService } from '@/lib/stockData';
import { generateAIAnalysis } from '@/lib/geminiAI';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    stocks?: string[];
    confidence?: number;
    analysisType?: string;
  };
}

interface ChatRequest {
  message: string;
  conversationHistory: ChatMessage[];
  conversationId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ChatRequest = await request.json();
    const { message, conversationHistory, conversationId } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get user details
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find or create conversation
    let conversation;
    if (conversationId) {
      conversation = await ChatConversation.findOne({
        _id: conversationId,
        userId: user._id,
        isActive: true
      });
    }

    if (!conversation) {
      conversation = new ChatConversation({
        userId: user._id,
        title: 'New Conversation',
        messages: [],
        isActive: true
      });
    }

    // Add user message to conversation
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message.trim()
    };

    conversation.messages.push(userMessage);

    // Analyze the message to determine intent and extract relevant information
    const analysisContext = await buildAnalysisContext(message, user, conversation.messages);

    // Generate AI response using Gemini
    const aiResponse = await generateChatResponse(message, analysisContext, conversation.messages);

    // Add AI response to conversation
    const assistantMessage = {
      id: Date.now().toString() + '_ai',
      role: 'assistant' as const,
      content: aiResponse.content,
      metadata: aiResponse.metadata
    };

    conversation.messages.push(assistantMessage);

    // Generate title if this is a new conversation
    if (conversation.messages.length <= 2) {
      conversation.generateTitle();
    }

    // Save conversation
    await conversation.save();

    return NextResponse.json({
      success: true,
      response: aiResponse.content,
      metadata: aiResponse.metadata,
      conversationId: conversation._id
    });

  } catch (error) {
    console.error('Error in chat analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function buildAnalysisContext(message: string, user: any, conversationHistory: ChatMessage[]) {
  const context: any = {
    user: {
      name: user.name,
      role: user.role,
      riskTolerance: user.preferences?.riskTolerance || 'medium',
      investmentGoals: user.preferences?.investmentGoals || ['growth']
    },
    portfolios: [],
    marketData: null,
    conversationContext: conversationHistory.slice(-5) // Last 5 messages for context
  };

  // Check if message is asking about portfolios
  if (message.toLowerCase().includes('portfolio') || message.toLowerCase().includes('my investments')) {
    try {
      const portfolios = await Portfolio.find({ 
        investorId: user._id,
        isActive: true 
      }).populate('investorId');
      context.portfolios = portfolios;
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    }
  }

  // Check if message mentions specific stocks
  const stockMentions = extractStockSymbols(message);
  if (stockMentions.length > 0) {
    try {
      const stockService = StockDataService.getInstance();
      const stockData = await Promise.all(
        stockMentions.map(symbol => stockService.getQuote(symbol))
      );
      context.marketData = stockData.filter(data => data !== null);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  }

  return context;
}

async function generateChatResponse(message: string, context: any, conversationHistory: ChatMessage[]) {
  // Build a comprehensive prompt for the AI
  const prompt = buildChatPrompt(message, context, conversationHistory);
  
  try {
    const aiResponse = await generateAIAnalysis(prompt);
    
    // Determine analysis type and confidence based on the message content
    const metadata = {
      analysisType: determineAnalysisType(message),
      confidence: calculateConfidence(message, context),
      stocks: context.marketData ? context.marketData.map((stock: any) => stock.symbol) : undefined
    };

    return {
      content: aiResponse,
      metadata
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      content: "I apologize, but I'm having trouble processing your request right now. Please try rephrasing your question or contact support if the issue persists.",
      metadata: {
        analysisType: 'error',
        confidence: 0
      }
    };
  }
}

function buildChatPrompt(message: string, context: any, conversationHistory: ChatMessage[]): string {
  let prompt = `You are an expert financial advisor and stock analyst. You're having a conversation with ${context.user.name}, a ${context.user.role} with ${context.user.riskTolerance} risk tolerance.

CONVERSATION CONTEXT:
`;

  // Add conversation history for context
  if (conversationHistory.length > 0) {
    prompt += "Recent conversation:\n";
    conversationHistory.forEach(msg => {
      prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    prompt += "\n";
  }

  prompt += `CURRENT USER QUESTION: "${message}"

USER PROFILE:
- Name: ${context.user.name}
- Role: ${context.user.role}
- Risk Tolerance: ${context.user.riskTolerance}
- Investment Goals: ${context.user.investmentGoals.join(', ')}
`;

  // Add portfolio information if available
  if (context.portfolios && context.portfolios.length > 0) {
    prompt += `\nUSER'S PORTFOLIOS:`;
    context.portfolios.forEach((portfolio: any, index: number) => {
      prompt += `\nPortfolio ${index + 1}: ${portfolio.name}
- Total Value: ₹${portfolio.totalValue?.toLocaleString('en-IN') || 'N/A'}
- Holdings: ${portfolio.holdings?.length || 0} stocks
- Performance: ${portfolio.totalGainLoss > 0 ? '+' : ''}${portfolio.totalGainLoss?.toFixed(2) || 'N/A'}%`;
    });
  }

  // Add market data if available
  if (context.marketData && context.marketData.length > 0) {
    prompt += `\nRELEVANT STOCK DATA:`;
    context.marketData.forEach((stock: any) => {
      prompt += `\n${stock.symbol}: ₹${stock.price} (${stock.change > 0 ? '+' : ''}${stock.changePercent?.toFixed(2)}%)`;
    });
  }

  prompt += `\n\nINSTRUCTIONS:
1. Provide a helpful, conversational response to the user's question
2. Use Indian market context and INR currency formatting
3. Be specific and actionable in your advice
4. Consider the user's risk tolerance and investment goals
5. If discussing stocks, mention current prices and trends
6. Keep the tone professional but friendly
7. If you need more information, ask clarifying questions
8. Format numbers in Indian style (Lakhs, Crores)

FORMATTING GUIDELINES:
- Use markdown formatting for better readability
- Use **bold** for important points, stock names, and financial figures
- Use bullet points (•) for lists and recommendations
- Use tables for financial data comparison
- Use > blockquotes for important warnings or key insights
- Use \`code formatting\` for stock symbols and technical terms
- Structure your response with clear headers (##, ###) when appropriate
- Use --- for section breaks when needed

EXAMPLES OF GOOD FORMATTING:
- Stock symbols: \`RELIANCE.NSE\`, \`TCS.NSE\`
- Currency: **₹2,500**, **₹10.5 Lakhs**
- Percentages: **+5.2%**, **-2.1%**
- Important points: **Strong Buy**, **High Risk**, **Diversify Now**

Please provide a comprehensive, well-formatted response to the user's question:`;

  return prompt;
}

function extractStockSymbols(message: string): string[] {
  // Simple regex to extract potential stock symbols
  // This could be enhanced with a more sophisticated NLP approach
  const symbols: string[] = [];
  
  // Common Indian stock patterns
  const indianStockPattern = /\b([A-Z]{2,10})(\.NSE|\.BSE)?\b/g;
  let match;
  
  while ((match = indianStockPattern.exec(message.toUpperCase())) !== null) {
    const symbol = match[1];
    // Add .NSE suffix if not present
    const fullSymbol = match[2] ? match[0] : `${symbol}.NSE`;
    if (!symbols.includes(fullSymbol)) {
      symbols.push(fullSymbol);
    }
  }

  // Also check for common Indian stock names
  const commonStocks = [
    'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'BHARTIARTL',
    'ITC', 'HINDUNILVR', 'LT', 'KOTAKBANK', 'ASIANPAINT', 'MARUTI', 'BAJFINANCE'
  ];

  commonStocks.forEach(stock => {
    if (message.toUpperCase().includes(stock)) {
      const fullSymbol = `${stock}.NSE`;
      if (!symbols.includes(fullSymbol)) {
        symbols.push(fullSymbol);
      }
    }
  });

  return symbols.slice(0, 5); // Limit to 5 stocks to avoid API overload
}

function determineAnalysisType(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('portfolio') || lowerMessage.includes('my investments')) {
    return 'portfolio_analysis';
  } else if (lowerMessage.includes('risk') || lowerMessage.includes('diversif')) {
    return 'risk_assessment';
  } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return 'stock_recommendation';
  } else if (lowerMessage.includes('market') || lowerMessage.includes('trend')) {
    return 'market_analysis';
  } else if (lowerMessage.includes('technical') || lowerMessage.includes('chart')) {
    return 'technical_analysis';
  } else {
    return 'general_inquiry';
  }
}

function calculateConfidence(message: string, context: any): number {
  let confidence = 70; // Base confidence
  
  // Increase confidence if we have relevant data
  if (context.portfolios && context.portfolios.length > 0) {
    confidence += 15;
  }
  
  if (context.marketData && context.marketData.length > 0) {
    confidence += 10;
  }
  
  // Adjust based on message specificity
  if (message.length > 50) {
    confidence += 5; // More detailed questions get higher confidence
  }
  
  return Math.min(confidence, 95); // Cap at 95%
}

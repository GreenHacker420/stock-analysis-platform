import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';
import ChatPage from '@/app/chat/page';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock the dependencies
jest.mock('next-auth/react');
jest.mock('next/navigation');
jest.mock('@/components/layout/Navigation', () => {
  return function MockNavigation() {
    return <div data-testid="navigation">Navigation</div>;
  };
});

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

// Mock fetch
global.fetch = jest.fn();

const mockPush = jest.fn();
const mockReplace = jest.fn();

describe('ChatPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    });

    // Mock successful fetch responses
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/chat/conversations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            conversations: [
              {
                _id: 'conv1',
                title: 'Stock Discussion',
                lastMessageAt: new Date(),
                metadata: { totalMessages: 5 }
              }
            ]
          })
        });
      }
      
      if (url.includes('/api/chat/analyze')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            response: 'This is an AI response about your stock question.',
            metadata: {
              analysisType: 'general_inquiry',
              confidence: 85
            },
            conversationId: 'new-conv-id'
          })
        });
      }
      
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' })
      });
    });
  });

  const renderChatPage = (sessionData = null) => {
    mockUseSession.mockReturnValue({
      data: sessionData,
      status: sessionData ? 'authenticated' : 'unauthenticated'
    });

    return render(
      <ThemeProvider>
        <ChatPage />
      </ThemeProvider>
    );
  };

  it('should redirect to signin when not authenticated', () => {
    renderChatPage(null);
    
    expect(mockReplace).toHaveBeenCalledWith('/auth/signin');
  });

  it('should render chat interface when authenticated', async () => {
    const sessionData = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'investor'
      }
    };

    renderChatPage(sessionData);

    await waitFor(() => {
      expect(screen.getByText('AI Stock Analysis Chat')).toBeInTheDocument();
      expect(screen.getByText('Get personalized investment insights powered by AI')).toBeInTheDocument();
    });
  });

  it('should display welcome message for new users', async () => {
    const sessionData = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'investor'
      }
    };

    renderChatPage(sessionData);

    await waitFor(() => {
      expect(screen.getByText(/Hello Test User! 👋/)).toBeInTheDocument();
      expect(screen.getByText(/Portfolio analysis and recommendations/)).toBeInTheDocument();
    });
  });

  it('should display quick action buttons', async () => {
    const sessionData = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'investor'
      }
    };

    renderChatPage(sessionData);

    await waitFor(() => {
      expect(screen.getByText('Analyze My Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Market Trends')).toBeInTheDocument();
      expect(screen.getByText('Stock Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
    });
  });

  it('should handle sending a message', async () => {
    const sessionData = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'investor'
      }
    };

    renderChatPage(sessionData);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask me about stocks/)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Ask me about stocks/);
    const sendButton = screen.getByRole('button', { name: '' }); // Send button with icon

    // Type a message
    fireEvent.change(input, { target: { value: 'What stocks should I buy?' } });
    expect(input).toHaveValue('What stocks should I buy?');

    // Send the message
    fireEvent.click(sendButton);

    // Check that the message appears in the chat
    await waitFor(() => {
      expect(screen.getByText('What stocks should I buy?')).toBeInTheDocument();
    });

    // Check that AI response appears
    await waitFor(() => {
      expect(screen.getByText('This is an AI response about your stock question.')).toBeInTheDocument();
    });

    // Check that input is cleared
    expect(input).toHaveValue('');
  });

  it('should handle quick action clicks', async () => {
    const sessionData = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'investor'
      }
    };

    renderChatPage(sessionData);

    await waitFor(() => {
      expect(screen.getByText('Analyze My Portfolio')).toBeInTheDocument();
    });

    const portfolioButton = screen.getByText('Analyze My Portfolio');
    fireEvent.click(portfolioButton);

    // Check that the quick action message appears
    await waitFor(() => {
      expect(screen.getByText('Please analyze my current portfolio and provide investment recommendations.')).toBeInTheDocument();
    });

    // Check that AI response appears
    await waitFor(() => {
      expect(screen.getByText('This is an AI response about your stock question.')).toBeInTheDocument();
    });
  });

  it('should handle Enter key press to send message', async () => {
    const sessionData = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'investor'
      }
    };

    renderChatPage(sessionData);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask me about stocks/)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Ask me about stocks/);

    // Type a message
    fireEvent.change(input, { target: { value: 'Tell me about market trends' } });

    // Press Enter
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    // Check that the message appears in the chat
    await waitFor(() => {
      expect(screen.getByText('Tell me about market trends')).toBeInTheDocument();
    });
  });

  it('should show loading state while processing message', async () => {
    // Mock a delayed response
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/chat/analyze')) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                response: 'Delayed AI response',
                metadata: { analysisType: 'general_inquiry', confidence: 85 }
              })
            });
          }, 100);
        });
      }
      return Promise.resolve({ ok: false });
    });

    const sessionData = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'investor'
      }
    };

    renderChatPage(sessionData);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask me about stocks/)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Ask me about stocks/);
    const sendButton = screen.getByRole('button', { name: '' });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    // Check for loading state
    await waitFor(() => {
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    });

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText('Delayed AI response')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should handle API errors gracefully', async () => {
    // Mock failed API response
    (global.fetch as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' })
      });
    });

    const sessionData = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'investor'
      }
    };

    renderChatPage(sessionData);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask me about stocks/)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Ask me about stocks/);
    const sendButton = screen.getByRole('button', { name: '' });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/I apologize, but I encountered an error/)).toBeInTheDocument();
    });
  });

  it('should disable send button when input is empty', async () => {
    const sessionData = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'investor'
      }
    };

    renderChatPage(sessionData);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask me about stocks/)).toBeInTheDocument();
    });

    const sendButton = screen.getByRole('button', { name: '' });
    
    // Button should be disabled when input is empty
    expect(sendButton).toBeDisabled();

    const input = screen.getByPlaceholderText(/Ask me about stocks/);
    fireEvent.change(input, { target: { value: 'Test message' } });

    // Button should be enabled when input has content
    expect(sendButton).not.toBeDisabled();
  });

  it('should show conversation sidebar on desktop', async () => {
    const sessionData = {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'investor'
      }
    };

    renderChatPage(sessionData);

    await waitFor(() => {
      expect(screen.getByText('New Chat')).toBeInTheDocument();
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });
  });
});

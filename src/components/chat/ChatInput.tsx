'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  StopIcon,
  DocumentIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInput({ 
  onSendMessage, 
  isLoading, 
  placeholder = "Ask me about stocks, portfolios, or market analysis...",
  disabled = false 
}: ChatInputProps) {
  const { isDark } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Smart suggestions based on input
  useEffect(() => {
    if (inputValue.length > 2) {
      const newSuggestions = generateSuggestions(inputValue);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue]);

  const generateSuggestions = (input: string): string[] => {
    const lowerInput = input.toLowerCase();
    const suggestions: string[] = [];

    // Stock-related suggestions
    if (lowerInput.includes('stock') || lowerInput.includes('share')) {
      suggestions.push(
        'What are the best stocks to buy right now?',
        'Analyze RELIANCE stock performance',
        'Compare TCS vs INFY stocks'
      );
    }

    // Portfolio suggestions
    if (lowerInput.includes('portfolio') || lowerInput.includes('investment')) {
      suggestions.push(
        'Analyze my portfolio performance',
        'How should I diversify my portfolio?',
        'What is my portfolio risk level?'
      );
    }

    // Market suggestions
    if (lowerInput.includes('market') || lowerInput.includes('trend')) {
      suggestions.push(
        'What are the current market trends?',
        'How is the Indian stock market performing?',
        'What sectors are performing well?'
      );
    }

    // Risk suggestions
    if (lowerInput.includes('risk') || lowerInput.includes('safe')) {
      suggestions.push(
        'What are low-risk investment options?',
        'How can I reduce my investment risk?',
        'Assess my portfolio risk'
      );
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  };

  const handleSend = () => {
    if (!inputValue.trim() || isLoading || disabled) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // Here you would typically send the audio to a speech-to-text service
        console.log('Audio recorded:', audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload (e.g., portfolio CSV, financial documents)
      console.log('File uploaded:', file);
      // You would typically process the file and extract relevant information
    }
  };

  return (
    <div className="relative">
      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className={`absolute bottom-full left-0 right-0 mb-3 rounded-xl border shadow-xl backdrop-blur-sm ${
          isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'
        }`}>
          <div className="p-4">
            <p className={`text-xs font-semibold mb-3 flex items-center ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Suggestions
            </p>
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left p-3 text-sm rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                    isDark
                      ? 'hover:bg-gray-700 text-gray-300 border border-transparent hover:border-gray-600'
                      : 'hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-200'
                  }`}
                >
                  <span className="block font-medium">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className={`flex items-end space-x-4 p-5 rounded-2xl border-2 transition-all duration-200 shadow-lg ${
        isDark
          ? 'bg-gray-800 border-gray-700 focus-within:border-blue-500 focus-within:shadow-blue-500/20'
          : 'bg-white border-gray-200 focus-within:border-blue-400 focus-within:shadow-blue-400/20'
      }`}>
        {/* File Upload */}
        <div className="flex-shrink-0">
          <label className={`cursor-pointer p-2.5 rounded-xl transition-all duration-200 hover:scale-105 ${
            isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-600'
          } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <DocumentIcon className="w-5 h-5" />
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.pdf,.txt"
              onChange={handleFileUpload}
              disabled={disabled || isLoading}
            />
          </label>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className={`w-full resize-none border-0 focus:ring-0 focus:outline-none bg-transparent text-base leading-relaxed ${
              isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
            } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ maxHeight: '120px', minHeight: '24px' }}
          />
        </div>

        {/* Voice Recording */}
        <div className="flex-shrink-0">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isLoading}
            className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-105 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                : isDark
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-600'
            } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? (
              <StopIcon className="w-5 h-5" />
            ) : (
              <MicrophoneIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Send Button */}
        <div className="flex-shrink-0">
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading || disabled}
            className={`p-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
              !inputValue.trim() || isLoading || disabled
                ? isDark
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
            }`}
          >
            {isLoading ? (
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Input Tips */}
      <div className={`mt-4 px-2 text-xs ${
        isDark ? 'text-gray-500' : 'text-gray-400'
      }`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            <span>Try: "Analyze my portfolio" or "Market trends today"</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span>Enter to send • Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}

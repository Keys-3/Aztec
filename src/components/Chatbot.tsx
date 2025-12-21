import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Bot, User, Lightbulb, Droplets, Thermometer, Leaf, AlertCircle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI farming assistant powered by Google Gemini. I can help you with hydroponic growing tips, troubleshooting, and optimizing your yields. What would you like to know?",
      isBot: true,
      timestamp: new Date(),
      suggestions: [
        "How to optimize nutrient levels?",
        "My plants are wilting, what should I do?",
        "Best pH levels for lettuce?",
        "How to increase yield?"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const genAIRef = useRef<GoogleGenerativeAI | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your-gemini-api-key-here') {
      try {
        genAIRef.current = new GoogleGenerativeAI(apiKey);
      } catch (err) {
        console.error('Failed to initialize Gemini:', err);
        setError('Failed to initialize AI assistant');
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage: string): Promise<{ text: string; suggestions?: string[] }> => {
    const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      return {
        text: "Please configure your Google Gemini API key in the .env file to enable AI chat. You can get a free API key from https://makersuite.google.com/app/apikey",
        suggestions: ["How to get Gemini API key?"]
      };
    }

    try {
      if (!genAIRef.current) {
        genAIRef.current = new GoogleGenerativeAI(apiKey);
      }

      const model = genAIRef.current.getGenerativeModel({ model: "gemini-pro" });

      const systemPrompt = `You are an expert hydroponic farming assistant. You help farmers with:
- Plant health diagnosis and troubleshooting
- Nutrient management (EC levels, NPK ratios, micronutrients)
- pH levels and water quality
- Lighting requirements and schedules
- Temperature and humidity control
- Pest and disease management
- Crop-specific growing tips for lettuce, tomatoes, herbs, etc.
- System maintenance and optimization

Provide practical, actionable advice. Be concise but thorough. Use bullet points when appropriate.
Always be encouraging and supportive to help farmers succeed.`;

      const prompt = `${systemPrompt}\n\nUser question: ${userMessage}\n\nProvide a helpful response:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const suggestions = [
        "Tell me more about this",
        "What else should I know?",
        "How can I implement this?"
      ];

      return { text, suggestions };
    } catch (err: any) {
      console.error('Gemini API error:', err);
      return {
        text: `I apologize, but I encountered an error: ${err.message || 'Unable to connect to AI service'}. Please try again or check your API key configuration.`,
        suggestions: ["Try asking something else"]
      };
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setError(null);

    try {
      const botResponse = await getAIResponse(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        isBot: true,
        timestamp: new Date(),
        suggestions: botResponse.suggestions
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      setError(err.message || 'Failed to get response');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">AI Farm Assistant</h3>
            <p className="text-xs text-emerald-100">Powered by Google Gemini</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] ${message.isBot ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start space-x-2 ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isBot ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {message.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`rounded-2xl px-4 py-2 ${
                  message.isBot
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-emerald-600 text-white'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {message.suggestions && (
                <div className="mt-3 space-y-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-200 transition-colors"
                    >
                      <Lightbulb className="h-3 w-3 inline mr-2" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about growing tips, plant problems, or optimization..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => handleSuggestionClick("My plants look unhealthy")}
            className="flex items-center space-x-1 text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full hover:bg-red-100 transition-colors"
          >
            <Leaf className="h-3 w-3" />
            <span>Plant Issues</span>
          </button>
          <button
            onClick={() => handleSuggestionClick("How to optimize nutrients?")}
            className="flex items-center space-x-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
          >
            <Droplets className="h-3 w-3" />
            <span>Nutrients</span>
          </button>
          <button
            onClick={() => handleSuggestionClick("Temperature problems")}
            className="flex items-center space-x-1 text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full hover:bg-amber-100 transition-colors"
          >
            <Thermometer className="h-3 w-3" />
            <span>Environment</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Bot, User, Lightbulb, Droplets, Thermometer, Leaf } from 'lucide-react';

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
      text: "Hello! I'm your AI farming assistant. I can help you with hydroponic growing tips, troubleshooting, and optimizing your yields. What would you like to know?",
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

    // Default suggestions for UI
    const defaultSuggestions = [
      "Help with plant nutrition",
      "Troubleshoot plant problems",
      "Optimize growing conditions",
      "System maintenance tips"
    ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const lowercaseText = text.toLowerCase();
      let response = "I'm sorry, I don't understand. Could you please rephrase your question?";
      let suggestions: string[] = [];

      if (lowercaseText.includes('hello') || lowercaseText.includes('hi')) {
        response = "Hello! How can I help you with your hydroponic system today?";
      } else if (lowercaseText.includes('nutrient') || lowercaseText.includes('ph')) {
        response = "For optimal growth, maintain a pH between 5.5 and 6.5. Monitor EC levels daily to ensure your plants are getting enough nutrients.";
        suggestions = ["How to measure EC?", "Best pH for lettuce?"];
      } else if (lowercaseText.includes('yellow') || lowercaseText.includes('wilting')) {
        response = "Yellowing or wilting leaves can indicate nutrient deficiency, root rot, or improper pH. Check your water temperature and oxygenation levels.";
        suggestions = ["How to fix root rot?", "Ideal water temperature?"];
      } else if (lowercaseText.includes('yield') || lowercaseText.includes('grow')) {
        response = "To maximize yield, ensure proper lighting cycles (usually 14-16 hours for most plants), maintain optimal temperature and humidity, and keep your nutrient solution balanced.";
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
        timestamp: new Date(),
        suggestions: suggestions.length > 0 ? suggestions : defaultSuggestions
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">AI Farm Assistant</h3>
            <p className="text-xs text-emerald-100">Powered by Gemini</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
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
              
              {/* Suggestions */}
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
        
        {/* Typing indicator */}
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
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
        
        {/* Quick actions */}
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
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

  const getBotResponse = (userMessage: string): { text: string; suggestions?: string[] } => {
    const message = userMessage.toLowerCase();
    
    // Nutrient-related queries.
    if (message.includes('nutrient') || message.includes('fertilizer') || message.includes('feeding')) {
      return {
        text: "For optimal nutrient management:\n\n• **EC Levels**: Maintain 1.2-2.0 mS/cm for most crops\n• **NPK Ratio**: Use 3-1-2 ratio for leafy greens, 1-3-2 for fruiting plants\n• **Micronutrients**: Ensure adequate iron, calcium, and magnesium\n• **Change Schedule**: Replace nutrient solution every 1-2 weeks\n\nMonitor your plants daily for signs of deficiency or excess!",
        suggestions: ["What are signs of nutrient deficiency?", "How often should I change nutrients?", "Best nutrients for tomatoes?"]
      };
    }
    
    // pH-related queries.
    if (message.includes('ph') || message.includes('acid') || message.includes('alkaline')) {
      return {
        text: "pH is crucial for nutrient uptake:\n\n• **Optimal Range**: 5.5-6.5 for most hydroponic crops\n• **Leafy Greens**: 6.0-7.0\n• **Tomatoes/Peppers**: 5.5-6.0\n• **Herbs**: 5.5-6.5\n\n**Adjustment Tips**:\n• Use pH Down (phosphoric acid) to lower\n• Use pH Up (potassium hydroxide) to raise\n• Check pH daily, adjust gradually",
        suggestions: ["How to lower pH naturally?", "Why does pH keep changing?", "Best pH for herbs?"]
      };
    }
    
    // Wilting/plant health issues
    if (message.includes('wilt') || message.includes('dying') || message.includes('sick') || message.includes('problem')) {
      return {
        text: "Plant wilting can have several causes:\n\n**Common Issues**:\n• **Overwatering**: Check for root rot, ensure proper drainage\n• **Underwatering**: Verify pump function and water levels\n• **Nutrient Burn**: High EC levels, dilute solution\n• **pH Imbalance**: Test and adjust to optimal range\n• **Temperature Stress**: Keep water temp 65-75°F\n• **Light Burn**: Adjust LED distance/intensity\n\nCheck these factors systematically!",
        suggestions: ["How to check for root rot?", "What's the ideal water temperature?", "Signs of nutrient burn?"]
      };
    }
    
    // Yield optimization
    if (message.includes('yield') || message.includes('production') || message.includes('harvest') || message.includes('grow more')) {
      return {
        text: "To maximize your hydroponic yields:\n\n**Environmental Control**:\n• Maintain 65-75°F temperature\n• Keep humidity at 50-70%\n• Provide 14-16 hours of light daily\n\n**Nutrition**:\n• Use quality hydroponic nutrients\n• Monitor EC and pH daily\n• Supplement with CalMag if needed\n\n**Plant Care**:\n• Prune regularly for better airflow\n• Support heavy fruiting plants\n• Harvest at peak ripeness",
        suggestions: ["Best lighting schedule?", "How to prune tomatoes?", "When to harvest lettuce?"]
      };
    }
    
    // Lighting queries
    if (message.includes('light') || message.includes('led') || message.includes('lamp')) {
      return {
        text: "Proper lighting is essential:\n\n**LED Recommendations**:\n• **Leafy Greens**: 25-35 watts per sq ft\n• **Fruiting Plants**: 35-50 watts per sq ft\n• **Distance**: 12-24 inches from canopy\n\n**Light Schedule**:\n• **Leafy Greens**: 14-16 hours daily\n• **Fruiting Plants**: 12-14 hours daily\n• **Seedlings**: 16-18 hours daily\n\n**Spectrum**: Full spectrum LEDs work best, with emphasis on blue (vegetative) and red (flowering) light.",
        suggestions: ["Best LED brands?", "How high should lights be?", "Light schedule for herbs?"]
      };
    }
    
    // Temperature queries
    if (message.includes('temperature') || message.includes('heat') || message.includes('cold') || message.includes('temp')) {
      return {
        text: "Temperature control is vital:\n\n**Optimal Ranges**:\n• **Air Temperature**: 65-75°F (18-24°C)\n• **Water Temperature**: 65-72°F (18-22°C)\n• **Night Temperature**: 5-10°F cooler than day\n\n**Temperature Issues**:\n• **Too Hot**: Increases metabolism, reduces oxygen\n• **Too Cold**: Slows growth, increases disease risk\n\n**Solutions**: Use fans, heaters, chillers, or insulation as needed.",
        suggestions: ["How to cool water temperature?", "Best fans for ventilation?", "Winter growing tips?"]
      };
    }
    
    // Pest and disease queries
    if (message.includes('pest') || message.includes('bug') || message.includes('disease') || message.includes('mold')) {
      return {
        text: "Pest and disease prevention:\n\n**Common Hydroponic Pests**:\n• **Aphids**: Use beneficial insects or neem oil\n• **Spider Mites**: Increase humidity, use predatory mites\n• **Fungus Gnats**: Reduce moisture, use yellow sticky traps\n\n**Disease Prevention**:\n• Maintain proper air circulation\n• Keep humidity below 70%\n• Use sterile growing media\n• Clean system regularly\n\n**Organic Solutions**: Neem oil, beneficial bacteria, companion planting",
        suggestions: ["How to identify spider mites?", "Organic pest control methods?", "Preventing root rot?"]
      };
    }
    
    // System maintenance
    if (message.includes('clean') || message.includes('maintenance') || message.includes('system')) {
      return {
        text: "Regular maintenance ensures healthy crops:\n\n**Weekly Tasks**:\n• Check and adjust pH/EC levels\n• Top off water reservoir\n• Inspect plants for pests/diseases\n• Clean air stones and pumps\n\n**Monthly Tasks**:\n• Complete nutrient solution change\n• Clean reservoir and lines\n• Calibrate pH/EC meters\n• Replace air stones if needed\n\n**Quarterly Tasks**:\n• Deep clean entire system\n• Replace tubing and fittings\n• Service pumps and equipment",
        suggestions: ["How to clean reservoir?", "When to replace air stones?", "Calibrating pH meters?"]
      };
    }
    
    // Specific crop queries
    if (message.includes('lettuce') || message.includes('leafy')) {
      return {
        text: "Growing lettuce hydroponically:\n\n**Optimal Conditions**:\n• pH: 6.0-7.0\n• EC: 1.2-1.8 mS/cm\n• Temperature: 60-70°F\n• Light: 14-16 hours daily\n\n**Varieties**: Butterhead, romaine, and leaf lettuce work best\n**Harvest**: 30-45 days from seed\n**Spacing**: 6-8 inches apart\n\n**Pro Tip**: Harvest outer leaves first for continuous production!",
        suggestions: ["Best lettuce varieties?", "Lettuce growing timeline?", "Preventing lettuce bolting?"]
      };
    }
    
    if (message.includes('tomato') || message.includes('tomatoes')) {
      return {
        text: "Growing tomatoes hydroponically:\n\n**Optimal Conditions**:\n• pH: 5.5-6.0\n• EC: 2.0-3.0 mS/cm\n• Temperature: 70-75°F day, 65-70°F night\n• Light: 12-14 hours daily\n\n**Support**: Use stakes or trellises\n**Pruning**: Remove suckers and lower leaves\n**Pollination**: Hand pollinate or use fans\n\n**Harvest**: 70-85 days from seed, pick when fully colored but firm",
        suggestions: ["How to prune tomatoes?", "Hand pollination techniques?", "Best tomato varieties for hydroponics?"]
      };
    }
    
    if (message.includes('herb') || message.includes('basil') || message.includes('cilantro')) {
      return {
        text: "Growing herbs hydroponically:\n\n**Optimal Conditions**:\n• pH: 5.5-6.5\n• EC: 1.2-1.6 mS/cm\n• Temperature: 65-75°F\n• Light: 14-16 hours daily\n\n**Popular Herbs**: Basil, cilantro, parsley, mint, oregano\n**Harvest**: Pinch regularly to encourage growth\n**Spacing**: 4-6 inches apart\n\n**Pro Tip**: Harvest in the morning for best flavor and essential oil content!",
        suggestions: ["Best herbs for beginners?", "How to harvest basil?", "Preventing herbs from flowering?"]
      };
    }
    
    // Default response
    return {
      text: "I'd be happy to help you with that! I can assist with:\n\n• **Plant Health**: Diagnosing issues and solutions\n• **Nutrition**: Optimal feeding schedules and ratios\n• **Environment**: Temperature, humidity, and lighting\n• **Pest Control**: Organic and integrated pest management\n• **Crop-Specific**: Growing tips for different vegetables and herbs\n• **System Maintenance**: Keeping your setup running smoothly\n\nWhat specific aspect would you like to know more about?",
      suggestions: [
        "Help with plant nutrition",
        "Troubleshoot plant problems",
        "Optimize growing conditions",
        "System maintenance tips"
      ]
    };
  };

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

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        isBot: true,
        timestamp: new Date(),
        suggestions: botResponse.suggestions
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
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
            <p className="text-xs text-emerald-100">Online • Ready to help</p>
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
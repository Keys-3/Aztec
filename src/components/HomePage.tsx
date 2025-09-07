import React, { useState } from 'react';
import { Droplets, Leaf, TrendingUp, Award, Star, Send, CheckCircle, ChevronLeft, ChevronRight, Coins, Shield, Globe } from 'lucide-react';

const HomePage: React.FC = () => {
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hydroponicImages = [
    {
      url: 'https://images.pexels.com/photos/4463893/pexels-photo-4463893.jpeg',
      title: 'Advanced Hydroponic Growing System',
      description: 'State-of-the-art vertical farming with precision nutrient delivery'
    },
    {
      url: 'https://images.pexels.com/photos/4022092/pexels-photo-4022092.jpeg',
      title: 'Smart Greenhouse Technology',
      description: 'Climate-controlled environment with automated monitoring systems'
    },
    {
      url: 'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg',
      title: 'Sustainable Urban Farming',
      description: 'Maximizing yield in minimal space with eco-friendly practices'
    },
    {
      url: 'https://images.pexels.com/photos/4503270/pexels-photo-4503270.jpeg',
      title: 'Precision Agriculture',
      description: 'Data-driven farming with real-time monitoring and optimization'
    }
  ];

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFeedback({ name: '', email: '', message: '' });
    }, 3000);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % hydroponicImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + hydroponicImages.length) % hydroponicImages.length);
  };

  React.useEffect(() => {
    const interval = setInterval(nextImage, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
  {/* Hero Section */}
  <section className="py-20 relative">
    {/* Glowing Backgrounds */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-purple-700/40 via-transparent to-transparent blur-3xl"></div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-blue-600/40 via-transparent to-transparent blur-3xl"></div>
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div className="space-y-8">
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
            Revolutionary
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 animate-pulse">
              Hydroponic Agriculture
            </span>
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            Experience futuristic hydroponics powered by blockchain & NFTs.  
            Grow smarter, save resources, and own your digital farm.
          </p>

          <div className="flex space-x-4">
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.7)] hover:shadow-[0_0_40px_rgba(236,72,153,0.9)] transition-all font-semibold">
              Get Started
            </button>
            <button className="px-6 py-3 rounded-xl border border-purple-400/60 text-purple-300 hover:bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.6)] transition-all">
              Learn More
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="relative h-96 lg:h-[500px]">
          <div className="relative rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.6)] h-full">
            <img 
              src={hydroponicImages[currentImageIndex].url}
              alt={hydroponicImages[currentImageIndex].title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* NFT Section */}
  <section className="py-20 relative">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent blur-2xl"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">NFT-Powered Agriculture</h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Blockchain + farming = transparent ownership, crop NFTs, and a global trading ecosystem.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[
          { icon: <Coins className="h-8 w-8 text-white" />, title: "Digital Crop Ownership", desc: "Every plant is tokenized as an NFT with verifiable growth & harvest data." },
          { icon: <Shield className="h-8 w-8 text-white" />, title: "Transparent Supply Chain", desc: "Blockchain tracks your food from seed to plate securely & transparently." },
          { icon: <Globe className="h-8 w-8 text-white" />, title: "Global Marketplace", desc: "Trade crop NFTs worldwide in a secure, decentralized marketplace." }
        ].map((item, i) => (
          <div key={i} className="bg-gradient-to-br from-purple-800/50 to-indigo-900/50 backdrop-blur-xl rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.5)] p-8 hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] transition-all">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(236,72,153,0.6)]">
              {item.icon}
            </div>
            <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
            <p className="text-gray-300">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* Features */}
  <section className="py-20 relative">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-800/40 via-transparent to-transparent blur-3xl"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <h2 className="text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-400">Key Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {["300% Faster Growth", "90% Water Saving", "100% Organic"].map((feature, i) => (
          <div key={i} className="bg-slate-900/60 backdrop-blur-lg rounded-2xl p-8 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all">
            <h3 className="text-xl font-bold mb-4">{feature}</h3>
            <p className="text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tailored description for the feature goes here.</p>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* Testimonials */}
  <section className="py-20 relative">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-600/30 via-transparent to-transparent blur-2xl"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <h2 className="text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">What People Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {["Amazing system!", "Changed my farming!", "Blockchain + Hydroponics = 🔥"].map((quote, i) => (
          <div key={i} className="bg-gradient-to-br from-purple-900/60 to-indigo-800/50 rounded-2xl p-6 shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(236,72,153,0.6)] transition-all">
            <p className="text-gray-200 italic">“{quote}”</p>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* Feedback Form */}
  <section className="py-20 relative">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-700/30 via-transparent to-transparent blur-2xl"></div>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <h2 className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Share Your Feedback</h2>
      <form className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.5)] p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <input type="text" placeholder="Your Name" className="p-3 rounded-lg bg-slate-800 text-white border border-purple-500/40 focus:outline-none focus:ring-2 focus:ring-pink-500" />
          <input type="email" placeholder="Your Email" className="p-3 rounded-lg bg-slate-800 text-white border border-purple-500/40 focus:outline-none focus:ring-2 focus:ring-pink-500" />
        </div>
        <textarea placeholder="Your Message" rows="5" className="w-full p-3 rounded-lg bg-slate-800 text-white border border-purple-500/40 focus:outline-none focus:ring-2 focus:ring-pink-500 mb-6"></textarea>
        <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold shadow-[0_0_20px_rgba(236,72,153,0.7)] hover:shadow-[0_0_40px_rgba(236,72,153,0.9)] transition-all">
          Send Feedback
        </button>
      </form>
    </div>
  </section>
</div>

  );
};

export default HomePage;
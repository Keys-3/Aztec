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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Revolutionary
                  <span className="text-emerald-600 block">Hydroponic</span>
                  Agriculture
                </h1>
                <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                  Experience the future of farming with Aztec's cutting-edge hydroponic systems powered by blockchain technology. 
                  Our NFT-integrated platform allows you to own, trade, and monitor your crops digitally while maximizing yields, 
                  minimizing waste, and growing sustainably with precision agriculture technology.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">300%</div>
                  <div className="text-sm text-gray-600">Faster Growth</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Droplets className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">90%</div>
                  <div className="text-sm text-gray-600">Water Savings</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Leaf className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-600">Organic</div>
                </div>
              </div>
            </div>
            
            <div className="relative h-96 lg:h-[500px]">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-full">
                <img 
                  src={hydroponicImages[currentImageIndex].url}
                  alt={hydroponicImages[currentImageIndex].title}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl"></div>
                
                {/* Image Navigation */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                
                {/* Image Info */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{hydroponicImages[currentImageIndex].title}</h3>
                  <p className="text-sm text-gray-200">{hydroponicImages[currentImageIndex].description}</p>
                </div>
                
                {/* Dots Indicator */}
                <div className="absolute bottom-4 right-6 flex space-x-2">
                  {hydroponicImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NFT Integration Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">NFT-Powered Agriculture</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary blockchain integration that transforms your crops into digital assets, 
              enabling transparent ownership, trading, and verification of your agricultural produce.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Digital Crop Ownership</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Each plant in your hydroponic system is tokenized as an NFT, providing verifiable ownership, 
                growth tracking, and harvest certification on the blockchain. Monitor your digital assets 
                in real-time through our advanced dashboard.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />Unique plant identification</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />Growth stage verification</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />Harvest certification</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Transparent Supply Chain</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Blockchain technology ensures complete transparency from seed to sale. Every environmental 
                condition, nutrient application, and growth milestone is permanently recorded, providing 
                consumers with unprecedented trust and traceability.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />Immutable growth records</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />Quality assurance</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />Consumer confidence</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mb-6">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Global Marketplace</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Trade your crop NFTs on our global marketplace, connecting with buyers worldwide. 
                Set premium prices for organically grown, sustainably produced crops with verified 
                quality metrics and environmental impact data.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />Global reach</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />Premium pricing</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />Smart contracts</li>
              </ul>
            </div>
          </div>

          <div className="mt-16 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Start Your NFT Farming Journey</h3>
            <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
              Join the future of agriculture where technology meets sustainability. 
              Mint your first crop NFT and experience the power of blockchain-verified farming.
            </p>
            <button className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200">
              Explore NFT Features
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Aztec Hydroponics?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced hydroponic systems combine cutting-edge technology with sustainable practices 
              to deliver exceptional results for modern agriculture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Droplets className="h-8 w-8" />,
                title: "Water Efficiency",
                description: "Advanced recirculation systems reduce water usage by up to 90% compared to traditional farming."
              },
              {
                icon: <Leaf className="h-8 w-8" />,
                title: "Nutrient Precision",
                description: "Automated nutrient delivery systems ensure optimal plant nutrition for maximum growth and yield."
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Smart Monitoring",
                description: "Real-time monitoring of pH, temperature, humidity, and nutrient levels for perfect growing conditions."
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Premium Quality",
                description: "Produce higher quality crops with consistent yields year-round, regardless of weather conditions."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied farmers who have revolutionized their operations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Urban Farmer",
                image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
                content: "Aztec's hydroponic system transformed my small urban farm. I'm now producing 3x more vegetables in half the space with crystal clear monitoring data.",
                rating: 5
              },
              {
                name: "Miguel Rodriguez",
                role: "Commercial Grower",
                image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
                content: "The precision and automation of Aztec systems allowed us to scale our operation while reducing labor costs by 40%. Absolutely game-changing!",
                rating: 5
              },
              {
                name: "Emma Thompson",
                role: "Greenhouse Owner",
                image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg",
                content: "Year-round production with consistent quality has made our greenhouse incredibly profitable. The real-time monitoring gives us complete control.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Share Your Feedback</h2>
            <p className="text-xl text-gray-600">We'd love to hear from you! Your feedback helps us improve our systems and service.</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8">
            {isSubmitted ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600">Your feedback has been submitted successfully. We appreciate your input!</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={feedback.name}
                      onChange={(e) => setFeedback({...feedback, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={feedback.email}
                      onChange={(e) => setFeedback({...feedback, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                  <textarea
                    id="message"
                    value={feedback.message}
                    onChange={(e) => setFeedback({...feedback, message: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                    placeholder="Share your thoughts, suggestions, or feedback about our hydroponic systems..."
                    required
                  />
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto"
                  >
                    <Send className="h-5 w-5" />
                    <span>Send Feedback</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
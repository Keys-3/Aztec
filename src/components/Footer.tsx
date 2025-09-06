import React from 'react';
import { Sprout, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-emerald-400" />
              <span className="text-xl font-bold">Aztec Hydroponics</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Revolutionizing agriculture through advanced hydroponic technology, 
              delivering sustainable and efficient farming solutions for the modern world.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-emerald-400 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Home</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Dashboard</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Marketplace</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">System Installation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Monitoring & Analytics</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Maintenance</a></li>
              <li><a href="#" className="text-gray-300 hover:text-emerald-400 transition-colors">Training</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-emerald-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-emerald-400" />
                <span className="text-gray-300">info@aztechydroponics.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-emerald-400 mt-0.5" />
                <span className="text-gray-300">
                  123 Innovation Drive<br />
                  Agri-Tech Valley, CA 90210
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Aztec Hydroponics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
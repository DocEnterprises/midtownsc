import React from 'react';
import { Mail, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black/50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img 
              src="/logo.png" 
              alt="Midtown Skyclub" 
              className="h-12 mb-4"
            />
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/midtownskyclub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="mailto:contact@skyclub.com" 
                className="text-gray-400 hover:text-white"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-2">Legal</h4>
            <ul className="space-y-1 text-sm">
              <li><Link to="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <address className="text-sm text-gray-400 not-italic">
              Chelsea, NYC<br />
              contact@skyclub.com<br />
              © {new Date().getFullYear()} Midtown Skyclub.<br />
              All rights reserved.<br />
              Must be 21+ with valid ID.<br />
              License #: NY-C-2024-001
            </address>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm text-gray-400">
          <p>Cannabis products have intoxicating effects and may be habit forming. Marijuana can impair concentration, coordination, and judgment.</p>
          <p className="mt-2">For use only by adults twenty-one and older. Keep out of the reach of children.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 pb-20 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-1.5">
              <span>🛵</span> QuickBite
            </span>
            <p className="text-gray-400 text-sm max-w-sm">
              Discover the best food & drinks in your area. Delivered fresh and lightning fast. Powered by next-gen AI recommendations.
            </p>
            <div className="flex space-x-4 text-xl pt-2">
              <a href="#" className="hover:text-rose-400 transition-colors"><FaFacebook /></a>
              <a href="#" className="hover:text-rose-400 transition-colors"><FaTwitter /></a>
              <a href="#" className="hover:text-rose-400 transition-colors"><FaInstagram /></a>
              <a href="#" className="hover:text-rose-400 transition-colors"><FaLinkedin /></a>
              <a href="#" className="hover:text-rose-400 transition-colors"><FaYoutube /></a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-2.5 text-sm font-semibold text-gray-400">
              <li><Link to="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Press</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-2.5 text-sm font-semibold text-gray-400">
              <li><Link to="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Partner Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Partner</h3>
            <ul className="space-y-2.5 text-sm font-semibold text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Restaurant Partner</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Delivery Partner</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-sm text-gray-500 font-semibold">
          <p>&copy; {new Date().getFullYear()} QuickBite. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

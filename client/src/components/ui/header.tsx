"use client";

import React, { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <div className="text-white font-bold text-lg">S</div>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Shanthibhavan
              </h1>
              <p className="text-sm text-emerald-600 font-medium">
                Palliative Care
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
            >
              About
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
            >
              Services
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
            >
              Sponsor
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-emerald-600 font-medium transition-colors duration-200"
            >
              Contact
            </a>
          </nav>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <a
              href="tel:+918075449929"
              className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2.5 rounded-full font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <span className="text-lg">📞</span>
              <span>Call Now</span>
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <span
                  className={`block w-full h-0.5 bg-gray-600 transition-transform duration-200 ${
                    isMenuOpen ? "rotate-45 translate-y-1" : ""
                  }`}
                ></span>
                <span
                  className={`block w-full h-0.5 bg-gray-600 transition-opacity duration-200 ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                ></span>
                <span
                  className={`block w-full h-0.5 bg-gray-600 transition-transform duration-200 ${
                    isMenuOpen ? "-rotate-45 -translate-y-1" : ""
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isMenuOpen ? "max-h-64 pb-6" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col space-y-4 pt-4 border-t border-gray-200">
            <a
              href="#"
              className="text-gray-700 hover:text-emerald-600 font-medium"
            >
              About
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-emerald-600 font-medium"
            >
              Services
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-emerald-600 font-medium"
            >
              Sponsor
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-emerald-600 font-medium"
            >
              Contact
            </a>
            <a
              href="tel:+918075449929"
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg font-medium w-fit"
            >
              <span>📞</span>
              <span>Emergency Call</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

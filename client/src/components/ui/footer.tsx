import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <div className="text-white font-bold text-2xl">S</div>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Shanthibhavan</h3>
                <p className="text-emerald-300">Palliative Hospital</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              India's first free palliative hospital, providing compassionate
              care for bedridden patients and those suffering from terminal
              illnesses since 2016.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-emerald-300 transition-colors duration-200"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-emerald-300 transition-colors duration-200"
                >
                  Our Services
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-emerald-300 transition-colors duration-200"
                >
                  Sponsor a Bed
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-emerald-300 transition-colors duration-200"
                >
                  Get Involved
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-emerald-400 mt-1">📍</span>
                <div>
                  <p className="text-gray-300 text-sm">Pallissery, Thrissur</p>
                  <p className="text-gray-300 text-sm">Kerala, India</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-emerald-400">📞</span>
                <p className="text-gray-300 text-sm">0487 - 66 11 600</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-emerald-400">📧</span>
                <p className="text-gray-300 text-sm">office@shanthibhavan.in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold mb-2">
                  Emergency Contact & Sponsorship
                </h4>
                <p className="text-emerald-100 text-sm">
                  Rev. Fr. Joy Koothur - CEO
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <a
                  href="tel:+918075449929"
                  className="bg-white text-emerald-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200"
                >
                  📞 +91 80 75 44 99 29
                </a>
                <a
                  href="mailto:ceo@shanthibhavan.in"
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-colors duration-200"
                >
                  📧 Email CEO
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Shanthibhavan Palliative Hospital. Every bed can be sponsored
            - Let's provide compassionate care together.
          </p>
        </div>
      </div>
    </footer>
  );
}

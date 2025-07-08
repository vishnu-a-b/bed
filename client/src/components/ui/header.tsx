"use client";

import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail, Globe, MapPin } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isPalliativeInternational, setIsPalliativeInternational] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    // Check the URL when component mounts
    setIsPalliativeInternational(
      window.location.href.includes("palliativeinternational.com")
    );

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 shadow-md backdrop-blur-sm" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 md:py-3 flex items-center justify-between">
        {/* Logo and Title */}
        {isPalliativeInternational ? (
          <div className="flex items-center md:gap-4 gap-1">
            <img
              src="/logo.png"
              alt="Shanthibhavan Logo"
              className="md:h-32 h-20 w-auto rounded-lg"
            />
            <div>
              <h1 className="md:text-lg text-sm font-bold text-gray-800">
                SHANTHIBHAVAN PALLIATIVE INTERNATIONAL
              </h1>
              <p className="md:text-sm text-xs text-gray-500 leading-tight">
                <MapPin size={12} className="inline-block mr-1" />
                Office 3261, Ground Floor, 470 St. Kilda Rd, MELBOURNE VIC 3004
              </p>
              <div className="flex gap-1 flex-wrap">
                <div className="flex md:text-sm text-xs items-center gap-1 text-gray-500">
                  <Phone size={12} className="text-gray-500 flex-shrink-0" />
                  <div>
                    <p>+61 391112473</p>
                  </div>
                </div>
                <a
                  className="flex md:text-sm text-xs items-center gap-1 text-gray-500"
                  href="https://palliativeinternational.com/"
                >
                  <Globe size={12} className="text-gray-500 flex-shrink-0" />
                  <div>
                    <p>palliativeinternational.com</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center md:gap-4 gap-1">
            <img
              src="/father.png"
              alt="Shanthibhavan Logo"
              className="md:h-32 h-20 w-auto rounded-lg"
            />
            <div>
              <h1 className="md:text-lg text-sm font-bold text-gray-800">
                SHANTHIBHAVAN PALLIATIVE HOSPITAL
              </h1>
              <p className="md:text-sm text-xs text-gray-500 leading-tight">
                The first palliative Hospital in INDIA, The No-Bill hospital of
                KERALA
              </p>
              <p className="md:text-sm text-xs text-gray-500 leading-tight">
                <MapPin size={12} className="inline-block mr-1" />
                Mountain of Mercy, Pallissery, Arattupuzha.P.O, Thrissur
              </p>
              <div className="flex gap-1 flex-wrap">
                <div className="flex md:text-sm text-xs items-center gap-1 text-gray-500">
                  <Phone size={12} className="text-gray-500 flex-shrink-0" />
                  <div>
                    <p>0487-6611600</p>
                  </div>
                </div>
                <a
                  className="flex md:text-sm text-xs items-center gap-1 text-gray-500"
                  href="https://shanthibhavan.in/"
                >
                  <Globe size={12} className="text-gray-500 flex-shrink-0" />
                  <div>
                    <p>shanthibhavan.in</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

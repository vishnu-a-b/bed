"use client";

import { useState, useEffect } from "react";
import { Phone, Globe, MapPin } from "lucide-react";
import axios from "axios";

interface ContactInfo {
  address?: string;
  phoneNumber?: string;
  website?: string;
  organizationName: string;
  countryName?: string;
  currency?: string;
  source?: "country" | "none";
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        // Extract bedId or supporterId from URL
        const urlParams = new URLSearchParams(window.location.search);
        const bedId = urlParams.get("bed");
        const supporterId = urlParams.get("supporter");

        // Build API URL with appropriate query parameters
        let apiUrl = `${API_URL}/supporter/contact-info?`;
        if (supporterId) {
          apiUrl += `supporterId=${supporterId}`;
        } else if (bedId) {
          apiUrl += `bedId=${bedId}`;
        } else {
          // No ID found in URL, use default values
          setLoading(false);
          return;
        }

        const response = await axios.get(apiUrl);
        console.log("API Response:", response);
        if (response.status !== 200) {
          // Axios uses status instead of ok
          throw new Error("Failed to fetch contact info");
        }
        const data = response.data; // Axios puts the response data in .data property
        if (data.success) {
          setContactInfo(data.data);
        }
      } catch (err) {
        setError("Failed to load contact information");
        console.error("Error fetching contact info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Default values
  const isPalliativeInternational = window.location.hostname.includes(
    "palliativeinternational.com"
  );

  const defaultInternationalInfo = {
    organizationName: "SHANTHIBHAVAN PALLIATIVE INTERNATIONAL",
    address: "Office 3261, Ground Floor, 470 St. Kilda Rd, MELBOURNE VIC 3004",
    phoneNumber: "+61 391112473",
    website: "https://palliativeinternational.com/",
  };

  const defaultLocalInfo = {
    organizationName: "SHANTHIBHAVAN PALLIATIVE HOSPITAL",
    address: "Mountain of Mercy, Pallissery, Arattupuzha.P.O, Thrissur",
    phoneNumber: "0487-6611600",
    website: "https://shanthibhavan.in/",
  };

  // Determine which info to display
  const displayInfo =
    contactInfo ||
    (isPalliativeInternational ? defaultInternationalInfo : defaultLocalInfo);

  if (loading) {
    return <div className="w-full h-20 bg-white"></div>;
  }

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 shadow-md backdrop-blur-sm" : "bg-white"
      }`}
    >
      <div className="max-w-7xl  px-2 sm:px-6 lg:px-8 py-2 md:py-3 flex items-center justify-between">
        <div className="flex items-center md:gap-4 gap-1">
          <img
            src={isPalliativeInternational ? "/logo.png" : "/father.png"}
            alt="Shanthibhavan Logo"
            className="md:h-32 h-20 w-auto rounded-lg"
          />
          <div>
            <h1 className="md:text-lg text-sm font-bold text-gray-800">
              {displayInfo.organizationName}
            </h1>
            {displayInfo.address && (
              <p className="md:text-sm text-xs text-gray-500 leading-tight">
                <MapPin size={12} className="inline-block mr-1" />
                {displayInfo.address}
              </p>
            )}
            <div className="flex gap-1 flex-wrap">
              {displayInfo.phoneNumber && (
                <div className="flex md:text-sm text-xs items-center gap-1 text-gray-500">
                  <Phone size={12} className="text-gray-500 flex-shrink-0" />
                  <div>{displayInfo.phoneNumber}</div>
                </div>
              )}
              {displayInfo.website && (
                <a
                  className="flex md:text-sm text-xs items-center gap-1 text-gray-500"
                  href={displayInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe size={12} className="text-gray-500 flex-shrink-0" />
                  <div>
                    {displayInfo.website
                      .replace(/^https?:\/\/(www\.)?/, "")
                      .replace(/\/$/, "")}
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

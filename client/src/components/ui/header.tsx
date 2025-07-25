"use client";

import { useState, useEffect } from "react";
import { Phone, Globe, MapPin } from "lucide-react";
import axios from "axios";
import { usePathname, useSearchParams } from "next/navigation";

interface ContactInfo {
  address?: string;
  phoneNumber?: string;
  website?: string;
  organizationName: string;
  countryName?: string;
  currency?: string;
  source?: "country" | "none";
}

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

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isPalliativeInternational = isClient 
    ? window.location.hostname.includes("palliativeinternational.com")
    : false;

  useEffect(() => {
    if (!isClient) return;

    const fetchContactInfo = async () => {
      try {
        const bedId = searchParams?.get("bed");
        const supporterId = searchParams?.get("supporter");

        if (!bedId && !supporterId) {
          setLoading(false);
          return;
        }

        const apiUrl = `${API_URL}/supporter/contact-info?${
          supporterId ? `supporterId=${supporterId}` : `bedId=${bedId}`
        }`;

        const response = await axios.get(apiUrl);
        
        if (response.status === 200 && response.data.success) {
          setContactInfo(response.data.data);
        } else {
          throw new Error("Failed to fetch contact info");
        }
      } catch (err) {
        console.error("Error fetching contact info:", err);
      } finally {
        setLoading(false);
      }
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    fetchContactInfo();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [searchParams, API_URL, isClient]);

  const displayInfo = contactInfo || 
    (isPalliativeInternational ? defaultInternationalInfo : defaultLocalInfo);

  if (!isClient || loading) {
    return <div className="w-full h-20 bg-white" />;
  }

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 shadow-md backdrop-blur-sm" : "bg-white"
      }`}
    >
      <div className="max-w-7xl px-2 sm:px-6 lg:px-8 py-2 md:py-3 flex items-center justify-between mx-auto">
        <div className="flex items-center md:gap-4 gap-1">
          <img
            src={displayInfo?.organizationName==="Shanthibhavan Palliative International" ? "/logo.png" : "/father.png"}
            alt="Shanthibhavan Logo"
            className="md:h-32 h-20 w-auto rounded-lg"
            loading="lazy"
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
                  <span>{displayInfo.phoneNumber}</span>
                </div>
              )}
              {displayInfo.website && (
                <a
                  className="flex md:text-sm text-xs items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                  href={displayInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe size={12} className="text-gray-500 flex-shrink-0" />
                  <span>
                    {new URL(displayInfo.website).hostname.replace("www.", "")}
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
"use client";
import axios from "axios";
import { Bed, Users } from "lucide-react";
import Link from "next/link";
import React, { use, useEffect } from "react";

export default function BookingStat() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [data, setData] = React.useState<any>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios(`${API_URL}/supporter/get-all-data`);

        setData(response.data.data.items);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  return (
    
    <section className="mt-10 text-center md:px-60 md:mt-32 p-2">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
        Providing Care Where It's Needed Mosts
      </h2>
      <p className="text-sm text-gray-500">
        Every donation goes directly toward providing hospital beds, medical
        care, and recovery support for patients who otherwise could not afford
        it.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:mt-10">
        {data.length > 0 &&
          data.map((item: any) => (
            <div className="p-6 md:p-12 rounded-2xl shadow-md border">
              <div className="flex justify-between items-start text-left">
                <div>
                  <div className="font-bold">{item?.countryName}</div>
                  <p className="text-sm text-gray-400">
                    Hospital Bed Sponsership
                  </p>
                </div>
                <div className="text-xs bg-blue-200 px-2 py-1 rounded-full text-black">
                  {item?.currency} {item?.totalAmountOfBed/item?.totalBedsInCountry}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Progress
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {(item?.totalAmountOfSupporter / item?.totalAmountOfBed * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${(item?.totalAmountOfSupporter / item?.totalAmountOfBed * 100).toFixed(2)}%` }}
                  ></div>
                </div>

                <div className="mt-2 flex justify-between">
                  <div className="text-xs text-gray-500 flex items-center justify-center">
                    <Bed className="h-5 w-5 mr-1" />
                    {item?.totalBedsInCountry} Beds 
                  </div>
                  
                </div>

                <div className="grid grid-cols-2 mt-6 gap-2">
                  <button className="bg-blue-600 py-1 text-xs rounded-lg text-white md:py-2">
                    View More
                  </button>
                  <Link
                    className="bg-blue-600 py-1 text-xs rounded-lg text-white md:py-2"
                    href={`/donate?country=${item?.countryId}`}
                  >
                    Donate Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        {/* India Card */}

        
      </div>
    </section>
  );
}

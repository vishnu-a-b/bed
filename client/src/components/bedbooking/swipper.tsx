"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { slides } from "@/lib/data";

import "swiper/css";
import "swiper/css/autoplay";

export default function SwiperWrapper() {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[50vh] md:h-[80vh] bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl"></div>
    );
  }

  return (
    <div className="relative mx-auto p-2">
      <div className="relative overflow-hidden rounded-2xl border">
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          modules={[Autoplay]}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          loop={true}
          className="w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative flex flex-col items-center justify-center text-center w-full h-[50vh] md:h-[80vh] px-4 py-8 transition-all duration-300 overflow-hidden"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>

                <div className="relative z-10">
                  <div className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent text-2xl md:text-5xl font-bold mb-4 transform transition-transform">
                    {slide.title}
                  </div>
                  <div className="text-white text-sm md:text-base max-w-md mx-auto leading-relaxed">
                    {slide.description}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 py-3 z-20">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-8 bg-blue-500"
                  : "w-2 bg-white bg-opacity-50"
              }`}
            />
          ))}
        </div>

        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
          <button className="text-sm bg-gradient-to-r from-[#147cac] to-[#64c8d2] hover:from-[#1a8fc5] hover:to-[#7ad6df] text-white px-6 py-2 rounded-lg font-medium shadow-lg transform hover:translate-y-px transition-all duration-300">
            Support Our Mission
          </button>
        </div>
      </div>
    </div>
  );
}

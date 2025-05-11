"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { slides } from "@/lib/data";

import "swiper/css";
import "swiper/css/autoplay";
import { ArrowUpLeft } from "lucide-react";

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
    <section className="flex flex-col justify-center items-center cloud">
      <h1 className="text-2xl font-bold text-clip text-center text-zinc-800 mt-8 md:text-4xl">
        Lorem ipsum dolor sit amet, <br />
        consectetur adipiscing elit
      </h1>
      <p className="text-xs text-center text-clip text-wrap mt-1 md:mt-4 md:text-sm">
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
        officia deserunt mollit anim id est laborum
      </p>

      <div className="w-[90vw] rounded-6xl mt-4 md:w-[60vw] md:mt-10 relative">
        <div className="">
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
            className="rounded-3xl"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={index}>
                <div
                  className="relative flex flex-col items-center justify-center text-center w-full h-[40vh] md:h-[60vh] px-4 py-8 transition-all duration-300 overflow-hidden"
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

          <button className="absolute bottom-8 md:bottom-16 left-0 right-0 flex justify-center gap-2 py-3 z-20">
            <span className="bg-gradient-to-r from-blue-300 to-purple-700 px-4 py-2 rounded-2xl text-white text-xs md:text-md">
              Know More
            </span>
          </button>

          <div className="absolute bottom-2 md:bottom-6 left-0 right-0 flex justify-center gap-2 py-3 z-20">
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

          <div className="absolute glassmorphism top-20 z-50 text-gray-500 px-6 py-2 rounded-2xl -left-16 hidden md:block">
            <ArrowUpLeft />
            <div className="font-bold">2+ Countries</div>
            <div className="text-sm">Services</div>
          </div>

          <img
            src="https://fellowship.shanthibhavan.in/storage/wedo/wedo_1682251513.png"
            alt=""
            className="w-32 h-40 absolute rounded-2xl object-cover top-48 z-50 -right-16 hidden md:block"
          />
        </div>
      </div>
    </section>
  );
}

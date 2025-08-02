"use client";

import { useRef, ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface SlideData {
  image: string;
  title: ReactNode;
  text: string;
  link: string;
}

const Slider: React.FC = () => {
  const progressCircle = useRef<SVGSVGElement>(null);
  const progressContent = useRef<HTMLSpanElement>(null);

  const onAutoplayTimeLeft = (
    s: SwiperType,
    time: number,
    progress: number
  ): void => {
    if (progressCircle.current) {
      progressCircle.current.style.setProperty(
        "--progress",
        String(1 - progress)
      );
    }
    if (progressContent.current) {
      progressContent.current.textContent = `${Math.ceil(time / 1000)}s`;
    }
  };

  const slideData: SlideData[] = [
    {
      image: "/assets/images/slides/slider-v3-img1.jpg",
      title: (
        <>
          Welcome to <br />
          Palliative <br /> International
        </>
      ),
      text: `Shanthibhavan Palliative International Ltd is endorsed as a Deductible
          Gift Recipient (DGR) under Subdivision 30-BA of the Income Tax
          Assessment Act 1997. Donations of $2 or more are tax deductible`,
      link: "/payment",
    },
    {
      image: "/assets/images/slides/slider-v3-img2.jpg",
      title: (
        <>
          A Global Pioneer <br />
          in Long Term Palliative <br />
          Hospital Care
        </>
      ),
      text: `Shanthibhavan Palliative International Ltd is endorsed as a Deductible
          Gift Recipient (DGR) under Subdivision 30-BA of the Income Tax
          Assessment Act 1997. Donations of $2 or more are tax deductible`,
      link: "/payment",
    },
    {
      image: "/assets/images/slides/slider-v3-img3.jpg",
      title: (
        <>
          Making a <br />
          Difference Starts <br />
          Here
        </>
      ),
      text: `Shanthibhavan Palliative International Ltd is endorsed as a Deductible
          Gift Recipient (DGR) under Subdivision 30-BA of the Income Tax
          Assessment Act 1997. Donations of $2 or more are tax deductible`,
      link: "/payment",
    },
  ];

  return (
    <>
      <section className="main-slider main-slider-one style3">
        <div className="main-slider-one__inner ">
          <div className="absolute top-[50vh] md:top-[68vh] right-24 md:right-48 z-10 bg-white rounded-full">
            <img
              src="/assets/images/dgr1.webp"
              alt="Logo 1"
              className="w-16 h-16 md:w-40 md:h-40 object-contain"
            />
          </div>

          <div className="absolute top-[50vh] md:top-[68vh] right-2 z-10 bg-white rounded-full">
            <img
              src="/assets/images/dgr2.webp"
              alt="Logo 1"
              className="w-16 h-16 md:w-40 md:h-40 object-contain"
            />
          </div>
          <Swiper
            spaceBetween={0}
            centeredSlides={true}
            autoplay={{
              delay: 10000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination",
            }}
            navigation={{
              nextEl: ".custom-nav-btn.swiper-button-next",
              prevEl: ".custom-nav-btn.swiper-button-prev",
            }}
            effect="fade"
            fadeEffect={{
              crossFade: true,
            }}
            modules={[Autoplay, Pagination, Navigation, EffectFade]}
            onAutoplayTimeLeft={onAutoplayTimeLeft}
            className="testimonial-one__carousel"
            loop={true}
            speed={500}
          >
            {slideData.map((slide: SlideData, index: number) => (
              <SwiperSlide key={index}>
                <div className="main-slider-one__single md:h-[80vh] h-[50vh]">
                  <div
                    className="image-layer"
                    style={{
                      backgroundImage: `url(${slide.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                  <div className="container">
                    <div className="main-slider-one__content">
                      <div className="title">
                        <h2>{slide.title}</h2>
                      </div>
                      
                      <p className=" font-semibold text-xm md:text-sm ">{slide.text}</p>
                      <div className=" pt-4 ">
                        <a className="thm-btn" href={slide.link}>
                          <span className="txt text-xl">Donate Now</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}

            {/* Custom Pagination */}
            <div className="swiper-pagination" />

            {/* Custom Navigation and Progress Controls */}
            <div className="navigation-controls">
              {/* Autoplay Progress */}
              <div className="autoplay-progress">
                <svg viewBox="0 0 48 48" ref={progressCircle}>
                  <circle cx="24" cy="24" r="20" />
                </svg>
                <span ref={progressContent} />
              </div>
            </div>
          </Swiper>
        </div>
      </section>

      <style jsx>{`
        .main-slider-one__single {
          position: relative;
          display: flex;
          align-items: center;
        }

        .image-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .image-layer::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          z-index: 2;
        }

        .container {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
        }

        .main-slider-one__content {
          color: #fff;
          text-align: left;
          max-width: 600px;
        }

        .main-slider-one__content .title h2 {
          font-size: 4rem;
          font-weight: bold;
          margin-bottom: 2rem;
          line-height: 1.2;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
          opacity: 0;
          transform: translateX(-50px);
          animation: slideInLeft 1s ease-out 0.3s forwards;
        }

        .btn-box {
          margin-top: 2rem;
          opacity: 0;
          transform: translateX(-30px);
          animation: slideInLeft 1s ease-out 0.8s forwards;
        }

        .thm-btn {
          display: inline-block;
          background: #9333ea;
          color: #fff;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .thm-btn:hover {
          background: #7c3aed;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(147, 51, 234, 0.4);
        }

        .autoplay-progress {
          position: absolute;
          right: -16px;
          bottom: 16px;
          z-index: 10;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: var(--swiper-theme-color, #007aff);
        }

        .autoplay-progress svg {
          --progress: 0;
          position: absolute;
          left: 0;
          top: 0px;
          z-index: 10;
          width: 100%;
          height: 100%;
          stroke-width: 4;
          stroke: var(--swiper-theme-color, #007aff);
          fill: none;
          stroke-dashoffset: calc(125.6 * (1 - var(--progress)));
          stroke-dasharray: 125.6;
          transform: rotate(-90deg);
        }

        .swiper-button-prev,
        .swiper-button-next {
          color: #fff;
          background: rgba(0, 0, 0, 0.5);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          transition: all 0.3s ease;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .swiper-button-prev:hover,
        .swiper-button-next:hover {
          background: rgba(0, 0, 0, 0.8);
          border-color: rgba(255, 255, 255, 0.8);
          transform: scale(1.1);
        }

        .swiper-button-prev::after,
        .swiper-button-next::after {
          font-size: 20px;
          font-weight: bold;
        }

        .swiper-button-prev span,
        .swiper-button-next span {
          font-size: 20px;
          display: block;
        }

        /* Position navigation controls */
        .navigation-controls {
          position: absolute;
          right: 60px;
          bottom: 30px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .nav-buttons {
          display: flex;
          gap: 10px;
        }

        .custom-nav-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 18px;
        }

        .custom-nav-btn:hover {
          background: rgba(0, 0, 0, 0.8);
          border-color: rgba(255, 255, 255, 0.8);
          transform: scale(1.1);
        }

        .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
        }

        .swiper-pagination-bullet-active {
          background: #fff;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Reset animations on slide change */
        .swiper-slide:not(.swiper-slide-active)
          .main-slider-one__content
          .title
          h2,
        .swiper-slide:not(.swiper-slide-active) .btn-box {
          opacity: 0;
          transform: translateX(-50px);
        }

        .swiper-slide-active .main-slider-one__content .title h2 {
          animation: slideInLeft 1s ease-out 0.3s forwards;
        }

        .swiper-slide-active .btn-box {
          animation: slideInLeft 1s ease-out 0.8s forwards;
        }

        @media (max-width: 768px) {
          .main-slider-one__content .title h2 {
            font-size: 2.5rem;
          }

          .navigation-controls {
            right: 50px;
            bottom: 20px;
          }

          .custom-nav-btn {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }

          .autoplay-progress {
            width: 36px;
            height: 36px;
          }
        }

        @media (max-width: 480px) {
          .main-slider-one__content .title h2 {
            font-size: 2rem;
          }

          .thm-btn {
            padding: 12px 24px;
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
};

export default Slider;

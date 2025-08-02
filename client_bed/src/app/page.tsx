"use client";
import Footer from "@/components/donation/footer";
import Header from "@/components/donation/header";
import Slider from "@/components/donation/slider";
import { Heart, Users, Gift, HandHeart, Shield, Bed } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Home = () => {
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Header placeholder */}
      <Header />

      {/* Slider placeholder */}
      <Slider />

      {/* Feature Section with Modern Cards */}
      <div className="relative z-10 py-20 bg-gradient-to-b from-white via-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
              {/* Card 1 */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-purple-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-purple-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-purple-100 rounded-full opacity-0 group-hover:opacity-30 transition-all duration-500 blur-xl" />

                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 group-hover:text-purple-600 transition-colors duration-300 text-center">
                    <a href="/aboutus" className="hover:text-purple-600">
                      Who We Serve
                    </a>
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <div className="flex items-center group/item hover:translate-x-2 transition-transform duration-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-4 animate-pulse group-hover/item:scale-150 transition-transform duration-300"></div>
                      <span>Elderly abandoned by families</span>
                    </div>
                    <div className="flex items-center group/item hover:translate-x-2 transition-transform duration-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-4 animate-pulse group-hover/item:scale-150 transition-transform duration-300"></div>
                      <span>Bedridden and terminally ill patients</span>
                    </div>
                    <div className="flex items-center group/item hover:translate-x-2 transition-transform duration-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-4 animate-pulse group-hover/item:scale-150 transition-transform duration-300"></div>
                      <span>Patients with no one to care for them</span>
                    </div>
                    <div className="flex items-center group/item hover:translate-x-2 transition-transform duration-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-4 animate-pulse group-hover/item:scale-150 transition-transform duration-300"></div>
                      <span>
                        Families unable to afford long-term medical support
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-purple-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-purple-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-purple-100 rounded-full opacity-0 group-hover:opacity-30 transition-all duration-500 blur-xl" />

                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <Gift className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 group-hover:text-purple-600 transition-colors duration-300 text-center">
                    <a href="/aboutus" className="hover:text-purple-600">
                      What We Provide – Completely Free
                    </a>
                  </h2>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <div className="flex items-center group/item hover:translate-x-2 transition-transform duration-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-4 animate-pulse group-hover/item:scale-150 transition-transform duration-300"></div>
                      <span>Hospital admission and accommodation</span>
                    </div>
                    <div className="flex items-center group/item hover:translate-x-2 transition-transform duration-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-4 animate-pulse group-hover/item:scale-150 transition-transform duration-300"></div>
                      <span>Doctor and nursing care</span>
                    </div>
                    <div className="flex items-center group/item hover:translate-x-2 transition-transform duration-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-4 animate-pulse group-hover/item:scale-150 transition-transform duration-300"></div>
                      <span>Physiotherapy</span>
                    </div>
                    <div className="flex items-center group/item hover:translate-x-2 transition-transform duration-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-4 animate-pulse group-hover/item:scale-150 transition-transform duration-300"></div>
                      <span>Dialysis and fluid tapping</span>
                    </div>
                    <div className="flex items-center group/item hover:translate-x-2 transition-transform duration-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-4 animate-pulse group-hover/item:scale-150 transition-transform duration-300"></div>
                      <span>Catheter and bed sore management</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-purple-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-purple-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-purple-100 rounded-full opacity-0 group-hover:opacity-30 transition-all duration-500 blur-xl" />

                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <HandHeart className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 group-hover:text-purple-600 transition-colors duration-300 text-center">
                    <a href="/aboutus" className="hover:text-purple-600">
                      Hands of Grace Program
                    </a>
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-center">
                    For patients without family support or financial ability,
                    Hands of Grace ensures they receive everything from care
                    supplies to personal bystander assistance without worry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="relative py-20 bg-gradient-to-br from-white via-purple-50/30 to-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-transparent opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="md:text-5xl text-2xl font-bold text-gray-800 mb-6 leading-tight ">
                  Global Mission of the{" "}
                  <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
                    Franciscan Sisters of St. Clare
                  </span>
                </h2>
              </div>
              <div className="prose prose-lg text-gray-600 leading-relaxed space-y-6">
                <p>
                  The Franciscan Sisters of St. Clare (FSC) Congregation, with
                  its headquarters in Italy and communities in Indonesia and
                  India, has launched a global mission focused on long-term
                  palliative hospital care. This initiative aims to expand its
                  services worldwide, with plans to also establish a presence in
                  Australia.
                </p>
                <p>
                  The FSC Congregation began its long-term palliative mission in
                  India in 2014. They established Shanthibhavan Palliative
                  Hospital, notably the first palliative hospital in INDIA and
                  "No Bill Hospital" in Kerala, India. This hospital provides
                  free palliative care and extends its support to numerous
                  homes, offering care and compassion to bedridden patients
                  regardless of their religion, caste, colour, or creed.
                </p>
                <p>
                  Long Term palliative care focuses on improving the quality of
                  life for individuals with life-limiting or disabling diseases.
                  This is achieved by effectively managing pain and providing
                  comprehensive emotional, mental, and social support. Everyone
                  is welcome to contribute to this vital mission.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 bg-gradient-to-br from-purple-100 to-purple-100 p-4 text-center">
                <img
                  src="/assets/images/about/about-v1-img2.jpg"
                  alt="Franciscan Sisters of St. Clare Mission"
                  className="w-full h-auto rounded-2xl object-cover"
                />
                <h3 className="text-2xl font-bold text-purple-800 mt-4">
                  Global Healthcare Mission
                </h3>
                <p className="text-purple-600 mt-2">
                  Spreading compassionate care worldwide
                </p>
              </div>
              {/* Floating decorations */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Why We Exist Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <h2 className="md:text-5xl text-2xl font-bold text-gray-800 leading-tight">
                Why We{" "}
                <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
                  Exist
                </span>
              </h2>
              <div className="prose prose-lg text-gray-600 leading-relaxed space-y-6">
                <p>
                  Life-threatening illnesses do not discriminate. Be it children
                  or the elderly, such conditions often render people
                  physically, mentally, and emotionally broken. While some may
                  pass quickly, many endure prolonged suffering. In India and
                  beyond, structured inpatient palliative hospitals are rare,
                  making dignified end-of-life care inaccessible for thousands.
                </p>
                <p>
                  Shanthibhavan bridges this gap. We serve as a sanctuary for
                  those rejected by conventional hospitals and unsupported at
                  home, offering hospital-level palliative care with no
                  financial burden.
                </p>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 bg-gradient-to-br from-purple-100 to-purple-200 p-16 text-center">
                <Shield className="w-48 h-48 text-purple-600 mx-auto mb-4 animate-pulse" />
                <h3 className="text-2xl font-bold text-purple-800">
                  Sanctuary of Care
                </h3>
                <p className="text-purple-600 mt-2">
                  Bridging gaps in healthcare
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section with Modern Cards */}
      <div className="py-20 bg-gradient-to-b from-purple-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-800" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="md:text-5xl text-2xl font-bold text-gray-800 mb-4">
              Our{" "}
              <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Services
              </span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-purple-800 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Short Term Care",
                description: "Immediate care for temporary health needs",
                img: "/assets/images/services/case-v1-img1.jpg",
              },
              {
                title: "Long Term Care",
                description: "Comprehensive care for chronic conditions",
                img: "/assets/images/services/case-v1-img2.jpg",
              },
              {
                title: "Free Service",
                description: "No-cost care for those in need",
                img: "/assets/images/services/case-v1-img3.jpg",
              },
              {
                title: "Free Caravan Camps",
                description: "Mobile medical services for remote areas",
                img: "/assets/images/services/case-v1-img4.jpg",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="group relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border border-gray-100"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={service.img}
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className={`absolute inset-0  opacity-70`} />
                </div>
                <div className="p-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                </div>
                <div
                  className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
        {/* Join Mission Section with Animated Background */}
        <div className="relative py-24 overflow-hidden ">
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 bg-white/10 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 1.5}s`,
                  animationDuration: `${4 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center text-white max-w-4xl mx-auto">
              <div className="mb-8">
                <Heart className="w-20 h-20 mx-auto text-purple-200 animate-pulse mb-6" />
              </div>
              <h2 className="md:text-5xl text-3xl font-bold mb-8 leading-tight">
                Join the <span className="text-purple-200">Mission</span>
              </h2>
              <p className="text-2xl leading-relaxed opacity-95">
                No one deserves to suffer in silence. No one should die without
                dignity. Let's build a world where care is a right, not a
                privilege. Join hands with Palliative International, and be a
                part of a global movement of love, care, and compassion.
              </p>
            </div>
          </div>
        </div>

        {/* Image Section with Floating Effect */}
        <div className="container mx-auto px-4 relative z-10 -mt-16 mb-16">
          <div className="relative h-96 w-auto max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-8 border-white transform hover:scale-[1.02] transition-transform duration-500">
            <img
              src="/assets/images/join-volunteer-home.jpg"
              alt="Join our volunteer team"
              className="object-cover object-center w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-purple-800/20"></div>
            {/* <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
              <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mx-auto" >
                <Heart className="w-5 h-5" />
                Become a Volunteer
              </button>
            </div> */}
          </div>
          <div className="relative z-10 py-24 text-center">
            <button
              className="group relative bg-white text-purple-600 px-12 py-4 rounded-full font-bold text-lg hover:bg-purple-600 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => router.push("/payment")}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Donate Now
              </span>
              <div className="absolute inset-0 bg-purple-600 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300" />
            </button>
            <p className="mt-8 text-white/80 text-lg max-w-md mx-auto">
              Your contribution helps us provide compassionate care to those in
              need worldwide.
            </p>
          </div>
        </div>

        {/* Donate Section with Interactive Elements */}
      </div>

      {/* Sponsor a Bed Section */}
      {/* <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 bg-gradient-to-br from-purple-100 to-purple-200 p-16 text-center">
                <Bed
                  className="w-48 h-48 text-purple-600 mx-auto mb-4 animate-bounce"
                  style={{ animationDuration: "3s" }}
                />
                <h3 className="text-2xl font-bold text-purple-800">
                  Medical Bed Sponsorship
                </h3>
                <p className="text-purple-600 mt-2">
                  Support patient care directly
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <h2 className="md:text-5xl text-2xl font-bold text-gray-800 leading-tight">
                Sponsor a <br />
                <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent">
                  Medical Bed
                </span>
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Shanthibhavan Palliative Hospital is the first hospital in India
                for the palliative bedridden patients without bills and cash
                counters. Everything is free for the palliative patients
                including palliative care, all kinds of mental and medical
                support and food. The Hospital runs on the motto,'by the people,
                for the people'. This hospital extends its support to many homes
                where bedridden patients need care and love.
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Footer placeholder */}
      <Footer />
    </div>
  );
};

export default Home;

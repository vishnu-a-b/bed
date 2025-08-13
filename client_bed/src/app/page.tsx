"use client";
import Footer from "@/components/donation/footer";
import Header from "@/components/donation/header";
import Slider from "@/components/donation/slider";
import YouTubePlayer from "@/components/donation/YoutubePlayer";
import BedSupportForm from "@/components/payment/BedSupportForm";
import { Button } from "@/components/ui/button";
import { initGA, logPageView } from "../utils/analytics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";

import axios from "axios";
import {
  Heart,
  Users,
  Gift,
  HandHeart,
  Shield,
  Bed,
  Star,
  Award,
  Hospital,
  HeartPulse,
  Wind,
  Utensils,
  Droplet,
  Activity,
  Clock,
  HomeIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Home = () => {
  const [bedData, setBedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const bedId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("id")
      : null;

  useEffect(() => {
    initGA();
  }, []);


  useEffect(() => {
    const fetchBedData = async () => {
      try {
        let response;
        if (bedId) {
          response = await axios(`${API_URL}/supporter/get-bed-data/${bedId}`);
        } else {
          response = await axios(
            `${API_URL}/supporter/get-bed-data/688d9977dd733bb538f6eb73`
          );
        }

        console.log("Bed Data:", response?.data);
        logPageView(response.data?.bedNo);
        setBedData(response?.data);

      } catch (err) {
      } finally {
      }
    };
    fetchBedData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  if (bedData) {
    return (
      <div className="relative overflow-hidden">
        {/* Header placeholder */}
        <Header />

        {/* Slider placeholder */}
        <Slider bed={bedData} />
        <YouTubePlayer />

        {/* New "Every Bed Counts" Section - Premium positioning */}
        <div className="relative py-24 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5" />

          {/* Floating decorative elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-7xl mx-auto">
              {/* Header with enhanced typography */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-8">
                  <Star className="w-6 h-6 text-blue-500 animate-pulse" />
                  <span className="text-blue-600 font-semibold text-lg">
                    Every Bed Counts
                  </span>
                  <Star className="w-6 h-6 text-blue-500 animate-pulse" />
                </div>

                <h2 className="text-3xl md:text-6xl font-bold text-gray-800 mb-8 leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    A Bed of Hope:
                  </span>
                  <br />
                  <span className="text-2xl md:text-4xl text-gray-700">
                    Help Us Bring Dignity to Every Final Breath
                  </span>
                </h2>

                <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full mb-8" />
              </div>

              {/* Unified content section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-blue-100 mb-12 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-200/30 rounded-full blur-2xl" />

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    {/* Text content with improved typography */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          India's First & Only Free Palliative Care Hospital
                        </h3>
                      </div>

                      <p className="text-gray-700 leading-relaxed text-lg mb-6">
                        Shanthibhavan Palliative Hospital provides{" "}
                        <span className="font-semibold text-blue-600">
                          completely free care
                        </span>{" "}
                        to the bedridden, terminally ill, and those enduring
                        chronic suffering. With centers in{" "}
                        <span className="font-semibold">Thrissur</span> and{" "}
                        <span className="font-semibold">
                          Thiruvananthapuram
                        </span>
                        , we offer comprehensive support including:
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        {[
                          {
                            icon: <Clock className="w-5 h-5 text-blue-500" />,
                            text: "24/7 Nursing",
                          },
                          {
                            icon: (
                              <Activity className="w-5 h-5 text-blue-500" />
                            ),
                            text: "Physiotherapy",
                          },
                          {
                            icon: <Shield className="w-5 h-5 text-blue-500" />,
                            text: "Bedsore Care",
                          },
                          {
                            icon: <Droplet className="w-5 h-5 text-blue-500" />,
                            text: "Fluid Tapping",
                          },
                          {
                            icon: (
                              <HeartPulse className="w-5 h-5 text-blue-500" />
                            ),
                            text: "Dialysis",
                          },
                          {
                            icon: <Wind className="w-5 h-5 text-blue-500" />,
                            text: "Ventilators",
                          },
                          {
                            icon: (
                              <Utensils className="w-5 h-5 text-blue-500" />
                            ),
                            text: "Free Meals",
                          },
                          {
                            icon: (
                              <HomeIcon className="w-5 h-5 text-blue-500" />
                            ),
                            text: "Family Housing",
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100"
                          >
                            {item.icon}
                            <span className="text-blue-700 font-medium">
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Visual element with CTA */}
                    <div className="w-full md:w-1/3 flex flex-col items-center">
                      <div className="relative mb-6">
                        <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl ">
                          <Hospital className="w-20 h-20 text-white" />
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-400/20 rounded-full blur-xl" />
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="lg"
                            className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6 rounded-full font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full"
                          >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                              <Heart className="w-6 h-6" />
                              <span>Support Our Mission</span>
                            </span>
                            <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-lg mx-2">
                          <DialogHeader>
                            <DialogDescription className="max-h-[80vh] overflow-y-auto p-1">
                              <BedSupportForm bed={bedData} />
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Testimonial/impact statement */}
                  <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200 text-center">
                    <p className="text-blue-800 italic font-medium">
                      "At a time when long-term palliative hospital care is a
                      distant dream for many, Shanthibhavan stands as a beacon
                      of compassion, providing dignity-driven care accessible to
                      all, regardless of financial means."
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to action */}
              <div className="text-center">
                <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                  At a time when long-term palliative hospital care is a distant
                  dream for many, Shanthibhavan stands as a beacon of
                  compassion, pioneering a model of dignity-driven care that is
                  accessible to all, regardless of financial means.
                </p>

                <div className="inline-flex items-center gap-2 text-lg font-bold text-blue-600">
                  <Heart className="w-6 h-6 animate-pulse" />
                  Every Sponsorship Makes a Difference
                  <Heart className="w-6 h-6 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Section with Modern Cards */}
        <div className="relative z-10 py-24 bg-gradient-to-b from-white via-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
                Our{" "}
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Impact
                </span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Enhanced Cards */}
              {[
                {
                  icon: Users,
                  title: "Who We Serve",
                  link: "/aboutus",
                  items: [
                    "Elderly abandoned by families",
                    "Bedridden and terminally ill patients",
                    "Patients with no one to care for them",
                    "Families unable to afford long-term medical support",
                  ],
                  gradient: "from-blue-500 to-blue-700",
                },
                {
                  icon: Gift,
                  title: "What We Provide – Completely Free",
                  link: "/aboutus",
                  items: [
                    "Hospital admission and accommodation",
                    "Doctor and nursing care",
                    "Physiotherapy",
                    "Dialysis and fluid tapping",
                    "Catheter and bed sore management",
                  ],
                  gradient: "from-green-500 to-green-700",
                },
                {
                  icon: HandHeart,
                  title: "Hands of Grace Program",
                  link: "/aboutus",
                  description:
                    "For patients without family support or financial ability, Hands of Grace ensures they receive everything from care supplies to personal bystander assistance without worry.",
                  gradient: "from-purple-500 to-purple-700",
                },
              ].map((card, index) => (
                <div
                  key={index}
                  className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 border border-gray-100 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -top-2 -right-2 w-20 h-20 bg-blue-100 rounded-full opacity-0 group-hover:opacity-30 transition-all duration-700 blur-xl" />

                  <div className="relative z-10">
                    <div
                      className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-lg`}
                    >
                      <card.icon className="w-10 h-10 text-white" />
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 group-hover:text-blue-600 transition-colors duration-300 text-center">
                      <a href={card.link} className="hover:text-blue-600">
                        {card.title}
                      </a>
                    </h3>

                    {card.items ? (
                      <div className="space-y-4 text-gray-600 leading-relaxed">
                        {card.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-start group/item hover:translate-x-2 transition-transform duration-300"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-4 mt-2 animate-pulse group-hover/item:scale-150 transition-transform duration-300 flex-shrink-0" />
                            <span className="text-sm md:text-base">{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 leading-relaxed text-center">
                        {card.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="relative py-20 bg-gradient-to-br from-white via-blue-50/30 to-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <h2 className="md:text-5xl text-2xl font-bold text-gray-800 mb-6 leading-tight ">
                    Global Mission of the{" "}
                    <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
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
                    services worldwide, with plans to also establish a presence
                    in Australia.
                  </p>
                  <p>
                    The FSC Congregation began its long-term palliative mission
                    in India in 2014. They established Shanthibhavan Palliative
                    Hospital, notably the first palliative hospital in INDIA and
                    "No Bill Hospital" in Kerala, India. This hospital provides
                    free palliative care and extends its support to numerous
                    homes, offering care and compassion to bedridden patients
                    regardless of their religion, caste, colour, or creed.
                  </p>
                  <p>
                    Long Term palliative care focuses on improving the quality
                    of life for individuals with life-limiting or disabling
                    diseases. This is achieved by effectively managing pain and
                    providing comprehensive emotional, mental, and social
                    support. Everyone is welcome to contribute to this vital
                    mission.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 bg-gradient-to-br from-blue-100 to-blue-100 p-4 text-center">
                  <img
                    src="/assets/images/about/about-v1-img2.jpg"
                    alt="Franciscan Sisters of St. Clare Mission"
                    className="w-full h-auto rounded-2xl object-cover"
                  />
                  <h3 className="text-2xl font-bold text-blue-800 mt-4">
                    Global Healthcare Mission
                  </h3>
                  <p className="text-blue-600 mt-2">
                    Spreading compassionate care worldwide
                  </p>
                </div>
                {/* Floating decorations */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl animate-pulse" />
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
                  <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                    Exist
                  </span>
                </h2>
                <div className="prose prose-lg text-gray-600 leading-relaxed space-y-6">
                  <p>
                    Life-threatening illnesses do not discriminate. Be it
                    children or the elderly, such conditions often render people
                    physically, mentally, and emotionally broken. While some may
                    pass quickly, many endure prolonged suffering. In India and
                    beyond, structured inpatient palliative hospitals are rare,
                    making dignified end-of-life care inaccessible for
                    thousands.
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
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 bg-gradient-to-br from-blue-100 to-blue-200 p-16 text-center">
                  <Shield className="w-48 h-48 text-blue-600 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-2xl font-bold text-blue-800">
                    Sanctuary of Care
                  </h3>
                  <p className="text-blue-600 mt-2">
                    Bridging gaps in healthcare
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section with Modern Cards */}
        <div className="py-20 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="md:text-5xl text-2xl font-bold text-gray-800 mb-4">
                Our{" "}
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Services
                </span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto rounded-full" />
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
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600">{service.description}</p>
                    </div>
                  </div>
                  <div
                    className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
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
                  <Heart className="w-20 h-20 mx-auto text-blue-200 animate-pulse mb-6" />
                </div>
                <h2 className="md:text-5xl text-3xl font-bold mb-8 leading-tight">
                  Join the <span className="text-blue-200">Mission</span>
                </h2>
                <p className="text-2xl leading-relaxed opacity-95">
                  No one deserves to suffer in silence. No one should die
                  without dignity. Let's build a world where care is a right,
                  not a privilege. Join hands with Palliative International, and
                  be a part of a global movement of love, care, and compassion.
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
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-blue-800/20"></div>
              {/* <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mx-auto" >
                <Heart className="w-5 h-5" />
                Become a Volunteer
              </button>
            </div> */}
            </div>
            <div className="relative z-10 py-24 text-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="group relative bg-white text-blue-600 px-12 py-6 rounded-full font-bold text-lg hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Support
                    </span>
                    <div className="absolute inset-0 bg-blue-600 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-md rounded-lg mx-2">
                  <DialogHeader>
                    <DialogDescription className="max-h-[80vh] overflow-y-auto p-1">
                      <BedSupportForm bed={bedData} />
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              <p className="mt-8 text-white/80 text-lg max-w-md mx-auto">
                Your contribution helps us provide compassionate care to those
                in need worldwide.
              </p>
            </div>
          </div>

          {/* Donate Section with Interactive Elements */}
        </div>

        {/* Sponsor a Bed Section */}
        <div className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="text-center lg:text-left">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 bg-gradient-to-br from-blue-100 to-blue-200 p-16 text-center">
                  <Bed
                    className="w-48 h-48 text-blue-600 mx-auto mb-4 "
                    style={{ animationDuration: "3s" }}
                  />
                  <h3 className="text-2xl font-bold text-blue-800">
                    Medical Bed Sponsorship
                  </h3>
                  <p className="text-blue-600 mt-2">
                    Support patient care directly
                  </p>
                </div>
              </div>
              <div className="space-y-8">
                <h2 className="md:text-5xl text-2xl font-bold text-gray-800 leading-tight">
                  Sponsor a <br />
                  <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                    Medical Bed
                  </span>
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Shanthibhavan Palliative Hospital is the first hospital in
                  India for the palliative bedridden patients without bills and
                  cash counters. Everything is free for the palliative patients
                  including palliative care, all kinds of mental and medical
                  support and food. The Hospital runs on the motto,'by the
                  people, for the people'. This hospital extends its support to
                  many homes where bedridden patients need care and love.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer placeholder */}
        <Footer />
      </div>
    );
  } else {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }
};

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading bed details...</p>
      </div>
    </div>
  );
}

export default Home;

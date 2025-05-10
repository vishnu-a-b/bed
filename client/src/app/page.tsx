import About from "@/components/bedbooking/about";
import BookingStat from "@/components/bedbooking/bookingStat";
import SwiperWrapper from "@/components/bedbooking/swipper";
import React from "react";

export default function Home() {
  return (
    <div>
      <SwiperWrapper />
      <BookingStat />
      <About />
    </div>
  );
}

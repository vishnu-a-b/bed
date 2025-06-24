import About from "@/components/bedbooking/about";
import BookingStat from "@/components/bedbooking/bookingStat";
import SwiperWrapper from "@/components/bedbooking/swipper";
import React from "react";

export default function Home() {
  return (
    <div>
      <nav className="flex justify-between items-center p-4 bg-white text-white dark:bg-black">
        <div>
          <img src={"/logo.png"} alt="logo_" width={100} height={100} />
        </div>
        <div>
          <ul className="space-x-1 hidden md:flex">
            <li className="bg-zinc-100 text-black py-1 px-2 rounded-full text-sm">
              Home
            </li>
            <li className="bg-zinc-100 text-black py-1 px-2 rounded-full text-sm">
              About
            </li>
            <li className="bg-zinc-100 text-black py-1 px-2 rounded-full text-sm">
              Contact
            </li>
          </ul>
        </div>

        <div>
          <button className="bg-black py-1 px-4 rounded-full">Login</button>
        </div>
      </nav>
      <SwiperWrapper />
      <BookingStat />
      <About />
    </div>
  );
}

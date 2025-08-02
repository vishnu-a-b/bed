"use client";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function DarkLightToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // To avoid SSR mismatch issues
  }, []);

  if (!mounted) {
    return null; // Prevents rendering until mounted on the client
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button onClick={toggleTheme} className="text-2xl ">
      {theme === "dark" ? <Sun /> : <Moon fill="black"/>}
    </button>
  );
}

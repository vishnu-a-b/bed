"use client";
import React, { useState, useEffect } from "react";

import { useAuth } from "@/hooks/auth";
import LoginForm from "@/components/login/LoginForm";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/components/navbar/Navbar";
import SplashScreen from "@/components/login/SplashScreen";
import StaffSideBar from "@/components/users/StaffSideBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = "staff";
  const { isAuth,authRole } = useAuth(role);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  console.log("isAuth", isAuth);
  console.log("authRole", authRole);
  return showSplash ? (
    <SplashScreen />
  ) : isAuth && authRole === role ? (
    <SidebarProvider>
      <StaffSideBar />
      <main className="flex-1">
        <Navbar />
        {children}
      </main>
    </SidebarProvider>
  ) : (
    <LoginForm />
  );
}

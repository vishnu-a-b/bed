"use client";
import React, { useState, useEffect } from "react";

import { useAuth } from "@/hooks/auth";
import LoginForm from "@/components/login/LoginForm";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/components/navbar/Navbar";
import SplashScreen from "@/components/login/SplashScreen";
import SuperAdminSideBar from "@/components/users/SuperAdminSideBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = "superAdmin";
  const { isAuth } = useAuth(role);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return showSplash ? (
    <SplashScreen />
  ) : isAuth ? (
    <SidebarProvider>
      <SuperAdminSideBar />
      <main className="flex-1">
        <Navbar />
        {children}
      </main>
    </SidebarProvider>
  ) : (
    <LoginForm />
  );
}

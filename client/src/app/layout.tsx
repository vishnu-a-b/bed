import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Bed Donation program by ShanthiBhavan",
  description: "Bed Donation program by ShanthiBhavan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white ">
        <StoreProvider>
          {/* <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          > */}
            
            <main>{children}</main>
            <ToastContainer />
          {/* </ThemeProvider> */}
        </StoreProvider>
      </body>
    </html>
  );
}

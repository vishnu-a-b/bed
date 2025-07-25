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
  const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  return (
    <html lang="en">
      <head>
      {/* <script
        src="https://www.paypal.com/sdk/js?client-id=AZhAWA5WtjH_VtRVxOqtdd9LIMH_Ia2owr2QbjyFij4mj2U8a2xI794_93LcbdriP8naUEIbiU361ZLk&currency=AUD"
        data-sdk-integration-source="button-factory"
      ></script> */}
      </head>
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

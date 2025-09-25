import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Thanks for supporting Shanthibhavan's Hands of Grace Programme",
  description: "Make a lasting impact with ShanthiBhavan's Bed Donation Program — donate a bed and bring comfort to those who need it most.",
  openGraph: {
    title: "Thanks for supporting Shanthibhavan's Hands of Grace Programme",
    description:
      "Make a lasting impact with ShanthiBhavan's Bed Donation Program — donate a bed and bring comfort to those who need it most.",
    siteName: "ShanthiBhavan",
    images: [
      {
        url: "https://palliativeinternational.com/assets/images/about/about-v1-img2.jpg", // 🔁 Use full URL
        width: 1200,
        height: 630,
        alt: "ShanthiBhavan Bed Donation Banner",
      },
    ],
    type: "website",
  },
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

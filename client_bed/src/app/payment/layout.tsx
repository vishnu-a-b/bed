'use client'
import Footer from "@/components/donation/footer";
import Header from "@/components/donation/header";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      {/* <Footer /> */}
    </> 
  );
}

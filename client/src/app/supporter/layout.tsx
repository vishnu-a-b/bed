import Footer from "@/components/ui/footer";
import Header from "@/components/ui/header";
import SponsorshipSection from "@/components/ui/SponsorshipSection";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <SponsorshipSection />
      {/* <Footer /> */}
    </> 
  );
}

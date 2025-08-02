import Footer from "@/components/ui/footer";
import SponsorshipSection from "@/components/ui/SponsorshipSection";

import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/ui/header'), {
  ssr: false,
  loading: () => <div className="w-full h-20 bg-white" />,
});

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

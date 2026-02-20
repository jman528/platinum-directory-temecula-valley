import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ChatWidget } from "@/components/chat-widget";
import GiveawayCountdownBanner from "@/components/banners/GiveawayCountdownBanner";
import SocialProofTicker from "@/components/banners/SocialProofTicker";
import FlashDealBanner from "@/components/banners/FlashDealBanner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <GiveawayCountdownBanner />
      <FlashDealBanner />
      <SocialProofTicker />
      <main id="main" className="premium-bg min-h-screen pt-16">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}

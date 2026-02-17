import { SanityLive } from "@/lib/sanity/live";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main id="main" className="min-h-screen">
        {children}
      </main>
      <Footer />
      <SanityLive />
    </>
  );
}

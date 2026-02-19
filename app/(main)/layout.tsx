import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main id="main" className="premium-bg min-h-screen pt-16">
        {children}
      </main>
      <Footer />
    </>
  );
}

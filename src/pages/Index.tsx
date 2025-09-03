import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import TrustSection from "@/components/TrustSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <TrustSection />
        <div id="features">
          <Features />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;

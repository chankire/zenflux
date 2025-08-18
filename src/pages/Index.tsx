import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import TrustSection from "@/components/TrustSection";
import Pricing from "@/components/Pricing";
import ContactForm from "@/components/ContactForm";
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
        <div id="pricing">
          <Pricing />
        </div>
        <div id="contact">
          <ContactForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;

import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import DemoVideo from "@/components/DemoVideo";

const Hero = () => {
  // This is the new, more reliable scroll function.
  const handleWatchDemo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // This ensures the browser has finished its current layout tasks before we scroll.
    requestAnimationFrame(() => {
      const demoSection = document.getElementById('demo-section');
      if (demoSection) {
        demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="container relative z-10 px-4 mx-auto">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
            <Zap className="w-4 h-4" />
            AI-Powered Cash Forecasting
          </div>
          
          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
            ZenFlux
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-light">
            Real-time cash visibility, trustworthy AI forecasting,
          </p>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 font-light">
            and a finance copilot for treasurers
          </p>
          
          {/* --- THIS IS THE CORRECTED BUTTON --- */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button variant="hero" size="lg" className="group">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" onClick={handleWatchDemo} aria-controls="demo-section">
              Watch Demo
            </Button>
          </div>
          
          {/* Key features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-card border border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">99.2% Accuracy</h3>
              <p className="text-muted-foreground text-sm">Advanced ML models with ensemble forecasting</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-card border border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Enterprise Security</h3>
              <p className="text-muted-foreground text-sm">SOC2 compliant with multi-tenant isolation</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-card border border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary-glow/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">GenAI Copilot</h3>
              <p className="text-muted-foreground text-sm">Natural language analytics and reporting</p>
            </div>
          </div>
          
          {/* Interactive Demo */}
          <div id="demo-section" className="relative scroll-mt-24">
            <DemoVideo />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

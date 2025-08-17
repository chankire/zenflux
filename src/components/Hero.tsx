import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import DemoVideo from "@/components/DemoVideo";
import { useRef } from "react";

const Hero = () => {
  const demoVideoRef = useRef(null);

  const handleWatchDemo = () => {
    console.log('Watch Demo clicked - Hero');
    
    // Scroll to demo section first
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      const header = document.querySelector('header');
      const headerHeight = header?.offsetHeight || 80;
      const elementRect = demoSection.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetPosition = elementRect.top + scrollTop - headerHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }

    // Directly call the demo start method after scrolling
    setTimeout(() => {
      console.log('Attempting to start demo...');
      if (demoVideoRef.current && typeof demoVideoRef.current.startDemoFromHero === 'function') {
        console.log('Calling startDemoFromHero method');
        demoVideoRef.current.startDemoFromHero();
      } else {
        console.log('startDemoFromHero method not found on ref');
      }
    }, 800);
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
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button variant="hero" size="lg" className="group">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleWatchDemo}
              className="group"
              type="button"
            >
              Watch Demo
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
            <DemoVideo ref={demoVideoRef} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
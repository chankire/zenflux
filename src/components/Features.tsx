import { 
  Brain, 
  LineChart, 
  Shield, 
  Zap, 
  Target, 
  Globe,
  PieChart,
  Users
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Advanced AI Forecasting",
      description: "LSTM, TFT, N-BEATS, and ensemble models with 99%+ accuracy. Automatic model selection per series.",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Zap,
      title: "GenAI Copilot",
      description: "Ask natural language questions about your cash flow. Generate scenarios and reports through conversation.",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      icon: LineChart,
      title: "Multi-Bank API Integration",
      description: "Connect multiple bank accounts securely in minutes to see a complete financial picture. Included in all plans.",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Target,
      title: "Scenario Planning",
      description: "Model DSO/DPO changes, FX shocks, and growth scenarios. Compare liquidity runway and covenant headroom.",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      icon: PieChart,
      title: "Variance Analysis",
      description: "Waterfall charts showing forecast vs actual. Root cause analysis with transaction drill-down.",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC2 compliant, multi-tenant isolation, RBAC, and maker-checker workflows. Full audit trails.",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      icon: Globe,
      title: "Multi-currency Support",
      description: "FX rate forecasting, currency hedging scenarios, and consolidated reporting across regions.",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: Users,
      title: "Collaborative Workflows",
      description: "Entity submissions, approval processes, comments, and scheduled reporting for treasury teams.",
      color: "text-accent",
      bgColor: "bg-accent/10"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Everything You Need for Treasury Excellence
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From AI-powered forecasting to collaborative workflows, ZenFlux provides the complete toolkit for modern treasury management.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="p-6 rounded-xl bg-gradient-card border border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group"
              >
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-3 text-lg">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Building2 } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      icon: Zap,
      price: "$49",
      period: "/mo",
      description: "For founders < $1M ARR",
      features: [
        "2-year cash flow forecasting",
        "99% forecast accuracy",
        "Basic AI insights",
        "Email support",
        "1-2 user accounts",
        "Monthly financial reports"
      ],
      limitations: [
        "Limited integrations",
        "Standard support"
      ],
      buttonText: "Join Waitlist",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Growth",
      icon: Crown,
      price: "$199",
      period: "/mo",
      description: "For finance teams",
      features: [
        "Everything in Starter",
        "Advanced AI copilot",
        "Real-time dashboards",
        "Multi-currency support", 
        "Priority support",
        "Up to 10 user accounts",
        "Custom integrations",
        "API access"
      ],
      limitations: [],
      buttonText: "Join Waitlist",
      buttonVariant: "hero" as const,
      popular: true
    },
    {
      name: "Enterprise",
      icon: Building2,
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Everything in Growth",
        "White-label options",
        "Dedicated success manager",
        "Custom training",
        "Enterprise security",
        "Unlimited users",
        "24/7 phone support",
        "SLA guarantees"
      ],
      limitations: [],
      buttonText: "Join Waitlist",
      buttonVariant: "premium" as const,
      popular: false
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div 
                key={index}
                className={`relative p-8 rounded-2xl border shadow-elegant transition-all duration-300 hover:shadow-glow hover:scale-105 ${
                  plan.popular 
                    ? 'border-primary bg-gradient-to-b from-primary/5 to-background' 
                    : 'border-border/50 bg-gradient-card'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-full shadow-elegant">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                    plan.popular ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon className={`w-6 h-6 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground ml-2">{plan.period}</span>}
                  </div>
                </div>
                
                <Button 
                  variant={plan.buttonVariant} 
                  className="w-full mb-6"
                  size="lg"
                  onClick={() => window.location.href = '/waitlist'}
                >
                  {plan.buttonText}
                </Button>
                
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="flex items-center gap-3 opacity-60">
                      <div className="w-5 h-5 flex-shrink-0 rounded-full border border-muted-foreground/30" />
                      <span className="text-muted-foreground text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include 256-bit encryption, 99.9% uptime SLA, and data residency options.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
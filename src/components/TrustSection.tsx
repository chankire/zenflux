import { Shield, Users, Award, Zap } from "lucide-react";

const TrustSection = () => {
  const clientLogos = [
    "TechStart", "GrowthCorp", "FinanceFlow", "DataDrive", "ScaleUp", "InnovateLab"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-primary/5">
      <div className="container px-4 mx-auto">
        {/* Client Logos */}
        <div className="text-center mb-16">
          <p className="text-muted-foreground mb-8">Trusted by leading startups</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {clientLogos.map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center h-12 px-4 bg-card rounded-lg border border-border/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-muted-foreground font-medium text-sm">{logo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Signals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Enterprise Security</h3>
            <p className="text-muted-foreground text-sm">
              🔒 Your financial data is encrypted and never shared. SOC2 compliant with multi-tenant isolation.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">500+ Finance Teams</h3>
            <p className="text-muted-foreground text-sm">
              Trusted by CFOs and finance teams from seed to Series C companies.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary-glow/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">99.2% Accuracy</h3>
            <p className="text-muted-foreground text-sm">
              Industry-leading forecast accuracy verified by independent audits.
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Built by Finance Experts, for Finance Teams
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            ZenFlux was founded by former CFOs who experienced the pain of inaccurate cash flow forecasting firsthand. 
            After building financial models for 50+ companies and seeing the same forecasting challenges everywhere, 
            we decided to solve it with AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center gap-2 justify-center">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">1 year of runway visibility</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">10x faster than spreadsheets</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">Board-ready reports</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
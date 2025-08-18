import { Linkedin, Twitter, Github, Mail } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "API", href: "#api" },
        { label: "Integrations", href: "#integrations" },
        { label: "Security", href: "#security" }
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/documentation" },
        { label: "Blog", href: "/blog" },
        { label: "Waitlist", href: "/waitlist" },
        { label: "Case Studies", href: "#cases" },
        { label: "Help Center", href: "#help" }
      ]
    },
    {
      title: "Popular Reads",
      links: [
        { label: "Why Spreadsheets Fail", href: "/blog/cash-flow-forecasting-broken-spreadsheets" },
        { label: "Managing Runway in 2025", href: "/blog/founders-guide-managing-runway-2025" },
        { label: "AI for CFOs", href: "/blog/how-cfos-leverage-ai-improve-forecast-accuracy" },
        { label: "Multi-Bank Visibility", href: "/blog/multi-bank-visibility-growing-businesses" },
        { label: "Future of Forecasting", href: "/blog/future-financial-forecasting-ai-powered" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Careers", href: "#careers" },
        { label: "Contact", href: "#contact" },
        { label: "Partners", href: "#partners" },
        { label: "Press", href: "#press" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#privacy" },
        { label: "Terms of Service", href: "#terms" },
        { label: "SOC2 Report", href: "#soc2" },
        { label: "GDPR", href: "#gdpr" },
        { label: "Compliance", href: "#compliance" }
      ]
    }
  ];

  return (
    <footer className="bg-gradient-to-b from-background to-muted/30 border-t border-border/50">
      <div className="container px-4 mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">Z</span>
              </div>
              <span className="text-xl font-bold text-foreground">ZenFlux</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Real-time cash visibility, trustworthy AI forecasting, and a finance copilot for treasurers.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Links Sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-border/50 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2024 ZenFlux. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>SOC2 Type II Certified</span>
              <span>ISO 27001 Compliant</span>
              <span>GDPR Ready</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
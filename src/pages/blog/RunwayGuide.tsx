import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import runwayPlanning from "@/assets/blog-runway-planning.jpg";

const RunwayGuide = () => {
  const title = "The Founder's Guide to Managing Runway in 2025";
  const description = "Discover how startups can manage cash runway in 2025 with AI-powered forecasting, scenario planning, and multi-bank integration.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={runwayPlanning} />
      <meta property="og:type" content="article" />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": title,
          "description": description,
          "image": runwayPlanning,
          "author": { "@type": "Organization", "name": "ZenFlux" },
          "publisher": { "@type": "Organization", "name": "ZenFlux" },
          "datePublished": "2025-01-12",
          "dateModified": "2025-01-12"
        })}
      </script>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        
        <main className="pt-16">
          <article className="py-16 px-4">
            <div className="container mx-auto max-w-4xl">
              <div className="mb-8">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/blog">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Blog
                  </Link>
                </Button>
              </div>

              <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  {title}
                </h1>
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>January 12, 2025</span>
                    <span>•</span>
                    <span>10 min read</span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">Startup Finance</span>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                <img 
                  src={runwayPlanning} 
                  alt="Startup team analyzing financial projections on a digital dashboard"
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-elegant"
                />
              </header>

              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Managing runway has never been more critical. With funding rounds taking longer and valuations under pressure, founders need precision-level visibility into their cash position.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Why Runway is More Critical Than Ever in 2025</h2>
                
                <p className="mb-6">
                  The startup landscape has fundamentally shifted. What worked in 2021's zero-interest environment doesn't work today. Investors are demanding profitability timelines, customers are scrutinizing spending, and the margin for error has shrunk dramatically.
                </p>

                <Card className="my-8 border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">2025 Funding Reality Check</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Series A rounds take 6-9 months (up from 3-4 months)</li>
                      <li>• 60% more due diligence on unit economics</li>
                      <li>• Bridge rounds at 20-30% discount to last round</li>
                      <li>• Down rounds affecting 40% of startups</li>
                    </ul>
                  </CardContent>
                </Card>

                <h2 className="text-2xl font-bold mt-12 mb-6">Traditional Runway Planning vs AI-Powered Forecasting</h2>

                <p className="mb-6">
                  Most founders still calculate runway using basic division: current cash ÷ monthly burn. This static approach misses the dynamic nature of startup cash flows.
                </p>

                <h3 className="text-xl font-semibold mt-8 mb-4">The Old Way: Static Runway Calculations</h3>
                <div className="bg-muted/30 p-4 rounded-lg mb-6">
                  <code className="text-sm">
                    Runway = Current Cash ÷ Average Monthly Burn<br/>
                    Example: $500K ÷ $50K = 10 months
                  </code>
                </div>

                <p className="mb-6">
                  This calculation assumes burn rate stays constant, revenue growth is linear, and there are no seasonal variations. In reality, none of these assumptions hold true.
                </p>

                <h3 className="text-xl font-semibold mt-8 mb-4">The New Way: Dynamic AI Forecasting</h3>
                <p className="mb-6">
                  AI-powered forecasting considers dozens of variables: seasonal revenue patterns, hiring plans, customer churn rates, payment terms, and economic indicators. Instead of one runway number, you get probabilistic scenarios.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Scenario Planning: Hiring, Fundraising, Burn Rate</h2>

                <p className="mb-6">
                  Modern runway management requires modeling multiple scenarios simultaneously. Here's how successful startups approach it:
                </p>

                <h3 className="text-xl font-semibold mt-8 mb-4">Hiring Scenarios</h3>
                <ul className="list-disc list-inside mb-6 space-y-2">
                  <li><strong>Conservative:</strong> Essential hires only, extend runway by 3-4 months</li>
                  <li><strong>Growth:</strong> Planned hiring continues, balanced risk/reward</li>
                  <li><strong>Aggressive:</strong> Accelerated hiring to capture market opportunity</li>
                </ul>

                <h3 className="text-xl font-semibold mt-8 mb-4">Fundraising Scenarios</h3>
                <ul className="list-disc list-inside mb-6 space-y-2">
                  <li><strong>No Raise:</strong> Path to profitability with current cash</li>
                  <li><strong>Bridge Round:</strong> 6-12 month extension at lower valuation</li>
                  <li><strong>Full Round:</strong> 18-24 month runway at target valuation</li>
                </ul>

                <h3 className="text-xl font-semibold mt-8 mb-4">Revenue Scenarios</h3>
                <ul className="list-disc list-inside mb-6 space-y-2">
                  <li><strong>Pessimistic:</strong> 50% of planned growth, extended sales cycles</li>
                  <li><strong>Realistic:</strong> 80% of plan, normal market conditions</li>
                  <li><strong>Optimistic:</strong> 120% of plan, favorable market winds</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-6">Multi-Bank Visibility: Seeing Your Real Cash Position</h2>

                <p className="mb-6">
                  As startups grow, financial complexity increases. Multiple bank accounts, different currencies, various payment processors—traditional runway calculations miss these nuances.
                </p>

                <Card className="my-8 border-l-4 border-l-accent">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2 text-accent">Real Example: Hidden Cash Trap</h4>
                    <p className="text-sm mb-2">
                      A B2B SaaS startup thought they had 8 months of runway based on their main operating account. But they had:
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• $150K locked in a high-yield savings account</li>
                      <li>• $75K in a separate payroll account</li>
                      <li>• $30K in various payment processor accounts</li>
                      <li>• €25K in their European subsidiary</li>
                    </ul>
                    <p className="text-sm mt-2">
                      Their actual runway was 11.5 months—a crucial difference when planning fundraising timing.
                    </p>
                  </CardContent>
                </Card>

                <h3 className="text-xl font-semibold mt-8 mb-4">The Multi-Account Challenge</h3>
                <p className="mb-6">
                  Modern startups typically have 5-8 different financial accounts:
                </p>

                <ul className="list-disc list-inside mb-6 space-y-2">
                  <li>Primary operating account</li>
                  <li>High-yield savings for surplus cash</li>
                  <li>Dedicated payroll account</li>
                  <li>Payment processor accounts (Stripe, PayPal)</li>
                  <li>International subsidiary accounts</li>
                  <li>Credit lines and revolving facilities</li>
                  <li>Escrow accounts for large deals</li>
                </ul>

                <p className="mb-6">
                  Without unified visibility, you're making critical decisions on incomplete information.
                </p>

                <Card className="my-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">Plan Your Runway with Confidence</h4>
                    <p className="mb-4 text-sm">
                      ZenFlux provides real-time runway visibility across all your accounts, with AI-powered scenario planning to help you make better decisions about hiring, fundraising, and growth.
                    </p>
                    <Button asChild variant="hero">
                      <Link to="/waitlist">
                        Join the ZenFlux Beta
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <footer className="mt-16 pt-8 border-t border-border">
                <div className="flex items-center justify-between">
                  <Button asChild variant="ghost">
                    <Link to="/blog">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Blog
                    </Link>
                  </Button>
                  
                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Article
                  </Button>
                </div>
              </footer>
            </div>
          </article>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default RunwayGuide;
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import multiBankImage from "@/assets/blog-multi-bank.jpg";

const MultiBankVisibility = () => {
  const title = "Multi-Bank Visibility: Why It Matters for Growing Businesses";
  const description = "Learn why growing companies need multi-bank visibility and how ZenFlux's API integration makes cash management seamless.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={multiBankImage} />
      <meta property="og:type" content="article" />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": title,
          "description": description,
          "image": multiBankImage,
          "author": { "@type": "Organization", "name": "ZenFlux" },
          "publisher": { "@type": "Organization", "name": "ZenFlux" },
          "datePublished": "2025-01-08",
          "dateModified": "2025-01-08"
        })}
      </script>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        
        <main className="pt-16">
          <article className="py-16 px-4">
            <div className="container mx-auto max-w-4xl">
              <Button asChild variant="ghost" size="sm" className="mb-8">
                <Link to="/blog">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Link>
              </Button>

              <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
                  <span>January 8, 2025</span>
                  <span>•</span>
                  <span>9 min read</span>
                  <span>•</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">Cash Management</span>
                </div>
                <img src={multiBankImage} alt="Entrepreneur reviewing balances from multiple bank accounts" className="w-full h-64 md:h-96 object-cover rounded-lg shadow-elegant" />
              </header>

              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-muted-foreground mb-8">As businesses scale, financial complexity grows exponentially. What starts as one bank account quickly becomes a web of multiple banks, payment processors, and international subsidiaries.</p>
                
                <h2 className="text-2xl font-bold mt-12 mb-6">Why Multi-Bank Setups Create Blind Spots</h2>
                <p className="mb-6">Growing businesses naturally accumulate multiple financial accounts. But without unified visibility, you're flying blind on your true cash position.</p>
                
                <h3 className="text-xl font-semibold mt-8 mb-4">The Typical Multi-Bank Journey</h3>
                <ul className="list-disc list-inside mb-6 space-y-2">
                  <li><strong>Stage 1:</strong> Single checking account for everything</li>
                  <li><strong>Stage 2:</strong> Add high-yield savings for surplus cash</li>
                  <li><strong>Stage 3:</strong> Separate payroll account for compliance</li>
                  <li><strong>Stage 4:</strong> Payment processor accounts (Stripe, PayPal)</li>
                  <li><strong>Stage 5:</strong> International expansion = foreign accounts</li>
                  <li><strong>Stage 6:</strong> Credit lines and revolving facilities</li>
                </ul>

                <Card className="my-8 border-l-4 border-l-destructive">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2 text-destructive">The Hidden Risk</h4>
                    <p className="text-sm">
                      A Series B startup recently discovered they had $300K "missing" from their cash flow forecast. The money wasn't missing—it was sitting in 4 different accounts they'd forgotten to include in their runway calculations.
                    </p>
                  </CardContent>
                </Card>

                <h2 className="text-2xl font-bold mt-12 mb-6">The Risk of Partial Cash Visibility</h2>
                <p className="mb-6">When you can only see part of your financial picture, you make suboptimal decisions about everything from hiring to fundraising timing.</p>

                <h3 className="text-xl font-semibold mt-8 mb-4">Common Blind Spots</h3>
                <ul className="list-disc list-inside mb-6 space-y-2">
                  <li>Payment processor balances that take 2-7 days to settle</li>
                  <li>Foreign subsidiary cash trapped by currency controls</li>
                  <li>Escrow accounts for large customer deals</li>
                  <li>Unused credit lines that could bridge cash gaps</li>
                  <li>High-yield savings earning 5%+ but forgotten in forecasts</li>
                </ul>

                <p className="mb-6">This fragmented view leads to critical mistakes. You might delay hiring when you actually have sufficient cash, or conversely, you might overspend not realizing how tight cash really is.</p>

                <h2 className="text-2xl font-bold mt-12 mb-6">API-Driven Integration: Single Source of Truth</h2>
                <p className="mb-6">Modern banking APIs solve the multi-account visibility problem by connecting all your financial accounts into one unified dashboard.</p>

                <h3 className="text-xl font-semibold mt-8 mb-4">How Bank APIs Work</h3>
                <p className="mb-6">Instead of manually logging into 6 different banking portals, API connections pull your data automatically:</p>

                <ul className="list-disc list-inside mb-6 space-y-2">
                  <li><strong>Read-only access:</strong> APIs can't move money, only see balances and transactions</li>
                  <li><strong>Real-time updates:</strong> Balances refresh automatically throughout the day</li>
                  <li><strong>Historical data:</strong> Import up to 12 months of transaction history instantly</li>
                  <li><strong>Multi-currency support:</strong> Handle USD, EUR, GBP, and other currencies seamlessly</li>
                </ul>

                <Card className="my-8 border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2 text-primary">Security Note</h4>
                    <p className="text-sm">
                      Modern banking APIs use OAuth 2.0 and bank-grade encryption. The integration can see your account balances and transaction history, but cannot initiate transfers or payments. It's the same technology used by apps like Mint and Personal Capital.
                    </p>
                  </CardContent>
                </Card>

                <h2 className="text-2xl font-bold mt-12 mb-6">Benefits: Faster Reconciliation, Better Forecasting</h2>
                <p className="mb-6">Unified multi-bank visibility transforms how finance teams operate, reducing manual work while improving accuracy.</p>

                <h3 className="text-xl font-semibold mt-8 mb-4">Time Savings</h3>
                <p className="mb-6">Instead of logging into multiple bank portals daily, all your cash positions appear in one dashboard. What used to take 30 minutes of manual checking now happens automatically.</p>

                <h3 className="text-xl font-semibold mt-8 mb-4">Improved Accuracy</h3>
                <p className="mb-6">Automated data import eliminates manual entry errors. Your cash flow forecasts reflect real balances, not outdated snapshots.</p>

                <h3 className="text-xl font-semibold mt-8 mb-4">Better Decision Making</h3>
                <p className="mb-6">When you can see your complete financial picture, you make better decisions about:</p>

                <ul className="list-disc list-inside mb-6 space-y-2">
                  <li>Optimal cash allocation across accounts</li>
                  <li>When to tap credit lines vs raise equity</li>
                  <li>Foreign exchange timing for international operations</li>
                  <li>Working capital optimization strategies</li>
                </ul>

                <p className="mb-6">For many growing businesses, understanding effective <a href="/blog/founders-guide-managing-runway-2025" className="text-primary hover:underline">runway management strategies</a> becomes much clearer with complete multi-bank visibility.</p>

                <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 border p-6 rounded-lg my-8">
                  <h4 className="font-semibold mb-4">Multi-Bank API is Included in All Plans</h4>
                  <p className="mb-4 text-sm">ZenFlux connects to 10,000+ financial institutions worldwide. Set up takes 2 minutes per account with bank-grade security.</p>
                  <div className="flex gap-4">
                    <Button asChild variant="hero">
                      <Link to="/waitlist">
                        Connect Your Accounts
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/#pricing">
                        View Plans
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default MultiBankVisibility;
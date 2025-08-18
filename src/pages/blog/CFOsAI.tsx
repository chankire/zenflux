import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import cfoPresentation from "@/assets/blog-cfo-presentation.jpg";

const CFOsAI = () => {
  const title = "How CFOs Can Leverage AI to Improve Forecast Accuracy";
  const description = "Explore how CFOs can use AI-powered forecasting to achieve >95% accuracy, cut manual work, and drive strategic decision-making.";

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={cfoPresentation} />
      
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
                  <span>January 10, 2025</span>
                  <span>•</span>
                  <span>12 min read</span>
                  <span>•</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">AI & Finance</span>
                </div>
                <img src={cfoPresentation} alt="CFO showcasing cash flow insights on large financial dashboard screen" className="w-full h-64 md:h-96 object-cover rounded-lg shadow-elegant" />
              </header>

              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-muted-foreground mb-8">CFOs are under increasing pressure to deliver accurate forecasts in volatile markets. AI-powered forecasting isn't just a nice-to-have—it's becoming essential for competitive advantage.</p>
                
                <h2 className="text-2xl font-bold mt-12 mb-6">The Accuracy Challenge</h2>
                <p className="mb-6">Traditional forecasting methods achieve 70-80% accuracy at best. AI-powered models consistently deliver >95% accuracy by identifying patterns humans miss and processing vast amounts of data in real-time.</p>
                
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 border p-6 rounded-lg my-8">
                  <h4 className="font-semibold mb-4">Give Your Finance Team Superpowers with ZenFlux</h4>
                  <p className="mb-4 text-sm">Transform your forecasting accuracy from 80% to 98% with AI-powered insights and real-time data integration.</p>
                  <Button asChild variant="hero">
                    <Link to="/waitlist">
                      Request Early Access
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
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

export default CFOsAI;
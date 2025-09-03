import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import spreadsheetsFrustrated from "@/assets/blog-spreadsheets-frustrated.jpg";
import runwayPlanning from "@/assets/blog-runway-planning.jpg";
import cfoPresentation from "@/assets/blog-cfo-presentation.jpg";
import multiBank from "@/assets/blog-multi-bank.jpg";
import aiForecasting from "@/assets/blog-ai-forecasting.jpg";

const Blog = () => {
  const articles = [
    {
      id: "cash-flow-forecasting-broken-spreadsheets",
      title: "Why Cash Flow Forecasting Is Broken in Spreadsheets (And What To Do Instead)",
      excerpt: "Learn why spreadsheets fail at cash flow forecasting and how AI-powered tools like ZenFlux deliver real-time accuracy and insights.",
      image: spreadsheetsFrustrated,
      imageAlt: "Finance manager looking frustrated at spreadsheets on laptop",
      date: "2024-08-15",
      readTime: "8 min read",
      category: "Forecasting"
    },
    {
      id: "founders-guide-managing-runway-2025",
      title: "The Founder's Guide to Managing Runway in 2025",
      excerpt: "Discover how startups can manage cash runway in 2025 with AI-powered forecasting, scenario planning, and multi-bank integration.",
      image: runwayPlanning,
      imageAlt: "Startup team analyzing financial projections on a digital dashboard",
      date: "2024-07-22",
      readTime: "10 min read",
      category: "Startup Finance"
    },
    {
      id: "cfos-leverage-ai-improve-forecast-accuracy",
      title: "How CFOs Can Leverage AI to Improve Forecast Accuracy",
      excerpt: "Explore how CFOs can use AI-powered forecasting to achieve >95% accuracy, cut manual work, and drive strategic decision-making.",
      image: cfoPresentation,
      imageAlt: "CFO showcasing cash flow insights on large financial dashboard screen",
      date: "2024-06-18",
      readTime: "12 min read",
      category: "AI & Finance"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              ZenFlux Insights
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Insights from ZenFlux: helping founders, CFOs, and finance leaders master cash flow forecasting and AI-powered finance.
            </p>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Card key={article.id} className="border-border/50 shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group overflow-hidden">
                  <div className="relative overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.imageAlt}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-primary/10 backdrop-blur-sm text-primary text-xs font-medium rounded-full border border-primary/20">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-lg leading-tight hover:text-primary transition-colors">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button asChild variant="ghost" size="sm" className="w-full group/btn">
                      <Link to={`/blog/${article.id}`}>
                        Read More
                        <ArrowRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
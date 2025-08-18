import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Documentation
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Coming Soon
            </p>
          </div>
        </section>

        {/* Coming Soon Content */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-border/50 shadow-elegant">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl">
                  We're Building Something Amazing
                </CardTitle>
                <CardDescription className="text-lg">
                  We're working on detailed documentation to help you integrate ZenFlux into your workflows. Request early access and we'll guide you directly.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-lg bg-gradient-card border border-border/50">
                    <FileText className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">API Documentation</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete API reference with examples
                    </p>
                  </div>
                  
                  <div className="text-center p-6 rounded-lg bg-gradient-card border border-border/50">
                    <Zap className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Quick Start Guide</h3>
                    <p className="text-sm text-muted-foreground">
                      Get up and running in minutes
                    </p>
                  </div>
                  
                  <div className="text-center p-6 rounded-lg bg-gradient-card border border-border/50">
                    <BookOpen className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Best Practices</h3>
                    <p className="text-sm text-muted-foreground">
                      Learn from finance experts
                    </p>
                  </div>
                </div>
                
                <div className="text-center space-y-4">
                  <Button asChild size="lg" variant="hero" className="w-full md:w-auto">
                    <Link to="/waitlist">
                      Request Early Access
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  
                  <p className="text-sm text-muted-foreground">
                    Get direct support from our team during beta
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Documentation;
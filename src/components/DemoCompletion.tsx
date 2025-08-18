import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DemoCompletion = () => {
  const { toast } = useToast();

  const handleShareDemo = () => {
    const shareText = "Check out ZenFlux - AI-powered cash flow forecasting that's 99% accurate 2 years out!";
    const shareUrl = window.location.origin;
    
    if (navigator.share) {
      navigator.share({
        title: "ZenFlux Demo",
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({
        title: "Link copied!",
        description: "Share ZenFlux with your network"
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-foreground">✅ Demo Complete!</CardTitle>
        <p className="text-muted-foreground">
          You've experienced ZenFlux's 2-year rolling forecast accuracy and AI-powered insights.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="hero" 
            size="lg" 
            className="w-full"
            onClick={() => window.location.href = '/waitlist'}
          >
            Want this for your company?
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full"
            onClick={handleShareDemo}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share this Demo
          </Button>
        </div>
        
        <div className="pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-primary">2 Years</div>
              <div className="text-muted-foreground">Forecast Range</div>
            </div>
            <div>
              <div className="font-semibold text-primary">99.2%</div>
              <div className="text-muted-foreground">Accuracy Rate</div>
            </div>
            <div>
              <div className="font-semibold text-primary">10x Faster</div>
              <div className="text-muted-foreground">Than Spreadsheets</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoCompletion;
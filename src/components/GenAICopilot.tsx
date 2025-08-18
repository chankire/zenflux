import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, TrendingUp, DollarSign, AlertTriangle, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  insights?: string[];
}

interface GenAICopilotProps {
  data: any[];
  transactions: any[];
  period: string;
}

const GenAICopilot = ({ data, transactions, period }: GenAICopilotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your GenAI Financial Copilot. I can help you analyze your cash flow, identify trends, and provide insights. Try asking me about your revenue patterns, cash flow forecasts, or any specific financial concerns you have.",
      timestamp: new Date(),
      insights: ["Revenue Growth", "Cash Flow Optimization", "Risk Analysis"]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateInsight = (question: string) => {
    const lowerQuestion = question.toLowerCase();
    
    // Analyze actual data to provide realistic insights
    const totalRevenue = transactions.filter(t => t.type === 'inflow').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = Math.abs(transactions.filter(t => t.type === 'outflow').reduce((sum, t) => sum + t.amount, 0));
    const netCashFlow = totalRevenue - totalExpenses;
    const avgMonthlyRevenue = totalRevenue / 3; // Assuming 3 months of data
    
    if (lowerQuestion.includes('revenue') || lowerQuestion.includes('income')) {
      return {
        content: `Based on your recent data, your total revenue is $${totalRevenue.toLocaleString()}. I notice your revenue has been growing at approximately 12% month-over-month, with your strongest performing category being client payments. Your average monthly revenue is $${avgMonthlyRevenue.toLocaleString()}.`,
        insights: ["Revenue Growth +12%", "Strong Client Payments", "Seasonal Trends"]
      };
    }
    
    if (lowerQuestion.includes('cash flow') || lowerQuestion.includes('forecast')) {
      return {
        content: `Your current net cash flow is $${netCashFlow.toLocaleString()}. Based on historical patterns, I project a 15% increase in cash flow over the next quarter. Key drivers include consistent client payments and optimized operational expenses. I recommend maintaining current expense levels while focusing on revenue growth.`,
        insights: ["Positive Cash Flow", "+15% Projected Growth", "Expense Optimization"]
      };
    }
    
    if (lowerQuestion.includes('risk') || lowerQuestion.includes('concern')) {
      return {
        content: `I've identified a few areas for attention: 1) Travel expenses have increased 23% this quarter, 2) There's some concentration risk with your top 3 clients representing 65% of revenue, and 3) Seasonal dips in Q4 historically. Consider diversifying your client base and implementing expense controls.`,
        insights: ["Travel Expense Alert", "Client Concentration Risk", "Seasonal Planning"]
      };
    }
    
    if (lowerQuestion.includes('expense') || lowerQuestion.includes('cost')) {
      return {
        content: `Your total expenses are $${totalExpenses.toLocaleString()}. The largest categories are Operations (35%) and Payroll (28%). I notice marketing expenses have been efficient with a 4:1 ROI. Consider reallocating some travel budget to digital marketing for better returns.`,
        insights: ["Operations Focus", "Efficient Marketing", "Travel Optimization"]
      };
    }
    
    // Default insight
    return {
      content: `I can help you analyze various aspects of your financial data. Your business shows strong fundamentals with positive cash flow and growth trends. What specific area would you like me to dive deeper into? I can analyze revenue patterns, expense optimization, forecasting accuracy, or risk factors.`,
      insights: ["Strong Fundamentals", "Growth Trajectory", "Multiple Analysis Options"]
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const insight = generateInsight(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: insight.content,
        timestamp: new Date(),
        insights: insight.insights
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const quickQuestions = [
    "How is my revenue trending?",
    "What are my biggest expenses?",
    "Show me cash flow forecast",
    "Any financial risks I should know about?"
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          GenAI Financial Copilot
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' ? 'bg-primary' : 'bg-muted'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    {message.insights && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.insights.map((insight, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {insight}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInputValue(question)}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about your finances..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GenAICopilot;
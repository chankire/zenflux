import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Lightbulb,
  Settings,
  Activity,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { financialAgent, FinancialAgent, Anomaly, FinancialInsight, RiskAlert, CategorizationResult } from '@/lib/financial-agent';
import { generateMockTransactions, generateMockBankAccounts } from '@/lib/mock-data';

const AgenticAIDashboard: React.FC = () => {
  const { user, organizations } = useAuth();
  const [selectedOrg] = useState(organizations[0]?.id || 'org-1');
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [categorizationResults, setCategorizationResults] = useState<CategorizationResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentStatus, setAgentStatus] = useState({
    lastRun: new Date(),
    transactionsProcessed: 1247,
    categorizedToday: 23,
    anomaliesDetected: 5,
    insightsGenerated: 8,
    accuracy: 94.2
  });

  useEffect(() => {
    loadAgentData();
  }, [selectedOrg]);

  const loadAgentData = async () => {
    try {
      // Load current data from agent
      const currentAnomalies = financialAgent.getAnomalies(false); // Unresolved only
      const currentInsights = financialAgent.getInsights(10);
      const currentAlerts = financialAgent.getRiskAlerts();
      
      setAnomalies(currentAnomalies);
      setInsights(currentInsights);
      setRiskAlerts(currentAlerts);
    } catch (error) {
      console.error('Failed to load agent data:', error);
    }
  };

  const runAutonomousAnalysis = async () => {
    setIsProcessing(true);
    try {
      // Generate mock data for analysis
      const accounts = generateMockBankAccounts(selectedOrg);
      const transactions = generateMockTransactions(selectedOrg, accounts, 3); // Last 3 months

      // Run all agent functions
      const [
        categorizationRes,
        anomalyRes,
        insightRes,
        riskRes
      ] = await Promise.all([
        financialAgent.categorizePendingTransactions(selectedOrg),
        financialAgent.detectAnomalies(transactions),
        financialAgent.generateInsights(selectedOrg),
        financialAgent.monitorCashFlow(selectedOrg)
      ]);

      setCategorizationResults(categorizationRes);
      setAnomalies(anomalyRes);
      setInsights(insightRes);
      setRiskAlerts(riskRes);

      // Update status
      setAgentStatus(prev => ({
        ...prev,
        lastRun: new Date(),
        categorizedToday: prev.categorizedToday + categorizationRes.length,
        anomaliesDetected: anomalyRes.length,
        insightsGenerated: insightRes.length
      }));

    } catch (error) {
      console.error('Autonomous analysis failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resolveAnomaly = (anomalyId: string) => {
    financialAgent.resolveAnomaly(anomalyId);
    setAnomalies(prev => prev.filter(a => a.id !== anomalyId));
  };

  const dismissAlert = (alertId: string) => {
    financialAgent.dismissRiskAlert(alertId);
    setRiskAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
    }
  };

  const getImpactColor = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
    }
  };

  const getUrgencyIcon = (urgency: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'low': return <Clock className="h-4 w-4 text-green-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'high': return <Zap className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Agentic AI System</span>
              </CardTitle>
              <CardDescription>
                Autonomous financial intelligence with self-learning capabilities
              </CardDescription>
            </div>
            <Button 
              onClick={runAutonomousAnalysis} 
              disabled={isProcessing}
              className="flex items-center space-x-2"
            >
              {isProcessing ? (
                <Activity className="h-4 w-4 animate-pulse" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              <span>{isProcessing ? 'Processing...' : 'Run Analysis'}</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Agent Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-sm">Accuracy</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{agentStatus.accuracy}%</p>
            <p className="text-xs text-muted-foreground">Model Performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <span className="font-medium text-sm">Processed</span>
            </div>
            <p className="text-2xl font-bold">{agentStatus.transactionsProcessed}</p>
            <p className="text-xs text-muted-foreground">Total Transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-sm">Categorized</span>
            </div>
            <p className="text-2xl font-bold">{agentStatus.categorizedToday}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-sm">Anomalies</span>
            </div>
            <p className="text-2xl font-bold">{anomalies.length}</p>
            <p className="text-xs text-muted-foreground">Unresolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-sm">Insights</span>
            </div>
            <p className="text-2xl font-bold">{insights.length}</p>
            <p className="text-xs text-muted-foreground">Generated</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="anomalies" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="risks">Risk Alerts</TabsTrigger>
          <TabsTrigger value="categorization">Auto-Category</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="anomalies" className="space-y-4">
          {anomalies.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-medium mb-2">No Anomalies Detected</h3>
                <p className="text-muted-foreground">All transactions appear normal</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {anomalies.map((anomaly) => (
                <Card key={anomaly.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getSeverityColor(anomaly.severity)}>
                            {anomaly.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {anomaly.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(anomaly.confidence * 100)}% confidence
                          </span>
                        </div>
                        
                        <h4 className="font-medium mb-2">{anomaly.explanation}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {anomaly.suggestedAction}
                        </p>
                        
                        <div className="text-xs text-muted-foreground">
                          Detected: {anomaly.detectedAt.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => resolveAnomaly(anomaly.id)}
                          size="sm"
                          variant="outline"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-3">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{insight.type.replace('_', ' ')}</Badge>
                      {getUrgencyIcon(insight.urgency)}
                      <span className={`font-medium ${getImpactColor(insight.impact)}`}>
                        {insight.impact.toUpperCase()} IMPACT
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {insight.generatedAt.toLocaleString()}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold mb-2">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.description}
                  </p>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Recommendations:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {insight.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="space-y-3">
            {riskAlerts.map((alert) => (
              <Alert key={alert.id} className={`${getSeverityColor(alert.severity)} border-l-4`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <AlertTitle className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>{alert.title}</span>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </AlertTitle>
                    
                    <AlertDescription className="mt-2">
                      {alert.description}
                    </AlertDescription>
                    
                    <div className="mt-3 space-y-2">
                      <div>
                        <p className="text-sm font-medium">Affected Accounts:</p>
                        <div className="flex space-x-2">
                          {alert.affectedAccounts.map((account, index) => (
                            <Badge key={index} variant="outline">{account}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Estimated Impact:</p>
                        <p className="text-sm text-red-600 font-medium">
                          ${Math.abs(alert.estimatedImpact).toLocaleString()}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Mitigation Steps:</p>
                        <ul className="text-sm space-y-1">
                          {alert.mitigationSteps.map((step, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {alert.deadline && (
                        <div className="text-sm text-muted-foreground">
                          Deadline: {alert.deadline.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => dismissAlert(alert.id)}
                    variant="ghost"
                    size="sm"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categorization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Categorization Results</CardTitle>
              <CardDescription>
                Recent autonomous transaction categorization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categorizationResults.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No recent categorization results
                  </p>
                ) : (
                  categorizationResults.map((result) => (
                    <div key={result.transactionId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={result.autoApplied ? 'default' : 'secondary'}>
                            {result.autoApplied ? 'Auto-Applied' : 'Suggested'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(result.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="font-medium">{result.suggestedCategory}</p>
                        <p className="text-sm text-muted-foreground">{result.reasoning}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!result.autoApplied && (
                          <>
                            <Button size="sm" variant="outline">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button size="sm" variant="outline">
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>Learning system accuracy over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Categorization Accuracy</span>
                    <span className="font-bold">{agentStatus.accuracy}%</span>
                  </div>
                  <Progress value={agentStatus.accuracy} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Anomaly Detection</span>
                    <span className="font-bold">91.7%</span>
                  </div>
                  <Progress value={91.7} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Insight Relevance</span>
                    <span className="font-bold">88.3%</span>
                  </div>
                  <Progress value={88.3} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Statistics</CardTitle>
                <CardDescription>AI system learning progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Feedback Samples</span>
                    <span className="font-bold">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Model Updates</span>
                    <span className="font-bold">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pattern Recognition</span>
                    <span className="font-bold">156 patterns</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Training</span>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Improvements</CardTitle>
              <CardDescription>Latest model updates and enhancements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    date: '2 hours ago',
                    improvement: 'Enhanced pattern recognition for recurring transactions',
                    impact: '+1.2% accuracy'
                  },
                  {
                    date: '1 day ago', 
                    improvement: 'Improved anomaly detection for amount outliers',
                    impact: '+0.8% detection rate'
                  },
                  {
                    date: '3 days ago',
                    improvement: 'Updated categorization rules based on user feedback',
                    impact: '+2.1% accuracy'
                  }
                ].map((update, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{update.improvement}</p>
                      <p className="text-sm text-muted-foreground">{update.date}</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      {update.impact}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgenticAIDashboard;
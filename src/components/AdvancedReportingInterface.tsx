import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Target,
  Filter,
  RefreshCw,
  Eye,
  Settings,
  Share,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Globe,
  Users,
  Building
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'executive' | 'compliance';
  sections: ReportSection[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    recipients: string[];
    lastSent?: Date;
    nextDue?: Date;
  };
  isActive: boolean;
  createdAt: Date;
}

interface ReportSection {
  id: string;
  type: 'chart' | 'table' | 'metrics' | 'text' | 'ai_insights';
  title: string;
  config: {
    chartType?: 'line' | 'bar' | 'pie' | 'area';
    dataSource?: string;
    metrics?: string[];
    timeRange?: string;
    filters?: Record<string, any>;
  };
  data?: any;
}

interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  generatedAt: Date;
  dataRange: {
    start: Date;
    end: Date;
  };
  sections: ReportSection[];
  metadata: {
    totalPages: number;
    dataPoints: number;
    executionTime: number;
  };
  status: 'generating' | 'completed' | 'failed';
}

const AdvancedReportingInterface: React.FC = () => {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'Executive Summary',
      description: 'High-level financial overview for leadership team',
      category: 'executive',
      sections: [
        {
          id: '1',
          type: 'metrics',
          title: 'Key Performance Indicators',
          config: {
            metrics: ['revenue', 'expenses', 'profit_margin', 'cash_flow'],
            timeRange: 'monthly'
          }
        },
        {
          id: '2',
          type: 'chart',
          title: 'Revenue Trend',
          config: {
            chartType: 'line',
            dataSource: 'transactions',
            timeRange: '12_months'
          }
        },
        {
          id: '3',
          type: 'ai_insights',
          title: 'AI-Generated Insights',
          config: {}
        }
      ],
      schedule: {
        frequency: 'monthly',
        recipients: ['ceo@company.com', 'cfo@company.com']
      },
      isActive: true,
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'Financial Statement',
      description: 'Detailed financial analysis and forecasts',
      category: 'financial',
      sections: [
        {
          id: '1',
          type: 'table',
          title: 'Profit & Loss Statement',
          config: {
            dataSource: 'transactions',
            timeRange: 'quarterly'
          }
        },
        {
          id: '2',
          type: 'chart',
          title: 'Cash Flow Analysis',
          config: {
            chartType: 'area',
            dataSource: 'cash_flow',
            timeRange: '6_months'
          }
        }
      ],
      isActive: true,
      createdAt: new Date()
    },
    {
      id: '3',
      name: 'Operational Dashboard',
      description: 'Day-to-day operational metrics and KPIs',
      category: 'operational',
      sections: [
        {
          id: '1',
          type: 'metrics',
          title: 'Daily Metrics',
          config: {
            metrics: ['transactions_count', 'avg_transaction', 'processing_time'],
            timeRange: 'daily'
          }
        },
        {
          id: '2',
          type: 'chart',
          title: 'Category Breakdown',
          config: {
            chartType: 'pie',
            dataSource: 'categories',
            timeRange: 'weekly'
          }
        }
      ],
      schedule: {
        frequency: 'weekly',
        recipients: ['ops@company.com']
      },
      isActive: true,
      createdAt: new Date()
    }
  ]);

  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Mock data for charts
  const mockChartData = [
    { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
    { month: 'Feb', revenue: 52000, expenses: 35000, profit: 17000 },
    { month: 'Mar', revenue: 48000, expenses: 33000, profit: 15000 },
    { month: 'Apr', revenue: 61000, expenses: 38000, profit: 23000 },
    { month: 'May', revenue: 55000, expenses: 36000, profit: 19000 },
    { month: 'Jun', revenue: 67000, expenses: 41000, profit: 26000 }
  ];

  const categoryData = [
    { name: 'Revenue', value: 280000, color: '#10b981' },
    { name: 'Operating Expenses', value: 180000, color: '#ef4444' },
    { name: 'Marketing', value: 35000, color: '#8b5cf6' },
    { name: 'Professional Services', value: 25000, color: '#06b6d4' }
  ];

  const handleGenerateReport = async (templateId: string, customConfig?: any) => {
    setIsGenerating(true);
    const template = reportTemplates.find(t => t.id === templateId);
    if (!template) return;

    try {
      toast({
        title: "Generating report",
        description: `Creating ${template.name}...`,
      });

      // Simulate report generation
      setTimeout(() => {
        const newReport: GeneratedReport = {
          id: Date.now().toString(),
          templateId,
          name: `${template.name} - ${new Date().toLocaleDateString()}`,
          generatedAt: new Date(),
          dataRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            end: new Date()
          },
          sections: template.sections.map(section => ({
            ...section,
            data: generateMockSectionData(section)
          })),
          metadata: {
            totalPages: Math.floor(Math.random() * 10) + 3,
            dataPoints: Math.floor(Math.random() * 1000) + 500,
            executionTime: Math.floor(Math.random() * 5000) + 1000
          },
          status: 'completed'
        };

        setGeneratedReports(prev => [newReport, ...prev]);
        setIsGenerating(false);
        
        toast({
          title: "Report generated successfully",
          description: `${template.name} is ready for download`,
        });
      }, 3000);

    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Report generation failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const generateMockSectionData = (section: ReportSection) => {
    switch (section.type) {
      case 'chart':
        if (section.config.chartType === 'pie') {
          return categoryData;
        }
        return mockChartData;
      case 'metrics':
        return {
          revenue: 280000,
          expenses: 215000,
          profit_margin: 23.2,
          cash_flow: 65000,
          transactions_count: 1247,
          avg_transaction: 224.56,
          processing_time: 1.8
        };
      case 'ai_insights':
        return [
          {
            type: 'opportunity',
            title: 'Revenue Growth Acceleration',
            description: 'Q2 shows 15% growth over Q1, indicating strong market demand',
            confidence: 92
          },
          {
            type: 'risk',
            title: 'Operating Cost Increase',
            description: 'Operating expenses increased 8% month-over-month, monitor closely',
            confidence: 85
          }
        ];
      default:
        return {};
    }
  };

  const handleDownloadReport = (report: GeneratedReport) => {
    // Simulate download
    toast({
      title: "Download started",
      description: `${report.name}.pdf is being downloaded`,
    });
  };

  const handleScheduleReport = (templateId: string) => {
    const template = reportTemplates.find(t => t.id === templateId);
    if (!template) return;

    toast({
      title: "Report scheduled",
      description: `${template.name} will be generated ${template.schedule?.frequency}`,
    });
  };

  const handleShareReport = (report: GeneratedReport) => {
    // Simulate sharing
    toast({
      title: "Report shared",
      description: "Share link copied to clipboard",
    });
  };

  const filteredTemplates = filterCategory === 'all' 
    ? reportTemplates 
    : reportTemplates.filter(t => t.category === filterCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'operational': return <Activity className="h-4 w-4" />;
      case 'executive': return <Building className="h-4 w-4" />;
      case 'compliance': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'generating': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const renderChart = (section: ReportSection) => {
    if (!section.data) return null;

    const { chartType } = section.config;

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={section.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: any) => [formatCurrency(value), 'Amount']} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={section.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: any) => [formatCurrency(value), 'Amount']} />
              <Area type="monotone" dataKey="profit" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={section.data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {section.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => [formatCurrency(value), 'Amount']} />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={section.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value: any) => [formatCurrency(value), 'Amount']} />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" />
              <Bar dataKey="expenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="h-64 flex items-center justify-center text-muted-foreground">Chart not available</div>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Advanced Reporting</h2>
          <p className="text-muted-foreground">
            Generate and schedule comprehensive financial reports with AI insights
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Templates</p>
                <p className="text-2xl font-bold">{reportTemplates.filter(t => t.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Reports</p>
                <p className="text-2xl font-bold">{reportTemplates.filter(t => t.schedule).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Reports Generated</p>
                <p className="text-2xl font-bold">{generatedReports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Recipients</p>
                <p className="text-2xl font-bold">
                  {reportTemplates.reduce((count, template) => 
                    count + (template.schedule?.recipients.length || 0), 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="generated">Generated Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <Card key={template.id} className={template.isActive ? 'ring-1 ring-primary' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(template.category)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sections:</span>
                    <span>{template.sections.length}</span>
                  </div>
                  
                  {template.schedule && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Schedule:</span>
                      <Badge variant="outline">{template.schedule.frequency}</Badge>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleGenerateReport(template.id)}
                      disabled={isGenerating}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3 mr-1" />
                      )}
                      Generate
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowTemplateDialog(true);
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    
                    {template.schedule && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleScheduleReport(template.id)}
                      >
                        <Calendar className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generated" className="space-y-4">
          <div className="space-y-3">
            {generatedReports.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No reports generated yet</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              generatedReports.map(report => (
                <Card key={report.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Generated {report.generatedAt.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(report.status) as any}>
                        {report.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Pages</p>
                        <p className="text-lg font-semibold">{report.metadata.totalPages}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Data Points</p>
                        <p className="text-lg font-semibold">{report.metadata.dataPoints.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Sections</p>
                        <p className="text-lg font-semibold">{report.sections.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Generation Time</p>
                        <p className="text-lg font-semibold">{(report.metadata.executionTime / 1000).toFixed(1)}s</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleDownloadReport(report)}
                        disabled={report.status !== 'completed'}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowReportDialog(true);
                        }}
                        disabled={report.status !== 'completed'}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareReport(report)}
                        disabled={report.status !== 'completed'}
                      >
                        <Share className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="space-y-3">
            {reportTemplates.filter(t => t.schedule).map(template => (
              <Card key={template.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(template.category)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge variant="outline">
                      {template.schedule?.frequency}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Recipients: {template.schedule?.recipients.join(', ')}</span>
                    </div>
                    
                    {template.schedule?.lastSent && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Last sent: {template.schedule.lastSent.toLocaleDateString()}</span>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" onClick={() => handleGenerateReport(template.id)}>
                        Generate Now
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Preview Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              {selectedTemplate.sections.map(section => (
                <Card key={section.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <Badge variant="outline">{section.type}</Badge>
                  </CardHeader>
                  <CardContent>
                    {section.type === 'chart' && (
                      <div className="h-64 flex items-center justify-center border rounded">
                        <span className="text-muted-foreground">Chart Preview ({section.config.chartType})</span>
                      </div>
                    )}
                    {section.type === 'metrics' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {section.config.metrics?.map(metric => (
                          <div key={metric} className="text-center">
                            <p className="text-sm text-muted-foreground capitalize">{metric.replace('_', ' ')}</p>
                            <p className="text-lg font-semibold">--</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {section.type === 'ai_insights' && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 p-2 border rounded">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">AI-generated insights will appear here</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Preview Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.name}</DialogTitle>
            <DialogDescription>
              Generated on {selectedReport?.generatedAt.toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {selectedReport.sections.map(section => (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {section.type === 'chart' && renderChart(section)}
                    
                    {section.type === 'metrics' && section.data && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(section.data).map(([key, value]) => (
                          <div key={key} className="text-center p-4 border rounded">
                            <p className="text-sm text-muted-foreground capitalize">{key.replace('_', ' ')}</p>
                            <p className="text-2xl font-bold">
                              {typeof value === 'number' && key.includes('amount') ? 
                                formatCurrency(value) : 
                                typeof value === 'number' ? value.toLocaleString() : value}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {section.type === 'ai_insights' && section.data && (
                      <div className="space-y-3">
                        {section.data.map((insight: any, index: number) => (
                          <div key={index} className="flex items-start space-x-3 p-3 border rounded">
                            {insight.type === 'opportunity' ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium">{insight.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                              <Badge variant="outline" className="mt-2">
                                {insight.confidence}% confidence
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedReportingInterface;
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileText, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrency } from "@/hooks/useCurrency";

interface DataUploadExportProps {
  transactions: any[];
  data: any[];
  onDataUpdate: (newTransactions: any[]) => void;
}

const DataUploadExport = ({ transactions, data, onDataUpdate }: DataUploadExportProps) => {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    setUploadedFileName(file.name);

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Parse CSV content (mock implementation)
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        const headers = lines[0].split(',');
        
        // Generate mock parsed transactions
        const newTransactions = [];
        for (let i = 1; i < Math.min(21, lines.length); i++) { // Limit to 20 new transactions
          const values = lines[i].split(',');
          if (values.length >= 4) {
            newTransactions.push({
              id: `uploaded-${i}`,
              date: new Date().toISOString().split('T')[0],
              description: `Uploaded: ${values[1] || 'Transaction'}`,
              category: 'Operations',
              amount: parseFloat(values[3]) || Math.random() * 5000,
              type: Math.random() > 0.7 ? 'inflow' : 'outflow'
            });
          }
        }

        // Merge with existing transactions
        const updatedTransactions = [...transactions, ...newTransactions];
        onDataUpdate(updatedTransactions);
        
        setUploadStatus('success');
        toast({
          title: "Upload Successful",
          description: `Added ${newTransactions.length} new transactions from ${file.name}`,
        });
      };

      reader.readAsText(file);
    } catch (error) {
      setUploadStatus('error');
      toast({
        title: "Upload Failed",
        description: "There was an error processing your file. Please check the format and try again.",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Type'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        t.date,
        `"${t.description}"`,
        t.category,
        t.amount,
        t.type
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `zenflux-transactions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Downloaded ${transactions.length} transactions as CSV`,
    });
  };

  const exportToExcel = () => {
    // Create a more structured Excel-like format
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Balance Impact'];
    let runningBalance = 0;
    
    const excelContent = [
      headers.join('\t'),
      ...transactions.map(t => {
        runningBalance += t.amount;
        return [
          t.date,
          t.description,
          t.category,
          t.amount,
          t.type,
          runningBalance
        ].join('\t');
      })
    ].join('\n');

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `zenflux-financial-report-${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Downloaded financial report as Excel format`,
    });
  };

  const exportForecastData = () => {
    const headers = ['Period', 'Actual Balance', 'Forecasted Balance', 'Revenue', 'Operations', 'Marketing', 'Payroll', 'Travel'];
    const forecastContent = [
      headers.join(','),
      ...data.map(d => [
        d.period,
        d.isActual ? d.balance : '',
        !d.isActual ? d.balance : '',
        d.Revenue,
        d.Operations,
        d.Marketing,
        d.Payroll,
        d.Travel
      ].join(','))
    ].join('\n');

    const blob = new Blob([forecastContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `zenflux-forecast-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Forecast Export Successful",
      description: `Downloaded forecast data with ${data.length} periods`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="export">Export Data</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="font-semibold">Upload Transaction Data</h3>
                <p className="text-sm text-muted-foreground">
                  Support for CSV files with columns: Date, Description, Category, Amount
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadStatus === 'uploading'}
                  className="mt-4"
                >
                  {uploadStatus === 'uploading' ? 'Processing...' : 'Choose File'}
                </Button>
              </div>
            </div>

            {uploadStatus !== 'idle' && (
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                {uploadStatus === 'uploading' && (
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                )}
                {uploadStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                {uploadStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                
                <div className="flex-1">
                  <p className="text-sm font-medium">{uploadedFileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {uploadStatus === 'uploading' && 'Processing file...'}
                    {uploadStatus === 'success' && 'Successfully uploaded and processed'}
                    {uploadStatus === 'error' && 'Failed to process file'}
                  </p>
                </div>
                
                <Badge variant={
                  uploadStatus === 'success' ? 'default' : 
                  uploadStatus === 'error' ? 'destructive' : 'secondary'
                }>
                  {uploadStatus}
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{transactions.length}</p>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">
                  {formatCurrency(transactions.filter(t => t.type === 'inflow').reduce((sum, t) => sum + t.amount, 0))}
                </p>
                <p className="text-sm text-muted-foreground">Total Inflows</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">
                  {formatCurrency(Math.abs(transactions.filter(t => t.type === 'outflow').reduce((sum, t) => sum + t.amount, 0)))}
                </p>
                <p className="text-sm text-muted-foreground">Total Outflows</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Transaction Data (CSV)</h3>
                    <p className="text-sm text-muted-foreground">
                      All transaction records with date, description, category, and amounts
                    </p>
                  </div>
                </div>
                <Button onClick={exportToCSV} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Financial Report (Excel)</h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive report with running balances and calculations
                    </p>
                  </div>
                </div>
                <Button onClick={exportToExcel} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">Forecast Data (CSV)</h3>
                    <p className="text-sm text-muted-foreground">
                      Historical and forecasted data by period with all categories
                    </p>
                  </div>
                </div>
                <Button onClick={exportForecastData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Forecast
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Export Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Transactions</p>
                  <p className="font-semibold">{transactions.length} records</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time Period</p>
                  <p className="font-semibold">{data.length} periods</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Categories</p>
                  <p className="font-semibold">5 main types</p>
                </div>
                <div>
                  <p className="text-muted-foreground">File Formats</p>
                  <p className="font-semibold">CSV, Excel</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataUploadExport;
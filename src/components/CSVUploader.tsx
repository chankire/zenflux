import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface CSVUploaderProps {
  onUploadComplete?: () => void;
}

interface ColumnMapping {
  date: string;
  amount: string;
  description: string;
  category?: string;
}

const CSVUploader = ({ onUploadComplete }: CSVUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: "",
    amount: "",
    description: "",
    category: "",
  });
  const [step, setStep] = useState<'select' | 'preview' | 'map' | 'upload'>('select');
  const { user } = useAuth();
  const { toast } = useToast();

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1, 6).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    return { headers, data };
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const { headers, data } = parseCSV(text);
        setHeaders(headers);
        setPreviewData(data);
        setStep('preview');

        // Auto-detect common column mappings
        const lowerHeaders = headers.map(h => h.toLowerCase());
        const autoMapping: ColumnMapping = {
          date: headers[lowerHeaders.findIndex(h => h.includes('date') || h.includes('time'))] || '',
          amount: headers[lowerHeaders.findIndex(h => h.includes('amount') || h.includes('value') || h.includes('total'))] || '',
          description: headers[lowerHeaders.findIndex(h => h.includes('desc') || h.includes('memo') || h.includes('reference'))] || '',
          category: headers[lowerHeaders.findIndex(h => h.includes('category') || h.includes('type'))] || '',
        };
        setMapping(autoMapping);
      } catch (error) {
        toast({
          title: "Parse error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(selectedFile);
  }, [toast]);

  const handleUpload = async () => {
    if (!file || !mapping.date || !mapping.amount || !mapping.description) {
      toast({
        title: "Missing mapping",
        description: "Please map required columns: Date, Amount, Description",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setStep('upload');
    setProgress(0);

    try {
      // Get user's organization
      const { data: memberships } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user?.id)
        .limit(1);

      if (!memberships?.[0]) {
        throw new Error('No organization found');
      }

      const organizationId = memberships[0].organization_id;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          
          const transactions = [];
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });

            // Parse transaction data
            const dateValue = row[mapping.date];
            const amountValue = parseFloat(row[mapping.amount].replace(/[^-0-9.]/g, ''));
            const description = row[mapping.description];

            if (dateValue && !isNaN(amountValue) && description) {
              transactions.push({
                organization_id: organizationId,
                value_date: new Date(dateValue).toISOString().split('T')[0],
                amount: amountValue,
                memo: description,
                counterparty: description,
                currency: 'USD',
                category_id: null,
                bank_account_id: null,
                is_forecast: false,
              });
            }

            // Update progress
            setProgress((i / (lines.length - 1)) * 100);
          }

          // Insert transactions in batches
          const batchSize = 100;
          for (let i = 0; i < transactions.length; i += batchSize) {
            const batch = transactions.slice(i, i + batchSize);
            const { error } = await supabase
              .from('transactions')
              .insert(batch);

            if (error) throw error;
          }

          toast({
            title: "Upload successful!",
            description: `Imported ${transactions.length} transactions successfully.`,
          });

          onUploadComplete?.();
        } catch (error: any) {
          console.error('Upload error:', error);
          toast({
            title: "Upload failed",
            description: error.message || "Failed to import transactions.",
            variant: "destructive",
          });
        } finally {
          setUploading(false);
        }
      };
      reader.readAsText(file);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to import transactions.",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `Date,Amount,Description,Category
2024-01-15,-1500.00,Office Rent,Operating Expenses
2024-01-16,25000.00,Client Payment - ABC Corp,Revenue
2024-01-17,-250.00,Software Subscription,Technology
2024-01-18,-75.50,Team Lunch,Meals & Entertainment
2024-01-19,15000.00,Invoice Payment - XYZ Ltd,Revenue`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transactions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const renderStep = () => {
    switch (step) {
      case 'select':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Upload className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Transaction Data</h3>
              <p className="text-muted-foreground mb-4">
                Import your transaction history from CSV files exported from your bank or accounting software.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your CSV should include columns for Date, Amount, and Description at minimum. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary" 
                  onClick={downloadSampleCSV}
                >
                  Download sample format
                  <Download className="w-3 h-3 ml-1" />
                </Button>
              </AlertDescription>
            </Alert>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Label htmlFor="csv-upload" className="cursor-pointer">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <span className="text-foreground font-medium">Choose CSV file</span>
                <p className="text-sm text-muted-foreground mt-1">or drag and drop here</p>
              </Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Preview Data</h3>
              <Button variant="outline" onClick={() => setStep('select')}>
                Choose Different File
              </Button>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Showing first 5 rows. Total rows detected: {previewData.length + 1}
              </AlertDescription>
            </Alert>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted">
                    {headers.map((header, index) => (
                      <th key={index} className="border border-border p-2 text-left text-sm font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      {headers.map((header, colIndex) => (
                        <td key={colIndex} className="border border-border p-2 text-sm">
                          {row[header] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button onClick={() => setStep('map')} className="w-full">
              Next: Map Columns
            </Button>
          </div>
        );

      case 'map':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Map Columns</h3>
            <p className="text-muted-foreground">Tell us which columns contain your transaction data.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date-mapping">Date Column *</Label>
                <select
                  id="date-mapping"
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={mapping.date}
                  onChange={(e) => setMapping(prev => ({ ...prev, date: e.target.value }))}
                >
                  <option value="">Select column...</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="amount-mapping">Amount Column *</Label>
                <select
                  id="amount-mapping"
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={mapping.amount}
                  onChange={(e) => setMapping(prev => ({ ...prev, amount: e.target.value }))}
                >
                  <option value="">Select column...</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="description-mapping">Description Column *</Label>
                <select
                  id="description-mapping"
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={mapping.description}
                  onChange={(e) => setMapping(prev => ({ ...prev, description: e.target.value }))}
                >
                  <option value="">Select column...</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="category-mapping">Category Column (Optional)</Label>
                <select
                  id="category-mapping"
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={mapping.category}
                  onChange={(e) => setMapping(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">Select column...</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('preview')}>
                Back
              </Button>
              <Button onClick={handleUpload} disabled={!mapping.date || !mapping.amount || !mapping.description}>
                Import Transactions
              </Button>
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-4 text-center">
            <Upload className="w-16 h-16 mx-auto text-primary animate-pulse" />
            <h3 className="text-lg font-semibold">Importing Transactions</h3>
            <p className="text-muted-foreground">Processing your data...</p>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          CSV Transaction Import
        </CardTitle>
        <CardDescription>
          Import transaction data from your bank statements or accounting software
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderStep()}
      </CardContent>
    </Card>
  );
};

export default CSVUploader;
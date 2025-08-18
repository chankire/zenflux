import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Upload, FileText, Download, CheckCircle, AlertCircle, Trash2, Eye, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";

interface UploadedFile {
  id: string;
  name: string;
  type: 'bank_statement' | 'transaction_data' | 'balance_sheet' | 'cash_flow' | 'budget' | 'forecast';
  size: number;
  uploadDate: string;
  status: 'processing' | 'completed' | 'error';
  recordCount?: number;
  dateRange?: {
    from: string;
    to: string;
  };
  currency?: string;
  errors?: string[];
}

interface ManualTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  currency: string;
  account: string;
}

const ManualDataUpload = () => {
  const { toast } = useToast();
  const { currency, formatCurrency } = useCurrency();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [manualTransactions, setManualTransactions] = useState<ManualTransaction[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'debit' as 'credit' | 'debit',
    category: '',
    currency: currency.code,
    account: ''
  });

  const fileTypeLabels = {
    bank_statement: 'Bank Statement',
    transaction_data: 'Transaction Data',
    balance_sheet: 'Balance Sheet',
    cash_flow: 'Cash Flow Statement',
    budget: 'Budget Plan',
    forecast: 'Financial Forecast'
  };

  const categoryOptions = [
    'Revenue', 'Operating Expenses', 'Cost of Goods Sold', 'Marketing', 'Salaries',
    'Rent', 'Utilities', 'Insurance', 'Travel', 'Professional Services',
    'Equipment', 'Software', 'Inventory', 'Taxes', 'Interest', 'Other'
  ];

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    setUploadProgress(0);

    Array.from(files).forEach((file, index) => {
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          if (newProgress >= 100) {
            clearInterval(uploadInterval);
            
            const newFile: UploadedFile = {
              id: Date.now().toString() + index,
              name: file.name,
              type: 'transaction_data', // Default type, could be determined by file analysis
              size: file.size,
              uploadDate: new Date().toISOString(),
              status: 'completed',
              recordCount: Math.floor(Math.random() * 500) + 50,
              dateRange: {
                from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                to: new Date().toISOString().split('T')[0]
              },
              currency: currency.code
            };

            setUploadedFiles(prev => [...prev, newFile]);
            setIsUploading(false);
            setUploadProgress(0);

            toast({
              title: "File uploaded successfully",
              description: `${file.name} has been processed and is ready for analysis.`,
            });

            return 100;
          }
          return newProgress;
        });
      }, 200);
    });
  }, [currency.code, toast]);

  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.account) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const transaction: ManualTransaction = {
      id: Date.now().toString(),
      date: newTransaction.date,
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      type: newTransaction.type,
      category: newTransaction.category || 'Other',
      currency: newTransaction.currency,
      account: newTransaction.account
    };

    setManualTransactions(prev => [...prev, transaction]);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      type: 'debit',
      category: '',
      currency: currency.code,
      account: ''
    });

    toast({
      title: "Transaction added",
      description: "Manual transaction has been added successfully.",
    });
  };

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    toast({
      title: "File deleted",
      description: "File has been removed from your uploads.",
    });
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setManualTransactions(prev => prev.filter(t => t.id !== transactionId));
    toast({
      title: "Transaction deleted",
      description: "Manual transaction has been removed.",
    });
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'processing':
        return <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusBadge = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
    }
  };

  const totalManualAmount = manualTransactions.reduce((sum, t) => 
    t.type === 'credit' ? sum + t.amount : sum - t.amount, 0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manual Data Upload</h2>
          <p className="text-muted-foreground">Upload financial data or add transactions manually</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uploaded Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadedFiles.length}</div>
            <p className="text-xs text-muted-foreground">
              {uploadedFiles.reduce((sum, file) => sum + (file.recordCount || 0), 0)} total records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manual Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{manualTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Net: {formatCurrency(totalManualAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {uploadedFiles.filter(f => f.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for analysis
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">File Upload</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="history">Upload History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Financial Data</CardTitle>
              <CardDescription>
                Support for CSV, Excel, PDF, and QIF formats. Maximum file size: 10MB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading and processing...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
              
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Drag and drop your files here</h3>
                  <p className="text-muted-foreground">or click to browse your computer</p>
                </div>
                <Input
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,.pdf,.qif"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" className="mt-4" disabled={isUploading}>
                    Select Files
                  </Button>
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Type</Label>
                  <Select defaultValue="transaction_data">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(fileTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select defaultValue={currency.code}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Manual Transaction</CardTitle>
              <CardDescription>
                Manually input individual transactions or cash flow entries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account">Account</Label>
                  <Input
                    id="account"
                    placeholder="e.g., Business Checking, Savings"
                    value={newTransaction.account}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, account: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Transaction description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={newTransaction.type} 
                    onValueChange={(value: 'credit' | 'debit') => 
                      setNewTransaction(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit (Income)</SelectItem>
                      <SelectItem value="debit">Debit (Expense)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select 
                    value={newTransaction.currency} 
                    onValueChange={(value) => 
                      setNewTransaction(prev => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={newTransaction.category} 
                  onValueChange={(value) => 
                    setNewTransaction(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAddTransaction} className="w-full">
                Add Transaction
              </Button>

              {manualTransactions.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Recent Manual Transactions</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {manualTransactions.slice(-5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.date} • {transaction.account} • {transaction.category}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${
                            transaction.type === 'credit' ? 'text-accent' : 'text-destructive'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload History</CardTitle>
              <CardDescription>
                View and manage all uploaded files and their processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No files uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(file.status)}
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {fileTypeLabels[file.type]} • {(file.size / 1024).toFixed(1)} KB
                            {file.recordCount && ` • ${file.recordCount} records`}
                            {file.dateRange && ` • ${file.dateRange.from} to ${file.dateRange.to}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(file.status)}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete File</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{file.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteFile(file.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManualDataUpload;
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from './LoadingSpinner';
import { 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  File,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

const supportedFileTypes = [
  { type: 'CSV', icon: FileText, description: 'Comma-separated values', ext: '.csv' },
  { type: 'Excel', icon: FileSpreadsheet, description: 'Excel spreadsheet', ext: '.xlsx,.xls' },
  { type: 'PDF', icon: File, description: 'Bank statements', ext: '.pdf' },
];

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const FileUploadInterface: React.FC = () => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: transactionsAPI.uploadFile,
    onSuccess: (data, file) => {
      setUploadFiles(prev => prev.map(uf => 
        uf.file === file 
          ? { ...uf, status: 'success', progress: 100 }
          : uf
      ));
      toast({
        title: "Upload Successful!",
        description: `${file.name} has been processed successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: any, file) => {
      setUploadFiles(prev => prev.map(uf => 
        uf.file === file 
          ? { ...uf, status: 'error', error: error.message }
          : uf
      ));
      toast({
        title: "Upload Failed",
        description: `Failed to process ${file.name}. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const newUploadFiles = files.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    
    setUploadFiles(prev => [...prev, ...newUploadFiles]);
    
    // Start uploads
    newUploadFiles.forEach(uploadFile => {
      setUploadFiles(prev => prev.map(f => 
        f.file === uploadFile.file ? { ...f, status: 'pending' as const } : f
      ));
      uploadMutation.mutate(uploadFile.file);
    });
  };

  const removeFile = (fileToRemove: File) => {
    setUploadFiles(prev => prev.filter(uf => uf.file !== fileToRemove));
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase();
    if (ext.includes('.csv')) return FileText;
    if (ext.includes('.xlsx') || ext.includes('.xls')) return FileSpreadsheet;
    if (ext.includes('.pdf')) return File;
    return File;
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="metric-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-6 h-6 text-primary" />
            <span>Upload Financial Data</span>
          </CardTitle>
          <CardDescription>
            Upload CSV, Excel, or PDF files containing your financial transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Drag & Drop Zone */}
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
              ${isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-border/60 hover:border-primary/60'
              }
            `}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
          >
            <input
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Drop files here or click to browse
                </h3>
                <p className="text-sm text-muted-foreground">
                  Support for CSV, Excel, and PDF files up to 10MB
                </p>
              </div>
              
              <Button variant="outline" className="mt-4">
                Browse Files
              </Button>
            </div>
          </div>

          {/* Supported File Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {supportedFileTypes.map((fileType) => (
              <div key={fileType.type} className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg">
                <fileType.icon className="w-8 h-8 text-primary" />
                <div>
                  <h4 className="font-medium text-foreground">{fileType.type}</h4>
                  <p className="text-xs text-muted-foreground">{fileType.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <Card className="metric-card">
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
            <CardDescription>
              Track the status of your file uploads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadFiles.map((uploadFile, index) => {
                const FileIcon = getFileIcon(uploadFile.file.name);
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-4 p-4 bg-secondary/20 rounded-lg"
                  >
                    <FileIcon className="w-8 h-8 text-primary flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {uploadFile.file.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      
                      {uploadFile.status === 'uploading' && (
                        <Progress value={uploadFile.progress} className="mt-2" />
                      )}
                      
                      {uploadFile.status === 'error' && (
                        <p className="text-sm text-red-600 mt-1">
                          {uploadFile.error}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {uploadFile.status === 'uploading' && (
                        <LoadingSpinner size="sm" />
                      )}
                      {uploadFile.status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.file)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
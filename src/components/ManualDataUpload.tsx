import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { useCurrency } from '@/lib/currency';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileText, DollarSign } from 'lucide-react';

interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const ManualDataUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currency } = useCurrency();
  
  // State management
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileUploads, setFileUploads] = useState<FileUploadProgress[]>([]);
  const [activeTab, setActiveTab] = useState<'file-upload' | 'manual-entry' | 'upload-history'>('file-upload');
  
  // Refs for cleanup
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // File validation constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const VALID_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.pdf', '.qif'];
  const VALID_MIME_TYPES = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/pdf',
    'application/qif'
  ];

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      intervalRefs.current.forEach(clearInterval);
      intervalRefs.current = [];
    };
  }, []);

  // File validation function
  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds the 10MB size limit.`;
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = VALID_EXTENSIONS.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      return `File "${file.name}" has an invalid type. Please use CSV, Excel, PDF, or QIF files.`;
    }

    return null; // File is valid
  }, []);

  // Enhanced drag event handlers with proper boundary checking
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragActive(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounterRef.current = 0;
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileProcessing(Array.from(files));
    }
  }, []);

  // File input click handler
  const handleFileInputClick = useCallback(() => {
    try {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      } else {
        // Fallback to getElementById if ref is not available
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.click();
        } else {
          toast({
            title: "Error",
            description: "File input not found. Please refresh the page.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error triggering file input:', error);
      toast({
        title: "Error",
        description: "Failed to open file dialog. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // File input change handler
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileProcessing(Array.from(files));
    }
    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  }, []);

  // Main file processing function
  const handleFileProcessing = useCallback(async (files: File[]) => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to upload files.",
        variant: "destructive",
      });
      return;
    }

    // Validate all files first
    const validationErrors: string[] = [];
    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      }
    });

    if (validationErrors.length > 0) {
      toast({
        title: "File Validation Error",
        description: validationErrors.join('\n'),
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    // Initialize progress tracking for each file
    const initialProgress: FileUploadProgress[] = files.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }));
    setFileUploads(initialProgress);

    try {
      // Get user's organization
      const { data: memberships, error: membershipError } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1);

      if (membershipError || !memberships || memberships.length === 0) {
        throw new Error('Unable to find organization. Please contact support.');
      }

      const organizationId = memberships[0].organization_id;

      // Process each file individually
      const uploadPromises = files.map(async (file, index) => {
        try {
          // Determine file type
          const extension = file.name.toLowerCase().split('.').pop();
          const fileType = extension === 'csv' ? 'csv' :
                          extension === 'xlsx' || extension === 'xls' ? 'excel' :
                          extension === 'pdf' ? 'pdf' :
                          extension === 'qif' ? 'qif' : 'other';

          // Simulate progress updates for this specific file
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            const currentProgress = Math.min(progress, 95);
            
            setFileUploads(prev => prev.map((upload, i) => 
              i === index 
                ? { ...upload, progress: currentProgress }
                : upload
            ));
          }, 300);
          
          intervalRefs.current.push(progressInterval);

          // Create file upload record in Supabase
          const { data: fileUpload, error: uploadError } = await supabase
            .from('file_uploads')
            .insert({
              organization_id: organizationId,
              uploaded_by: user.id,
              original_filename: file.name,
              file_size_bytes: file.size,
              file_type: fileType,
              upload_source: 'manual',
              status: 'processing',
            })
            .select()
            .single();

          if (uploadError) {
            throw uploadError;
          }

          // Read file content based on type
          let fileContent: string;
          if (fileType === 'pdf') {
            // For PDFs, just store the file info for now
            fileContent = 'PDF file uploaded - content extraction pending';
          } else {
            // Read text-based files
            fileContent = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.onerror = () => reject(new Error('Failed to read file'));
              reader.readAsText(file);
            });
          }

          // Update file record with content
          const { error: updateError } = await supabase
            .from('file_uploads')
            .update({
              file_content: fileContent,
              status: 'completed',
              processed_at: new Date().toISOString()
            })
            .eq('id', fileUpload.id);

          if (updateError) {
            throw updateError;
          }

          // Clear the progress interval
          clearInterval(progressInterval);
          intervalRefs.current = intervalRefs.current.filter(interval => interval !== progressInterval);

          // Mark as complete
          setFileUploads(prev => prev.map((upload, i) => 
            i === index 
              ? { ...upload, progress: 100, status: 'success' }
              : upload
          ));

          return { success: true, fileName: file.name };
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          
          setFileUploads(prev => prev.map((upload, i) => 
            i === index 
              ? { 
                  ...upload, 
                  progress: 0, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Upload failed' 
                }
              : upload
          ));

          return { success: false, fileName: file.name, error };
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      
      // Count successful uploads
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;

      if (successful > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${successful} of ${files.length} file(s).`,
          variant: "default",
        });
      }

      if (successful < files.length) {
        const failed = files.length - successful;
        toast({
          title: "Partial Upload Failure",
          description: `${failed} file(s) failed to upload. Check the details below.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: "destructive",
      });
      
      // Mark all uploads as failed
      setFileUploads(prev => prev.map(upload => ({
        ...upload,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      })));
    } finally {
      setIsUploading(false);
      // Clear any remaining intervals
      intervalRefs.current.forEach(clearInterval);
      intervalRefs.current = [];
    }
  }, [user?.id, validateFile, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manual Data Upload</h1>
          <p className="text-muted-foreground mt-2">
            Upload financial data or add transactions manually
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Template
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'file-upload', label: 'File Upload', icon: Upload },
            { id: 'manual-entry', label: 'Manual Entry', icon: DollarSign },
            { id: 'upload-history', label: 'Upload History', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* File Upload Tab */}
      {activeTab === 'file-upload' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Uploaded Files</p>
                  <p className="text-2xl font-bold text-foreground">
                    {fileUploads.filter(f => f.status === 'success').length}
                  </p>
                  <p className="text-xs text-muted-foreground">0 total records</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Manual Transactions</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-xs text-muted-foreground">Net: {currency.symbol}0</p>
                </div>
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processing Status</p>
                  <p className="text-2xl font-bold text-foreground">
                    {isUploading ? fileUploads.filter(f => f.status === 'uploading').length : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Ready for analysis</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Upload Financial Data</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Support for CSV, Excel, PDF, and QIF formats. Maximum file size: 10MB
            </p>

            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleFileInputClick}
            >
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv,.xlsx,.xls,.pdf,.qif"
                onChange={handleFileInputChange}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                {isDragActive ? 'Drop your files here' : 'Drag and drop your files here'}
              </p>
              <p className="text-muted-foreground mb-4">
                or click to browse your computer
              </p>
              
              <Button
                variant="outline"
                disabled={isUploading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileInputClick();
                }}
              >
                {isUploading ? 'Uploading...' : 'Select Files'}
              </Button>
            </div>

            {/* File Upload Progress */}
            {fileUploads.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="font-medium">Upload Progress</h3>
                {fileUploads.map((upload, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{upload.fileName}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        upload.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : upload.status === 'error' 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {upload.status === 'success' 
                          ? 'Complete' 
                          : upload.status === 'error' 
                            ? 'Failed'
                            : 'Uploading'}
                      </span>
                    </div>
                    {upload.status !== 'error' && (
                      <Progress value={upload.progress} className="w-full" />
                    )}
                    {upload.error && (
                      <p className="text-xs text-red-600">{upload.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other tabs would go here */}
      {activeTab === 'manual-entry' && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Manual entry functionality coming soon...</p>
        </div>
      )}

      {activeTab === 'upload-history' && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Upload history functionality coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default ManualDataUpload;
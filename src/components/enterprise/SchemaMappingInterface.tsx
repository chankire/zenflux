import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Download,
  Save,
  Loader2,
  Zap
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export interface SchemaMapping {
  sourceField: string;
  targetField: string;
  dataType: 'date' | 'number' | 'string' | 'currency';
  transformation?: string;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'format' | 'range' | 'unique';
  value?: any;
  message: string;
}

export interface DetectedSchema {
  fields: DetectedField[];
  sampleData: Record<string, any>[];
  fileInfo: {
    name: string;
    size: number;
    type: string;
    rowCount: number;
  };
}

export interface DetectedField {
  name: string;
  dataType: 'date' | 'number' | 'string' | 'currency';
  confidence: number;
  sampleValues: any[];
  nullable: boolean;
  suggested_target?: string;
}

export interface ProcessingResult {
  success: boolean;
  recordsProcessed: number;
  errors: ProcessingError[];
  summary: ProcessingSummary;
}

export interface ProcessingError {
  row: number;
  field: string;
  error: string;
  value: any;
}

export interface ProcessingSummary {
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  duplicatesFound: number;
  categorizedTransactions: number;
}

const targetFields = [
  { value: 'date', label: 'Transaction Date', type: 'date', required: true },
  { value: 'amount', label: 'Amount', type: 'currency', required: true },
  { value: 'description', label: 'Description', type: 'string', required: true },
  { value: 'counterparty', label: 'Counterparty', type: 'string', required: false },
  { value: 'balance', label: 'Running Balance', type: 'currency', required: false },
  { value: 'reference', label: 'Reference Number', type: 'string', required: false },
  { value: 'category', label: 'Category', type: 'string', required: false }
];

const SchemaMappingInterface: React.FC = () => {
  const [detectedSchema, setDetectedSchema] = useState<DetectedSchema | null>(null);
  const [mappings, setMappings] = useState<SchemaMapping[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);

  // Mock file processing
  const mockDetectSchema = async (file: File): Promise<DetectedSchema> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          fields: [
            {
              name: 'Transaction Date',
              dataType: 'date',
              confidence: 0.95,
              sampleValues: ['2024-01-15', '2024-01-16', '2024-01-17'],
              nullable: false,
              suggested_target: 'date'
            },
            {
              name: 'Description',
              dataType: 'string',
              confidence: 0.98,
              sampleValues: ['Office Supplies', 'Client Payment', 'Utilities'],
              nullable: false,
              suggested_target: 'description'
            },
            {
              name: 'Amount',
              dataType: 'currency',
              confidence: 0.92,
              sampleValues: [-150.00, 2500.00, -300.50],
              nullable: false,
              suggested_target: 'amount'
            },
            {
              name: 'Balance',
              dataType: 'currency',
              confidence: 0.88,
              sampleValues: [12450.00, 14950.00, 14649.50],
              nullable: true,
              suggested_target: 'balance'
            }
          ],
          sampleData: [
            {
              'Transaction Date': '2024-01-15',
              'Description': 'Office Supplies',
              'Amount': -150.00,
              'Balance': 12450.00
            },
            {
              'Transaction Date': '2024-01-16',
              'Description': 'Client Payment',
              'Amount': 2500.00,
              'Balance': 14950.00
            }
          ],
          fileInfo: {
            name: file.name,
            size: file.size,
            type: file.type,
            rowCount: 245
          }
        });
      }, 2000);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsProcessing(true);
      try {
        const schema = await mockDetectSchema(acceptedFiles[0]);
        setDetectedSchema(schema);
        
        // Generate suggested mappings
        const suggestedMappings: SchemaMapping[] = schema.fields
          .filter(field => field.suggested_target)
          .map(field => ({
            sourceField: field.name,
            targetField: field.suggested_target!,
            dataType: field.dataType,
            validation: []
          }));
        
        setMappings(suggestedMappings);
        setActiveTab('mapping');
      } catch (error) {
        console.error('Error processing file:', error);
      }
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/x-qif': ['.qif'],
      'application/x-ofx': ['.ofx']
    },
    maxFiles: 1
  });

  const updateMapping = (sourceField: string, updates: Partial<SchemaMapping>) => {
    setMappings(prev => prev.map(mapping => 
      mapping.sourceField === sourceField 
        ? { ...mapping, ...updates }
        : mapping
    ));
  };

  const addMapping = () => {
    const unmappedFields = detectedSchema?.fields.filter(
      field => !mappings.some(mapping => mapping.sourceField === field.name)
    ) || [];

    if (unmappedFields.length > 0) {
      const newMapping: SchemaMapping = {
        sourceField: unmappedFields[0].name,
        targetField: '',
        dataType: unmappedFields[0].dataType,
        validation: []
      };
      setMappings(prev => [...prev, newMapping]);
    }
  };

  const removeMapping = (sourceField: string) => {
    setMappings(prev => prev.filter(mapping => mapping.sourceField !== sourceField));
  };

  const validateMappings = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const requiredTargets = targetFields.filter(tf => tf.required).map(tf => tf.value);
    const mappedTargets = mappings.map(m => m.targetField);

    requiredTargets.forEach(required => {
      if (!mappedTargets.includes(required)) {
        errors.push(`Required field '${required}' is not mapped`);
      }
    });

    // Check for duplicate target mappings
    const duplicates = mappedTargets.filter((target, index) => 
      mappedTargets.indexOf(target) !== index && target !== ''
    );
    if (duplicates.length > 0) {
      errors.push(`Duplicate target mappings found: ${duplicates.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const processFile = async () => {
    setIsProcessing(true);
    try {
      // Mock processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const result: ProcessingResult = {
        success: true,
        recordsProcessed: 245,
        errors: [
          {
            row: 23,
            field: 'amount',
            error: 'Invalid currency format',
            value: 'N/A'
          }
        ],
        summary: {
          totalRows: 245,
          successfulRows: 244,
          failedRows: 1,
          duplicatesFound: 3,
          categorizedTransactions: 220
        }
      };
      
      setProcessingResult(result);
      setActiveTab('results');
    } catch (error) {
      console.error('Processing error:', error);
    }
    setIsProcessing(false);
  };

  const saveTemplate = () => {
    if (detectedSchema) {
      const template = {
        id: Date.now().toString(),
        name: `${detectedSchema.fileInfo.name} Template`,
        mappings,
        created_at: new Date().toISOString()
      };
      setSavedTemplates(prev => [...prev, template]);
      localStorage.setItem('schema-templates', JSON.stringify([...savedTemplates, template]));
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('schema-templates');
    if (stored) {
      setSavedTemplates(JSON.parse(stored));
    }
  }, []);

  const validation = validateMappings();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Intelligent Schema Mapping</span>
          </CardTitle>
          <CardDescription>
            Upload financial files and automatically map columns to your data schema
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="mapping" disabled={!detectedSchema}>
            Field Mapping
          </TabsTrigger>
          <TabsTrigger value="validation" disabled={mappings.length === 0}>
            Validation
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!processingResult}>
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing file schema...</span>
                  </div>
                ) : isDragActive ? (
                  <p>Drop your file here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Drop your financial file here, or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports CSV, Excel, QIF, and OFX formats
                    </p>
                  </div>
                )}
              </div>
              
              {savedTemplates.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Saved Templates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedTemplates.map((template) => (
                      <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {template.mappings.length} field mappings
                              </p>
                            </div>
                            <Button size="sm" variant="ghost">
                              Load
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          {detectedSchema && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">File Information</CardTitle>
                  <CardDescription>
                    {detectedSchema.fileInfo.name} • {detectedSchema.fileInfo.rowCount} rows • 
                    {Math.round(detectedSchema.fileInfo.size / 1024)}KB
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <span>AI-Suggested Field Mappings</span>
                  </CardTitle>
                  <CardDescription>
                    Review and adjust the automatically detected field mappings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mappings.map((mapping, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <Label className="text-sm font-medium">{mapping.sourceField}</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{mapping.dataType}</Badge>
                          {detectedSchema.fields.find(f => f.name === mapping.sourceField)?.confidence && (
                            <Badge variant="outline">
                              {Math.round((detectedSchema.fields.find(f => f.name === mapping.sourceField)?.confidence || 0) * 100)}% confidence
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      
                      <div className="flex-1">
                        <Select
                          value={mapping.targetField}
                          onValueChange={(value) => updateMapping(mapping.sourceField, { targetField: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select target field" />
                          </SelectTrigger>
                          <SelectContent>
                            {targetFields.map((target) => (
                              <SelectItem key={target.value} value={target.value}>
                                <div className="flex items-center space-x-2">
                                  <span>{target.label}</span>
                                  {target.required && (
                                    <Badge variant="destructive" className="text-xs">Required</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeMapping(mapping.sourceField)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex space-x-2">
                    <Button onClick={addMapping} variant="outline">
                      Add Mapping
                    </Button>
                    <Button onClick={saveTemplate} variant="outline">
                      <Save className="h-4 w-4 mr-2" />
                      Save as Template
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sample Data Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {detectedSchema.fields.map((field) => (
                            <th key={field.name} className="text-left p-2">
                              {field.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detectedSchema.sampleData.slice(0, 3).map((row, index) => (
                          <tr key={index} className="border-b">
                            {detectedSchema.fields.map((field) => (
                              <td key={field.name} className="p-2">
                                {row[field.name]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mapping Validation</CardTitle>
              <CardDescription>
                Review mapping configuration before processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validation.isValid ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All required fields are mapped correctly. Ready to process!
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div>Please fix the following issues:</div>
                    <ul className="list-disc list-inside mt-2">
                      {validation.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mt-6 flex justify-end space-x-2">
                <Button 
                  onClick={processFile} 
                  disabled={!validation.isValid || isProcessing}
                  className="flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span>{isProcessing ? 'Processing...' : 'Process File'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {processingResult && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Processing Complete</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{processingResult.summary.totalRows}</div>
                      <div className="text-sm text-muted-foreground">Total Rows</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {processingResult.summary.successfulRows}
                      </div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {processingResult.summary.failedRows}
                      </div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {processingResult.summary.categorizedTransactions}
                      </div>
                      <div className="text-sm text-muted-foreground">Auto-Categorized</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {processingResult.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Processing Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {processingResult.errors.map((error, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span>Row {error.row}, {error.field}: {error.error}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6 text-center">
                  <Button className="flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download Error Report</span>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchemaMappingInterface;
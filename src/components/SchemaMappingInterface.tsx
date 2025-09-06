import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult 
} from '@hello-pangea/dnd';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Download,
  FileText,
  Database,
  MapPin,
  Shuffle,
  Eye,
  Save,
  RotateCcw
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SchemaField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  example?: string;
}

interface FileColumn {
  id: string;
  name: string;
  type: 'unknown' | 'string' | 'number' | 'date' | 'boolean';
  samples: string[];
}

interface FieldMapping {
  schemaFieldId: string;
  fileColumnId: string | null;
  confidence: number;
}

const SchemaMappingInterface: React.FC = () => {
  const { toast } = useToast();

  // Standard schema fields for financial transactions
  const schemaFields: SchemaField[] = [
    { id: 'date', name: 'Transaction Date', type: 'date', required: true, example: '2024-01-15' },
    { id: 'amount', name: 'Amount', type: 'number', required: true, example: '1250.50' },
    { id: 'description', name: 'Description', type: 'string', required: true, example: 'Office Supplies' },
    { id: 'category', name: 'Category', type: 'string', required: false, example: 'Office Expenses' },
    { id: 'type', name: 'Transaction Type', type: 'string', required: true, example: 'debit' },
    { id: 'account', name: 'Account', type: 'string', required: false, example: 'Business Checking' },
    { id: 'reference', name: 'Reference ID', type: 'string', required: false, example: 'TXN-2024-001' },
    { id: 'vendor', name: 'Vendor/Payee', type: 'string', required: false, example: 'Staples Inc.' }
  ];

  // Mock file columns (would come from uploaded file analysis)
  const [fileColumns] = useState<FileColumn[]>([
    { 
      id: 'col1', 
      name: 'Date', 
      type: 'date', 
      samples: ['2024-01-15', '2024-01-16', '2024-01-17'] 
    },
    { 
      id: 'col2', 
      name: 'Transaction Amount', 
      type: 'number', 
      samples: ['1250.50', '-850.00', '2400.75'] 
    },
    { 
      id: 'col3', 
      name: 'Memo', 
      type: 'string', 
      samples: ['Office Supplies', 'Monthly Rent', 'Client Payment'] 
    },
    { 
      id: 'col4', 
      name: 'Category Name', 
      type: 'string', 
      samples: ['Office', 'Rent', 'Revenue'] 
    },
    { 
      id: 'col5', 
      name: 'Debit/Credit', 
      type: 'string', 
      samples: ['Debit', 'Debit', 'Credit'] 
    },
    { 
      id: 'col6', 
      name: 'Account Number', 
      type: 'string', 
      samples: ['1001', '1001', '1001'] 
    },
    { 
      id: 'col7', 
      name: 'Vendor Name', 
      type: 'string', 
      samples: ['Staples', 'Property Mgmt', 'ABC Corp'] 
    },
  ]);

  // Initial smart mapping based on field names and types
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([
    { schemaFieldId: 'date', fileColumnId: 'col1', confidence: 95 },
    { schemaFieldId: 'amount', fileColumnId: 'col2', confidence: 90 },
    { schemaFieldId: 'description', fileColumnId: 'col3', confidence: 85 },
    { schemaFieldId: 'category', fileColumnId: 'col4', confidence: 80 },
    { schemaFieldId: 'type', fileColumnId: 'col5', confidence: 75 },
    { schemaFieldId: 'account', fileColumnId: 'col6', confidence: 70 },
    { schemaFieldId: 'vendor', fileColumnId: 'col7', confidence: 85 },
    { schemaFieldId: 'reference', fileColumnId: null, confidence: 0 },
  ]);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [unmappedColumns, setUnmappedColumns] = useState<FileColumn[]>([]);

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    const sourceDroppableId = source.droppableId;
    const destinationDroppableId = destination.droppableId;

    if (sourceDroppableId === 'file-columns' && destinationDroppableId.startsWith('schema-field-')) {
      // Mapping a file column to a schema field
      const schemaFieldId = destinationDroppableId.replace('schema-field-', '');
      const fileColumnId = draggableId;

      setFieldMappings(prev => 
        prev.map(mapping => 
          mapping.schemaFieldId === schemaFieldId 
            ? { ...mapping, fileColumnId, confidence: 85 }
            : mapping.fileColumnId === fileColumnId
            ? { ...mapping, fileColumnId: null, confidence: 0 }
            : mapping
        )
      );

      toast({
        title: "Mapping updated",
        description: `Mapped column to ${schemaFields.find(f => f.id === schemaFieldId)?.name}`,
      });
    }

    if (destinationDroppableId === 'unmapped-area') {
      // Unmapping a column
      const fileColumnId = draggableId;
      setFieldMappings(prev =>
        prev.map(mapping =>
          mapping.fileColumnId === fileColumnId
            ? { ...mapping, fileColumnId: null, confidence: 0 }
            : mapping
        )
      );

      toast({
        title: "Mapping removed",
        description: "Column unmapped successfully",
      });
    }
  }, [schemaFields, toast]);

  const autoMap = () => {
    // Enhanced auto-mapping algorithm
    const newMappings = [...fieldMappings];
    
    fileColumns.forEach(column => {
      const columnName = column.name.toLowerCase();
      const bestMatch = schemaFields.find(field => {
        const fieldName = field.name.toLowerCase();
        return (
          columnName.includes(field.id) ||
          field.id.includes(columnName) ||
          (field.id === 'date' && (columnName.includes('date') || columnName.includes('time'))) ||
          (field.id === 'amount' && (columnName.includes('amount') || columnName.includes('value') || columnName.includes('total'))) ||
          (field.id === 'description' && (columnName.includes('desc') || columnName.includes('memo') || columnName.includes('note'))) ||
          (field.id === 'vendor' && (columnName.includes('vendor') || columnName.includes('payee') || columnName.includes('merchant')))
        );
      });

      if (bestMatch) {
        const mappingIndex = newMappings.findIndex(m => m.schemaFieldId === bestMatch.id);
        if (mappingIndex !== -1) {
          newMappings[mappingIndex] = {
            ...newMappings[mappingIndex],
            fileColumnId: column.id,
            confidence: 90
          };
        }
      }
    });

    setFieldMappings(newMappings);
    toast({
      title: "Auto-mapping completed",
      description: "Fields have been automatically mapped based on column names",
    });
  };

  const resetMappings = () => {
    setFieldMappings(prev => 
      prev.map(mapping => ({ ...mapping, fileColumnId: null, confidence: 0 }))
    );
    toast({
      title: "Mappings reset",
      description: "All field mappings have been cleared",
    });
  };

  const validateMappings = () => {
    const requiredFields = schemaFields.filter(field => field.required);
    const mappedRequiredFields = requiredFields.filter(field => 
      fieldMappings.find(mapping => mapping.schemaFieldId === field.id && mapping.fileColumnId)
    );

    const isValid = mappedRequiredFields.length === requiredFields.length;
    const mappedCount = fieldMappings.filter(mapping => mapping.fileColumnId).length;

    return {
      isValid,
      mappedCount,
      totalRequired: requiredFields.length,
      missingRequired: requiredFields.filter(field => 
        !fieldMappings.find(mapping => mapping.schemaFieldId === field.id && mapping.fileColumnId)
      )
    };
  };

  const validation = validateMappings();

  const generatePreview = () => {
    const mappedFields = fieldMappings.filter(mapping => mapping.fileColumnId);
    const previewData = [];
    
    for (let i = 0; i < 3; i++) {
      const row: Record<string, string> = {};
      mappedFields.forEach(mapping => {
        const schemaField = schemaFields.find(f => f.id === mapping.schemaFieldId);
        const fileColumn = fileColumns.find(c => c.id === mapping.fileColumnId);
        if (schemaField && fileColumn) {
          row[schemaField.name] = fileColumn.samples[i] || '';
        }
      });
      previewData.push(row);
    }
    
    return previewData;
  };

  const saveMappingConfig = () => {
    const config = {
      mappings: fieldMappings.filter(mapping => mapping.fileColumnId),
      timestamp: new Date().toISOString(),
      validation
    };

    // In a real app, this would save to the backend
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema-mapping-config.json';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Mapping configuration saved",
      description: "Your field mappings have been exported successfully",
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    if (confidence >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return { variant: 'default' as const, text: 'High' };
    if (confidence >= 60) return { variant: 'secondary' as const, text: 'Medium' };
    if (confidence >= 40) return { variant: 'outline' as const, text: 'Low' };
    return { variant: 'destructive' as const, text: 'None' };
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Schema Mapping Interface</h2>
          <p className="text-muted-foreground">
            Map your file columns to standard transaction fields
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={validation.isValid ? "default" : "destructive"}>
            {validation.mappedCount}/{schemaFields.length} Fields Mapped
          </Badge>
          <Button variant="outline" size="sm" onClick={autoMap}>
            <Shuffle className="h-4 w-4 mr-2" />
            Auto Map
          </Button>
          <Button variant="outline" size="sm" onClick={resetMappings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {!validation.isValid && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Missing Required Fields</p>
                <p className="text-sm text-muted-foreground">
                  Please map the following required fields: {validation.missingRequired.map(f => f.name).join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Columns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>File Columns</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Droppable droppableId="file-columns" type="COLUMN">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[300px] space-y-2 p-2 border-2 border-dashed rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'border-primary bg-primary/5' : 'border-muted'
                    }`}
                  >
                    {fileColumns.filter(column => 
                      !fieldMappings.find(mapping => mapping.fileColumnId === column.id)
                    ).map((column, index) => (
                      <Draggable key={column.id} draggableId={column.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 border rounded-lg bg-background cursor-move transition-all ${
                              snapshot.isDragging ? 'shadow-lg rotate-2' : 'hover:shadow-md'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{column.name}</h4>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {column.type}
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">Sample data:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {column.samples.slice(0, 2).map((sample, idx) => (
                                  <span key={idx} className="text-xs bg-muted px-1 py-0.5 rounded">
                                    {sample}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>

          {/* Schema Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Schema Fields</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schemaFields.map(field => {
                  const mapping = fieldMappings.find(m => m.schemaFieldId === field.id);
                  const mappedColumn = mapping?.fileColumnId ? 
                    fileColumns.find(c => c.id === mapping.fileColumnId) : null;

                  return (
                    <Droppable key={field.id} droppableId={`schema-field-${field.id}`} type="COLUMN">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-3 border-2 border-dashed rounded-lg transition-colors ${
                            snapshot.isDraggingOver 
                              ? 'border-primary bg-primary/5' 
                              : mappedColumn 
                              ? 'border-green-300 bg-green-50 dark:bg-green-950' 
                              : field.required 
                              ? 'border-red-300 bg-red-50 dark:bg-red-950' 
                              : 'border-muted'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-sm">{field.name}</h4>
                                {field.required && (
                                  <Badge variant="destructive" className="text-xs">Required</Badge>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs mt-1">
                                {field.type}
                              </Badge>
                            </div>
                            
                            {mappedColumn && (
                              <div className="text-right">
                                <Badge {...getConfidenceBadge(mapping!.confidence)}>
                                  {getConfidenceBadge(mapping!.confidence).text}
                                </Badge>
                                <div className={`h-1 w-16 rounded mt-1 ${getConfidenceColor(mapping!.confidence)}`} />
                              </div>
                            )}
                          </div>

                          {mappedColumn ? (
                            <div className="bg-background border rounded p-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{mappedColumn.name}</span>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {mappedColumn.samples.slice(0, 2).map((sample, idx) => (
                                  <span key={idx} className="text-xs bg-muted px-1 py-0.5 rounded">
                                    {sample}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-xs">Drop a column here</p>
                              {field.example && (
                                <p className="text-xs mt-1">Example: {field.example}</p>
                              )}
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unmapped Area */}
        <Card>
          <CardHeader>
            <CardTitle>Unmapped Columns</CardTitle>
          </CardHeader>
          <CardContent>
            <Droppable droppableId="unmapped-area" type="COLUMN">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[100px] p-4 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
                    snapshot.isDraggingOver ? 'border-red-300 bg-red-50 dark:bg-red-950' : 'border-muted'
                  }`}
                >
                  <p className="text-muted-foreground text-center">
                    Drag columns here to unmap them
                  </p>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </CardContent>
        </Card>
      </DragDropContext>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPreviewVisible(!previewVisible)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewVisible ? 'Hide' : 'Show'} Preview
          </Button>
          
          <Button variant="outline" onClick={saveMappingConfig}>
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
        </div>

        <Button 
          disabled={!validation.isValid}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Apply Mapping</span>
        </Button>
      </div>

      {/* Preview */}
      {previewVisible && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {fieldMappings
                      .filter(mapping => mapping.fileColumnId)
                      .map(mapping => {
                        const field = schemaFields.find(f => f.id === mapping.schemaFieldId);
                        return (
                          <th key={mapping.schemaFieldId} className="text-left p-2 font-medium">
                            {field?.name}
                          </th>
                        );
                      })}
                  </tr>
                </thead>
                <tbody>
                  {generatePreview().map((row, idx) => (
                    <tr key={idx} className="border-b">
                      {Object.values(row).map((value, cellIdx) => (
                        <td key={cellIdx} className="p-2">{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchemaMappingInterface;
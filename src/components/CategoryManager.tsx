import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Folder, 
  FolderPlus, 
  Edit, 
  Trash2, 
  Settings, 
  Zap, 
  TrendingUp,
  PieChart,
  Download,
  Upload,
  ChevronRight,
  ChevronDown,
  Plus,
  Target,
  Brain
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { MockTransaction } from '@/lib/mock-data';
import { aiRouter } from '@/lib/ai-router';

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  color: string;
  organizationId: string;
  isSystem: boolean;
  rules: CategoryRule[];
  children?: Category[];
  transactionCount?: number;
  totalAmount?: number;
}

export interface CategoryRule {
  id: string;
  field: 'description' | 'counterparty' | 'amount';
  operator: 'contains' | 'equals' | 'greater_than' | 'less_than' | 'starts_with' | 'ends_with';
  value: string | number;
  weight: number;
  isActive: boolean;
}

export interface CategorySuggestion {
  categoryId: string;
  confidence: number;
  reasoning: string;
  source: 'ai_model' | 'user_rules' | 'pattern_match';
}

export interface CategoryInsight {
  categoryId: string;
  categoryName: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
  projectedAmount: number;
  riskLevel: 'low' | 'medium' | 'high';
}

const CategoryManager: React.FC = () => {
  const { user, organizations } = useAuth();
  const [selectedOrg] = useState(organizations[0]?.id || 'org-1');
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    parentId: '',
    color: '#3b82f6'
  });
  const [categoryRules, setCategoryRules] = useState<CategoryRule[]>([]);
  const [insights, setInsights] = useState<CategoryInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const defaultColors = [
    '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#64748b'
  ];

  useEffect(() => {
    loadCategories();
    loadCategoryInsights();
  }, [selectedOrg]);

  const loadCategories = () => {
    // Load from localStorage or use default categories
    const stored = localStorage.getItem(`categories-${selectedOrg}`);
    if (stored) {
      const parsedCategories = JSON.parse(stored);
      setCategories(buildCategoryTree(parsedCategories));
    } else {
      const defaultCategories = createDefaultCategories();
      setCategories(buildCategoryTree(defaultCategories));
      saveCategoriesLocally(defaultCategories);
    }
  };

  const createDefaultCategories = (): Category[] => {
    return [
      {
        id: 'cat-revenue',
        name: 'Revenue',
        color: '#22c55e',
        organizationId: selectedOrg,
        isSystem: true,
        rules: []
      },
      {
        id: 'cat-expenses',
        name: 'Expenses',
        color: '#ef4444',
        organizationId: selectedOrg,
        isSystem: false,
        rules: []
      },
      {
        id: 'cat-office',
        name: 'Office Expenses',
        parentId: 'cat-expenses',
        color: '#f59e0b',
        organizationId: selectedOrg,
        isSystem: false,
        rules: [
          {
            id: 'rule-1',
            field: 'description',
            operator: 'contains',
            value: 'office',
            weight: 0.8,
            isActive: true
          },
          {
            id: 'rule-2',
            field: 'description',
            operator: 'contains',
            value: 'supplies',
            weight: 0.7,
            isActive: true
          }
        ]
      },
      {
        id: 'cat-software',
        name: 'Software & Technology',
        parentId: 'cat-expenses',
        color: '#3b82f6',
        organizationId: selectedOrg,
        isSystem: false,
        rules: [
          {
            id: 'rule-3',
            field: 'description',
            operator: 'contains',
            value: 'software',
            weight: 0.9,
            isActive: true
          },
          {
            id: 'rule-4',
            field: 'counterparty',
            operator: 'contains',
            value: 'microsoft',
            weight: 0.8,
            isActive: true
          }
        ]
      },
      {
        id: 'cat-marketing',
        name: 'Marketing',
        parentId: 'cat-expenses',
        color: '#ec4899',
        organizationId: selectedOrg,
        isSystem: false,
        rules: [
          {
            id: 'rule-5',
            field: 'description',
            operator: 'contains',
            value: 'marketing',
            weight: 0.9,
            isActive: true
          },
          {
            id: 'rule-6',
            field: 'counterparty',
            operator: 'contains',
            value: 'google',
            weight: 0.7,
            isActive: true
          }
        ]
      },
      {
        id: 'cat-payroll',
        name: 'Payroll',
        parentId: 'cat-expenses',
        color: '#8b5cf6',
        organizationId: selectedOrg,
        isSystem: false,
        rules: [
          {
            id: 'rule-7',
            field: 'description',
            operator: 'contains',
            value: 'salary',
            weight: 1.0,
            isActive: true
          },
          {
            id: 'rule-8',
            field: 'description',
            operator: 'contains',
            value: 'payroll',
            weight: 1.0,
            isActive: true
          }
        ]
      }
    ];
  };

  const buildCategoryTree = (flatCategories: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // First pass: create map
    flatCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    flatCategories.forEach(cat => {
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        const child = categoryMap.get(cat.id);
        if (parent && child) {
          parent.children = parent.children || [];
          parent.children.push(child);
        }
      } else {
        const rootCat = categoryMap.get(cat.id);
        if (rootCat) rootCategories.push(rootCat);
      }
    });

    return rootCategories;
  };

  const flattenCategories = (categories: Category[]): Category[] => {
    const result: Category[] = [];
    
    const flatten = (cats: Category[]) => {
      cats.forEach(cat => {
        const { children, ...flatCat } = cat;
        result.push(flatCat);
        if (children) flatten(children);
      });
    };
    
    flatten(categories);
    return result;
  };

  const saveCategoriesLocally = (cats: Category[]) => {
    localStorage.setItem(`categories-${selectedOrg}`, JSON.stringify(cats));
  };

  const loadCategoryInsights = async () => {
    // Mock category insights
    const mockInsights: CategoryInsight[] = [
      {
        categoryId: 'cat-office',
        categoryName: 'Office Expenses',
        trend: 'increasing',
        changePercentage: 15.3,
        projectedAmount: 2300,
        riskLevel: 'medium'
      },
      {
        categoryId: 'cat-software',
        categoryName: 'Software & Technology',
        trend: 'stable',
        changePercentage: 2.1,
        projectedAmount: 4500,
        riskLevel: 'low'
      },
      {
        categoryId: 'cat-marketing',
        categoryName: 'Marketing',
        trend: 'decreasing',
        changePercentage: -8.7,
        projectedAmount: 3200,
        riskLevel: 'high'
      }
    ];
    
    setInsights(mockInsights);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const createCategory = async () => {
    if (!newCategory.name.trim()) return;

    const category: Category = {
      id: `cat-${Date.now()}`,
      name: newCategory.name,
      parentId: newCategory.parentId || undefined,
      color: newCategory.color,
      organizationId: selectedOrg,
      isSystem: false,
      rules: []
    };

    const flatCategories = flattenCategories(categories);
    flatCategories.push(category);
    
    setCategories(buildCategoryTree(flatCategories));
    saveCategoriesLocally(flatCategories);
    
    setNewCategory({ name: '', parentId: '', color: '#3b82f6' });
    setIsCreating(false);
  };

  const updateCategory = async () => {
    if (!selectedCategory) return;

    const flatCategories = flattenCategories(categories);
    const index = flatCategories.findIndex(c => c.id === selectedCategory.id);
    
    if (index !== -1) {
      flatCategories[index] = { ...selectedCategory, rules: categoryRules };
      setCategories(buildCategoryTree(flatCategories));
      saveCategoriesLocally(flatCategories);
    }
    
    setIsEditing(false);
    setSelectedCategory(null);
  };

  const deleteCategory = (categoryId: string) => {
    const flatCategories = flattenCategories(categories);
    const filteredCategories = flatCategories.filter(c => c.id !== categoryId && c.parentId !== categoryId);
    
    setCategories(buildCategoryTree(filteredCategories));
    saveCategoriesLocally(filteredCategories);
  };

  const addRule = () => {
    const newRule: CategoryRule = {
      id: `rule-${Date.now()}`,
      field: 'description',
      operator: 'contains',
      value: '',
      weight: 0.5,
      isActive: true
    };
    
    setCategoryRules([...categoryRules, newRule]);
  };

  const updateRule = (ruleId: string, updates: Partial<CategoryRule>) => {
    setCategoryRules(rules => 
      rules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    );
  };

  const deleteRule = (ruleId: string) => {
    setCategoryRules(rules => rules.filter(rule => rule.id !== ruleId));
  };

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Mock AI analysis of spending patterns
      await aiRouter.routeRequest({
        type: 'analysis',
        data: { categories: flattenCategories(categories) },
        priority: 'medium'
      });
      
      // Update insights after analysis
      await loadCategoryInsights();
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportCategories = () => {
    const dataStr = JSON.stringify(flattenCategories(categories), null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `categories-${selectedOrg}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderCategory = (category: Category, depth: number = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id}>
        <div 
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
          style={{ marginLeft: `${depth * 20}px` }}
          onClick={() => hasChildren && toggleCategory(category.id)}
        >
          <div className="flex items-center space-x-3">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            ) : (
              <div className="w-4" />
            )}
            
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: category.color }}
            />
            
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{category.name}</span>
                {category.isSystem && <Badge variant="secondary">System</Badge>}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{category.rules.length} rules</span>
                {category.transactionCount && (
                  <span>• {category.transactionCount} transactions</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {category.totalAmount && (
              <span className="text-sm font-medium">
                ${category.totalAmount.toLocaleString()}
              </span>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCategory(category);
                setCategoryRules(category.rules);
                setIsEditing(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            {!category.isSystem && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCategory(category.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="mt-2 space-y-2">
            {category.children!.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Folder className="h-5 w-5" />
                <span>Category Management</span>
              </CardTitle>
              <CardDescription>
                Hierarchical transaction categorization with AI-powered rules
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={runAIAnalysis} disabled={isAnalyzing} variant="outline">
                {isAnalyzing ? (
                  <Brain className="h-4 w-4 animate-pulse mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                AI Analysis
              </Button>
              <Button onClick={exportCategories} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                      Add a new category for transaction classification
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Category Name</Label>
                      <Input
                        value={newCategory.name}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter category name"
                      />
                    </div>
                    
                    <div>
                      <Label>Parent Category (Optional)</Label>
                      <Select 
                        value={newCategory.parentId} 
                        onValueChange={(value) => setNewCategory(prev => ({ ...prev, parentId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent category" />
                        </SelectTrigger>
                        <SelectContent>
                          {flattenCategories(categories).map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Color</Label>
                      <div className="flex space-x-2 mt-2">
                        {defaultColors.map(color => (
                          <button
                            key={color}
                            className={`w-8 h-8 rounded border-2 ${
                              newCategory.color === color ? 'border-gray-400' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button onClick={createCategory} disabled={!newCategory.name.trim()}>
                        Create Category
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreating(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="space-y-3">
            {categories.map(category => renderCategory(category))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{insight.categoryName}</h3>
                    <Badge 
                      variant={insight.riskLevel === 'high' ? 'destructive' : insight.riskLevel === 'medium' ? 'default' : 'secondary'}
                    >
                      {insight.riskLevel} risk
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {insight.trend === 'increasing' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                      )}
                      <span className={`text-sm font-medium ${
                        insight.trend === 'increasing' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {insight.changePercentage >= 0 ? '+' : ''}{insight.changePercentage.toFixed(1)}%
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Projected: ${insight.projectedAmount.toLocaleString()}
                    </p>
                    
                    <div className="text-xs text-muted-foreground">
                      Trend: {insight.trend}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              AI-powered categorization rules learn from your patterns and improve accuracy over time.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Auto-Categorization Performance</CardTitle>
              <CardDescription>
                Current accuracy and processing statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">94.2%</p>
                  <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-sm text-muted-foreground">Auto-Categorized</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-sm text-muted-foreground">Manual Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Category Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Category: {selectedCategory?.name}</DialogTitle>
            <DialogDescription>
              Modify category rules and settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Categorization Rules</Label>
                <Button onClick={addRule} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Rule
                </Button>
              </div>
              
              <div className="space-y-3">
                {categoryRules.map((rule, index) => (
                  <div key={rule.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Select
                      value={rule.field}
                      onValueChange={(value: any) => updateRule(rule.id, { field: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="description">Description</SelectItem>
                        <SelectItem value="counterparty">Counterparty</SelectItem>
                        <SelectItem value="amount">Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={rule.operator}
                      onValueChange={(value: any) => updateRule(rule.id, { operator: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="starts_with">Starts With</SelectItem>
                        <SelectItem value="ends_with">Ends With</SelectItem>
                        <SelectItem value="greater_than">Greater Than</SelectItem>
                        <SelectItem value="less_than">Less Than</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                      placeholder="Value"
                      className="flex-1"
                    />
                    
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={rule.weight}
                      onChange={(e) => updateRule(rule.id, { weight: parseFloat(e.target.value) })}
                      className="w-20"
                    />
                    
                    <Button 
                      onClick={() => deleteRule(rule.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={updateCategory}>
                Update Category
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManager;
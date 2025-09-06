import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  FolderPlus, 
  Tag, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  Settings,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Folder,
  FileText,
  Target,
  Zap
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";

interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  color: string;
  icon: string;
  isActive: boolean;
  budgetLimit?: number;
  transactionCount: number;
  totalAmount: number;
  monthlyAverage: number;
  trend: 'up' | 'down' | 'stable';
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryRule {
  id: string;
  categoryId: string;
  condition: 'contains' | 'starts_with' | 'ends_with' | 'equals' | 'amount_range';
  value: string;
  field: 'description' | 'vendor' | 'amount' | 'account';
  priority: number;
  isActive: boolean;
}

const CategoryManagementInterface: React.FC = () => {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Revenue',
      description: 'All income sources',
      color: '#10b981',
      icon: 'TrendingUp',
      isActive: true,
      transactionCount: 25,
      totalAmount: 125000,
      monthlyAverage: 15625,
      trend: 'up',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Operating Expenses',
      description: 'Day-to-day business operations',
      color: '#ef4444',
      icon: 'Settings',
      isActive: true,
      budgetLimit: 50000,
      transactionCount: 45,
      totalAmount: 85000,
      monthlyAverage: 10625,
      trend: 'stable',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Marketing & Advertising',
      description: 'Promotional activities and campaigns',
      parentId: '2',
      color: '#8b5cf6',
      icon: 'Target',
      isActive: true,
      budgetLimit: 15000,
      transactionCount: 12,
      totalAmount: 25000,
      monthlyAverage: 3125,
      trend: 'up',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      name: 'Professional Services',
      description: 'Legal, consulting, and advisory services',
      parentId: '2',
      color: '#06b6d4',
      icon: 'FileText',
      isActive: true,
      transactionCount: 8,
      totalAmount: 18000,
      monthlyAverage: 2250,
      trend: 'down',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [categoryRules, setCategoryRules] = useState<CategoryRule[]>([
    {
      id: '1',
      categoryId: '1',
      condition: 'contains',
      value: 'revenue',
      field: 'description',
      priority: 1,
      isActive: true
    },
    {
      id: '2',
      categoryId: '3',
      condition: 'contains',
      value: 'marketing',
      field: 'description',
      priority: 2,
      isActive: true
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showRulesDialog, setShowRulesDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const colorOptions = [
    '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f59e0b', 
    '#ec4899', '#6366f1', '#84cc16', '#f97316', '#14b8a6'
  ];

  const iconOptions = [
    'TrendingUp', 'DollarSign', 'Settings', 'Target', 'FileText', 
    'BarChart3', 'Folder', 'Tag', 'Zap', 'Plus'
  ];

  const getIconComponent = (iconName: string) => {
    const icons = {
      TrendingUp: <TrendingUp className="h-4 w-4" />,
      DollarSign: <DollarSign className="h-4 w-4" />,
      Settings: <Settings className="h-4 w-4" />,
      Target: <Target className="h-4 w-4" />,
      FileText: <FileText className="h-4 w-4" />,
      BarChart3: <BarChart3 className="h-4 w-4" />,
      Folder: <Folder className="h-4 w-4" />,
      Tag: <Tag className="h-4 w-4" />,
      Zap: <Zap className="h-4 w-4" />,
      Plus: <Plus className="h-4 w-4" />
    };
    return icons[iconName as keyof typeof icons] || <Tag className="h-4 w-4" />;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <div className="h-4 w-4 bg-yellow-500 rounded-full" />;
    }
  };

  const getBudgetStatus = (category: Category) => {
    if (!category.budgetLimit) return null;
    
    const utilization = (Math.abs(category.totalAmount) / category.budgetLimit) * 100;
    
    if (utilization > 90) {
      return { status: 'critical', color: 'destructive', text: `${utilization.toFixed(1)}% of budget` };
    } else if (utilization > 75) {
      return { status: 'warning', color: 'secondary', text: `${utilization.toFixed(1)}% of budget` };
    } else {
      return { status: 'healthy', color: 'default', text: `${utilization.toFixed(1)}% of budget` };
    }
  };

  const handleCreateCategory = () => {
    setSelectedCategory({
      id: '',
      name: '',
      description: '',
      color: colorOptions[0],
      icon: iconOptions[0],
      isActive: true,
      transactionCount: 0,
      totalAmount: 0,
      monthlyAverage: 0,
      trend: 'stable',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setIsEditing(false);
    setShowCategoryDialog(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditing(true);
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = () => {
    if (!selectedCategory) return;

    if (isEditing) {
      setCategories(prev => prev.map(cat => 
        cat.id === selectedCategory.id 
          ? { ...selectedCategory, updatedAt: new Date() }
          : cat
      ));
      toast({
        title: "Category updated",
        description: `${selectedCategory.name} has been updated successfully`,
      });
    } else {
      const newCategory = {
        ...selectedCategory,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setCategories(prev => [...prev, newCategory]);
      toast({
        title: "Category created",
        description: `${selectedCategory.name} has been created successfully`,
      });
    }

    setShowCategoryDialog(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    // Check if category has children
    const hasChildren = categories.some(cat => cat.parentId === categoryId);
    if (hasChildren) {
      toast({
        title: "Cannot delete category",
        description: "Please delete or reassign subcategories first",
        variant: "destructive",
      });
      return;
    }

    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    setCategoryRules(prev => prev.filter(rule => rule.categoryId !== categoryId));
    
    toast({
      title: "Category deleted",
      description: `${category.name} has been deleted successfully`,
    });
  };

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parentId);
  };

  const getSubcategories = (parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  const getRulesForCategory = (categoryId: string) => {
    return categoryRules.filter(rule => rule.categoryId === categoryId);
  };

  const handleCreateRule = (categoryId: string) => {
    const newRule: CategoryRule = {
      id: Date.now().toString(),
      categoryId,
      condition: 'contains',
      value: '',
      field: 'description',
      priority: categoryRules.length + 1,
      isActive: true
    };
    setCategoryRules(prev => [...prev, newRule]);
  };

  const handleUpdateRule = (ruleId: string, updates: Partial<CategoryRule>) => {
    setCategoryRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const handleDeleteRule = (ruleId: string) => {
    setCategoryRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast({
      title: "Rule deleted",
      description: "Auto-categorization rule has been deleted",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Category Management</h2>
          <p className="text-muted-foreground">
            Organize and manage transaction categories with automated rules
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowRulesDialog(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Auto-Rules
          </Button>
          <Button onClick={handleCreateCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Category Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Folder className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">{categoryRules.filter(r => r.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Over Budget</p>
                <p className="text-2xl font-bold">
                  {categories.filter(cat => {
                    const status = getBudgetStatus(cat);
                    return status?.status === 'critical';
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">
                  {categories.reduce((sum, cat) => sum + cat.transactionCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {getParentCategories().map(category => (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    {getIconComponent(category.icon)}
                  </div>
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{category.name}</span>
                      {getTrendIcon(category.trend)}
                      {!category.isActive && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-lg font-semibold">{category.transactionCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-semibold">{formatCurrency(category.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Average</p>
                  <p className="text-lg font-semibold">{formatCurrency(category.monthlyAverage)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget Status</p>
                  {category.budgetLimit ? (
                    <Badge variant={getBudgetStatus(category)?.color as any}>
                      {getBudgetStatus(category)?.text}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">No limit set</span>
                  )}
                </div>
              </div>

              {/* Subcategories */}
              {getSubcategories(category.id).length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Subcategories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {getSubcategories(category.id).map(subcat => (
                      <div key={subcat.id} className="p-3 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="h-6 w-6 rounded flex items-center justify-center"
                            style={{ backgroundColor: subcat.color }}
                          >
                            {getIconComponent(subcat.icon)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{subcat.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {subcat.transactionCount} transactions • {formatCurrency(subcat.totalAmount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(subcat.trend)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(subcat)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Creation/Edit Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update category information and settings' : 'Create a new category for organizing transactions'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCategory && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={selectedCategory.name}
                    onChange={(e) => setSelectedCategory({
                      ...selectedCategory,
                      name: e.target.value
                    })}
                    placeholder="Enter category name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="parent">Parent Category (Optional)</Label>
                  <Select
                    value={selectedCategory.parentId || ''}
                    onValueChange={(value) => setSelectedCategory({
                      ...selectedCategory,
                      parentId: value || undefined
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (Top Level)</SelectItem>
                      {getParentCategories()
                        .filter(cat => cat.id !== selectedCategory.id)
                        .map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={selectedCategory.description}
                  onChange={(e) => setSelectedCategory({
                    ...selectedCategory,
                    description: e.target.value
                  })}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        className={`h-8 w-8 rounded-lg border-2 ${
                          selectedCategory.color === color ? 'border-primary' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedCategory({
                          ...selectedCategory,
                          color
                        })}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Icon</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        className={`h-8 w-8 rounded border-2 flex items-center justify-center ${
                          selectedCategory.icon === icon ? 'border-primary bg-primary/10' : 'border-muted hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedCategory({
                          ...selectedCategory,
                          icon
                        })}
                      >
                        {getIconComponent(icon)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="budget">Monthly Budget Limit (Optional)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={selectedCategory.budgetLimit || ''}
                  onChange={(e) => setSelectedCategory({
                    ...selectedCategory,
                    budgetLimit: e.target.value ? parseFloat(e.target.value) : undefined
                  })}
                  placeholder="Enter budget limit"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCategoryDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveCategory}>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update' : 'Create'} Category
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Auto-categorization Rules Dialog */}
      <Dialog open={showRulesDialog} onOpenChange={setShowRulesDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Auto-Categorization Rules</DialogTitle>
            <DialogDescription>
              Set up rules to automatically categorize transactions based on description, vendor, amount, or account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {categories.map(category => {
              const rules = getRulesForCategory(category.id);
              return (
                <Card key={category.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="h-6 w-6 rounded flex items-center justify-center"
                          style={{ backgroundColor: category.color }}
                        >
                          {getIconComponent(category.icon)}
                        </div>
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="outline">{rules.length} rules</Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateRule(category.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Rule
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {rules.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {rules.map(rule => (
                          <div key={rule.id} className="flex items-center space-x-2 p-2 border rounded">
                            <Select
                              value={rule.field}
                              onValueChange={(value) => handleUpdateRule(rule.id, { field: value as any })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="description">Description</SelectItem>
                                <SelectItem value="vendor">Vendor</SelectItem>
                                <SelectItem value="amount">Amount</SelectItem>
                                <SelectItem value="account">Account</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select
                              value={rule.condition}
                              onValueChange={(value) => handleUpdateRule(rule.id, { condition: value as any })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="starts_with">Starts with</SelectItem>
                                <SelectItem value="ends_with">Ends with</SelectItem>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="amount_range">Amount range</SelectItem>
                              </SelectContent>
                            </Select>

                            <Input
                              value={rule.value}
                              onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                              placeholder="Enter value"
                              className="flex-1"
                            />

                            <Badge variant={rule.isActive ? "default" : "secondary"}>
                              Priority {rule.priority}
                            </Badge>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateRule(rule.id, { isActive: !rule.isActive })}
                            >
                              {rule.isActive ? <CheckCircle className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4" />}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowRulesDialog(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManagementInterface;
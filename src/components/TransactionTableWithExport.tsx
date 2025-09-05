import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
}

interface TransactionTableProps {
  transactions: Transaction[];
  title?: string;
  showFilters?: boolean;
}

const TransactionTableWithExport: React.FC<TransactionTableProps> = ({ 
  transactions, 
  title = "Transaction Analysis",
  showFilters = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Process and filter transactions
  const { filteredTransactions, summary, categories } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { 
        filteredTransactions: [], 
        summary: { totalIncome: 0, totalExpenses: 0, netFlow: 0, transactionCount: 0 },
        categories: ['all']
      };
    }
    
    // Extract unique categories
    const uniqueCategories = ['all', ...Array.from(new Set(transactions.map(tx => tx.category).filter(Boolean)))];
    
    // Apply filters
    let filtered = transactions.filter(tx => {
      const matchesSearch = !searchTerm || 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      
      return matchesSearch && matchesCategory && matchesType;
    });
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = Math.abs(a.amount);
          bValue = Math.abs(b.amount);
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // Calculate summary
    const totalIncome = filtered.filter(tx => tx.amount > 0 || tx.type === 'income')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const totalExpenses = filtered.filter(tx => tx.amount < 0 || tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    return {
      filteredTransactions: filtered,
      summary: {
        totalIncome,
        totalExpenses,
        netFlow: totalIncome - totalExpenses,
        transactionCount: filtered.length
      },
      categories: uniqueCategories
    };
  }, [transactions, searchTerm, categoryFilter, typeFilter, sortBy, sortDirection]);
  
  const handleExportToExcel = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export');
      return;
    }
    
    // Prepare data for Excel export
    const exportData = filteredTransactions.map(tx => ({
      Date: tx.date,
      Description: tx.description,
      Category: tx.category,
      Type: tx.type,
      Amount: tx.amount,
      'Formatted Amount': `$${tx.amount.toLocaleString()}`,
      'Absolute Amount': Math.abs(tx.amount)
    }));
    
    // Add summary row
    exportData.push({
      Date: '',
      Description: '--- SUMMARY ---',
      Category: '',
      Type: '',
      Amount: '',
      'Formatted Amount': '',
      'Absolute Amount': ''
    });
    
    exportData.push({
      Date: '',
      Description: 'Total Income',
      Category: '',
      Type: '',
      Amount: summary.totalIncome,
      'Formatted Amount': `$${summary.totalIncome.toLocaleString()}`,
      'Absolute Amount': summary.totalIncome
    });
    
    exportData.push({
      Date: '',
      Description: 'Total Expenses',
      Category: '',
      Type: '',
      Amount: -summary.totalExpenses,
      'Formatted Amount': `$${(-summary.totalExpenses).toLocaleString()}`,
      'Absolute Amount': summary.totalExpenses
    });
    
    exportData.push({
      Date: '',
      Description: 'Net Flow',
      Category: '',
      Type: '',
      Amount: summary.netFlow,
      'Formatted Amount': `$${summary.netFlow.toLocaleString()}`,
      'Absolute Amount': Math.abs(summary.netFlow)
    });
    
    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    
    // Generate filename with current date
    const filename = `zenflux-transactions-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
  };
  
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No transaction data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Upload transaction data to see detailed analysis
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {summary.transactionCount} transactions • Net Flow: 
              <span className={summary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                ${summary.netFlow.toLocaleString()}
              </span>
            </CardDescription>
          </div>
          <Button onClick={handleExportToExcel} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export to Excel
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Income</p>
                <p className="text-2xl font-bold text-green-700">${summary.totalIncome.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Total Expenses</p>
                <p className="text-2xl font-bold text-red-700">${summary.totalExpenses.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className={`${summary.netFlow >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-4 rounded-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${summary.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'} text-sm font-medium`}>Net Flow</p>
                <p className={`text-2xl font-bold ${summary.netFlow >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  ${summary.netFlow.toLocaleString()}
                </p>
              </div>
              <DollarSign className={`w-8 h-8 ${summary.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Transactions</p>
                <p className="text-2xl font-bold text-purple-700">{summary.transactionCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="description">Description</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Transaction Table */}
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('date')}
                  >
                    Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('description')}
                  >
                    Description {sortBy === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('category')}
                  >
                    Category {sortBy === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th 
                    className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('amount')}
                  >
                    Amount {sortBy === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, index) => (
                  <tr key={tx.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {tx.description}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="secondary">{tx.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={tx.type === 'income' ? 'default' : 'destructive'}>
                        {tx.type}
                      </Badge>
                    </td>
                    <td className={`px-4 py-3 text-sm font-bold text-right ${
                      tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No transactions match your current filters
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionTableWithExport;
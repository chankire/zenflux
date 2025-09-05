import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface Transaction {
  date: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
}

interface ExpenseBreakdownProps {
  transactions: Transaction[];
}

const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange  
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#64748b', // Slate
  '#84cc16', // Lime
  '#f59e0b', // Amber
  '#10b981'  // Emerald
];

const ExpenseBreakdownChart: React.FC<ExpenseBreakdownProps> = ({ transactions }) => {
  const { expenseData, totalExpenses, expenseTable } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      // Sample data for demonstration
      const sampleExpenseData = [
        { name: 'Payroll', value: 125000, percentage: 42.3 },
        { name: 'Marketing', value: 45000, percentage: 15.2 },
        { name: 'Office Rent', value: 35000, percentage: 11.8 },
        { name: 'Infrastructure', value: 28000, percentage: 9.5 },
        { name: 'Professional Services', value: 22000, percentage: 7.4 },
        { name: 'Equipment', value: 18000, percentage: 6.1 },
        { name: 'Travel', value: 12000, percentage: 4.1 },
        { name: 'Other', value: 10000, percentage: 3.4 }
      ];
      
      const sampleTable = sampleExpenseData.map((item, index) => ({
        ...item,
        rank: index + 1,
        transactions: Math.floor(Math.random() * 25) + 5,
        avgAmount: Math.round(item.value / (Math.floor(Math.random() * 25) + 5)),
        color: COLORS[index % COLORS.length]
      }));
      
      return {
        expenseData: sampleExpenseData,
        totalExpenses: sampleExpenseData.reduce((sum, item) => sum + item.value, 0),
        expenseTable: sampleTable
      };
    }
    
    // Process real transaction data - expenses only
    const expenses = transactions.filter(tx => 
      tx.amount < 0 || tx.type === 'expense'
    );
    
    // Group by category and calculate totals
    const categoryTotals: Record<string, { 
      total: number; 
      count: number; 
      transactions: Transaction[] 
    }> = {};
    
    expenses.forEach(tx => {
      const category = tx.category || 'Uncategorized';
      const amount = Math.abs(tx.amount);
      
      if (!categoryTotals[category]) {
        categoryTotals[category] = { total: 0, count: 0, transactions: [] };
      }
      
      categoryTotals[category].total += amount;
      categoryTotals[category].count += 1;
      categoryTotals[category].transactions.push(tx);
    });
    
    const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.total, 0);
    
    // Convert to chart data and sort by value
    const expenseData = Object.entries(categoryTotals)
      .map(([name, data]) => ({
        name,
        value: Math.round(data.total),
        percentage: ((data.total / totalExpenses) * 100),
        count: data.count,
        avgAmount: Math.round(data.total / data.count)
      }))
      .sort((a, b) => b.value - a.value);
    
    // Create table data with colors
    const expenseTable = expenseData.map((item, index) => ({
      ...item,
      rank: index + 1,
      transactions: item.count,
      color: COLORS[index % COLORS.length]
    }));
    
    return {
      expenseData: expenseData.slice(0, 12), // Top 12 categories
      totalExpenses: Math.round(totalExpenses),
      expenseTable
    };
  }, [transactions]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-lg">${data.value.toLocaleString()}</p>
          <p className="text-sm text-gray-600">{data.percentage.toFixed(1)}% of total</p>
          <p className="text-sm text-gray-600">{data.count} transactions</p>
          <p className="text-sm text-gray-600">Avg: ${data.avgAmount.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };
  
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  if (expenseData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No expense data available for breakdown analysis
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Donut Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={expenseData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
            >
              {expenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center total */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold">${(totalExpenses / 1000).toFixed(0)}K</div>
            <div className="text-sm text-gray-600">Total Expenses</div>
          </div>
        </div>
      </div>
      
      {/* Expense Table */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-3">Expense Categories</h4>
        <div className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-1">#</th>
                <th className="text-left py-2 px-2">Category</th>
                <th className="text-right py-2 px-2">Amount</th>
                <th className="text-right py-2 px-2">%</th>
                <th className="text-right py-2 px-2">Txns</th>
                <th className="text-right py-2 px-2">Avg</th>
              </tr>
            </thead>
            <tbody>
              {expenseTable.slice(0, 8).map((item) => (
                <tr key={item.name} className="border-b border-gray-200">
                  <td className="py-2 px-1">{item.rank}</td>
                  <td className="py-2 px-2 flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="truncate">{item.name}</span>
                  </td>
                  <td className="py-2 px-2 text-right font-medium">
                    ${item.value.toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {item.percentage.toFixed(1)}%
                  </td>
                  <td className="py-2 px-2 text-right">
                    {item.transactions}
                  </td>
                  <td className="py-2 px-2 text-right">
                    ${item.avgAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {expenseTable.length > 8 && (
          <div className="mt-3 text-center text-sm text-gray-600">
            and {expenseTable.length - 8} more categories...
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseBreakdownChart;
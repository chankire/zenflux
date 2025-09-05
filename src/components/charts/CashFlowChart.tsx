import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';

interface Transaction {
  date: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
}

interface CashFlowChartProps {
  transactions: Transaction[];
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      // Return sample data for demonstration
      const sampleData = [];
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - 90); // Last 90 days
      
      let runningBalance = 125000;
      
      for (let i = 0; i < 90; i++) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + i);
        
        // Simulate cash flow patterns
        const dailyIncome = (Math.random() * 2000 + 800) * (Math.sin(i / 30) + 1.2);
        const dailyExpense = -(Math.random() * 1500 + 600) * (Math.cos(i / 20) + 1.1);
        const netFlow = dailyIncome + dailyExpense;
        
        runningBalance += netFlow;
        
        sampleData.push({
          date: format(date, 'MM/dd'),
          balance: Math.round(runningBalance),
          income: Math.round(dailyIncome),
          expense: Math.round(Math.abs(dailyExpense)),
          netFlow: Math.round(netFlow),
          formattedDate: format(date, 'MMM dd, yyyy')
        });
      }
      
      return sampleData;
    }
    
    // Process real transaction data
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Group by day and calculate running balance
    const dailyData: Record<string, { income: number; expense: number; transactions: Transaction[] }> = {};
    
    sortedTransactions.forEach(tx => {
      const dateKey = format(new Date(tx.date), 'yyyy-MM-dd');
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { income: 0, expense: 0, transactions: [] };
      }
      
      dailyData[dateKey].transactions.push(tx);
      
      if (tx.amount > 0 || tx.type === 'income') {
        dailyData[dateKey].income += Math.abs(tx.amount);
      } else {
        dailyData[dateKey].expense += Math.abs(tx.amount);
      }
    });
    
    // Convert to chart data with running balance
    let runningBalance = 0;
    const chartData = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, data]) => {
        const netFlow = data.income - data.expense;
        runningBalance += netFlow;
        
        return {
          date: format(new Date(dateKey), 'MM/dd'),
          balance: Math.round(runningBalance),
          income: Math.round(data.income),
          expense: Math.round(data.expense),
          netFlow: Math.round(netFlow),
          formattedDate: format(new Date(dateKey), 'MMM dd, yyyy'),
          transactionCount: data.transactions.length
        };
      });
    
    return chartData.slice(-90); // Last 90 days
  }, [transactions]);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.formattedDate}</p>
          <div className="space-y-1 mt-2">
            <p className="text-green-600">
              Income: ${data.income.toLocaleString()}
            </p>
            <p className="text-red-600">
              Expenses: ${data.expense.toLocaleString()}
            </p>
            <p className={`font-semibold ${data.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Net Flow: ${data.netFlow.toLocaleString()}
            </p>
            <p className="text-blue-600 font-semibold">
              Balance: ${data.balance.toLocaleString()}
            </p>
            {data.transactionCount && (
              <p className="text-gray-500 text-sm">
                {data.transactionCount} transaction{data.transactionCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };
  
  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No transaction data available for cash flow analysis
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#balanceGradient)"
          />
          <Line
            type="monotone"
            dataKey="netFlow"
            stroke="#10b981"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-green-600">Avg Daily Income</div>
          <div>${(chartData.reduce((sum, d) => sum + d.income, 0) / chartData.length).toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-red-600">Avg Daily Expense</div>
          <div>${(chartData.reduce((sum, d) => sum + d.expense, 0) / chartData.length).toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-blue-600">Avg Daily Net</div>
          <div className={chartData.reduce((sum, d) => sum + d.netFlow, 0) / chartData.length >= 0 ? 'text-green-600' : 'text-red-600'}>
            ${(chartData.reduce((sum, d) => sum + d.netFlow, 0) / chartData.length).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowChart;
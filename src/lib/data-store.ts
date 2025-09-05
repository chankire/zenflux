import { ProcessedTransaction, FileProcessResult } from './file-processor';

export interface DataStore {
  transactions: ProcessedTransaction[];
  uploadedFiles: FileProcessResult[];
  lastUpdated: Date | null;
  isLoading: boolean;
}

class TransactionDataStore {
  private data: DataStore = {
    transactions: [],
    uploadedFiles: [],
    lastUpdated: null,
    isLoading: false
  };
  
  private listeners: Array<(data: DataStore) => void> = [];
  
  subscribe(listener: (data: DataStore) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  private notify() {
    this.listeners.forEach(listener => listener({ ...this.data }));
  }
  
  setLoading(isLoading: boolean) {
    this.data.isLoading = isLoading;
    this.notify();
  }
  
  addFileData(fileResult: FileProcessResult) {
    console.log(`Adding file data: ${fileResult.fileName} with ${fileResult.transactions.length} transactions`);
    
    this.data.uploadedFiles.push(fileResult);
    
    // Add transactions to main store, avoiding duplicates
    const existingIds = new Set(this.data.transactions.map(tx => tx.id));
    const newTransactions = fileResult.transactions.filter(tx => !existingIds.has(tx.id));
    
    this.data.transactions.push(...newTransactions);
    this.data.lastUpdated = new Date();
    
    console.log(`Total transactions now: ${this.data.transactions.length}`);
    this.notify();
  }
  
  clearData() {
    this.data.transactions = [];
    this.data.uploadedFiles = [];
    this.data.lastUpdated = null;
    this.notify();
  }
  
  getData(): DataStore {
    return { ...this.data };
  }
  
  getTransactions(): ProcessedTransaction[] {
    return [...this.data.transactions];
  }
  
  // Calculate real metrics from uploaded data
  calculateMetrics() {
    const transactions = this.data.transactions;
    
    if (transactions.length === 0) {
      return {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        burnRate: 0,
        runwayMonths: 0,
        growthRate: 0,
        transactionCount: 0
      };
    }
    
    // Calculate total balance
    const totalBalance = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    // Calculate monthly metrics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTransactions = transactions.filter(tx => 
      new Date(tx.date) >= thirtyDaysAgo
    );
    
    const monthlyIncome = recentTransactions
      .filter(tx => tx.amount > 0 || tx.type === 'income')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    const monthlyExpenses = recentTransactions
      .filter(tx => tx.amount < 0 || tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    const netMonthlyFlow = monthlyIncome - monthlyExpenses;
    
    // Calculate runway (months remaining based on current burn rate)
    const runwayMonths = netMonthlyFlow < 0 ? 
      Math.abs(totalBalance / netMonthlyFlow) : 
      999; // Positive cash flow = infinite runway
    
    // Calculate growth rate (simplified)
    const growthRate = totalBalance > 0 ? 
      (netMonthlyFlow / totalBalance) * 100 : 
      0;
    
    console.log('Calculated metrics:', {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      burnRate: netMonthlyFlow,
      runwayMonths: Math.min(runwayMonths, 999),
      growthRate,
      transactionCount: transactions.length
    });
    
    return {
      totalBalance: Math.round(totalBalance),
      monthlyIncome: Math.round(monthlyIncome),
      monthlyExpenses: Math.round(monthlyExpenses),
      burnRate: Math.round(netMonthlyFlow), // Positive = profitable, negative = burning
      runwayMonths: Math.round(Math.min(runwayMonths, 999) * 10) / 10,
      growthRate: Math.round(growthRate * 10) / 10,
      transactionCount: transactions.length
    };
  }
}

// Export singleton instance
export const dataStore = new TransactionDataStore();

// React hook for using the data store
import { useState, useEffect } from 'react';

export function useTransactionData() {
  const [data, setData] = useState<DataStore>(dataStore.getData());
  
  useEffect(() => {
    const unsubscribe = dataStore.subscribe(setData);
    return unsubscribe;
  }, []);
  
  return {
    ...data,
    addFileData: (fileResult: FileProcessResult) => dataStore.addFileData(fileResult),
    clearData: () => dataStore.clearData(),
    setLoading: (loading: boolean) => dataStore.setLoading(loading),
    calculateMetrics: () => dataStore.calculateMetrics(),
    getTransactions: () => dataStore.getTransactions()
  };
}
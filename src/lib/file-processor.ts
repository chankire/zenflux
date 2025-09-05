import * as XLSX from 'xlsx';

export interface ProcessedTransaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
}

export interface FileProcessResult {
  success: boolean;
  transactions: ProcessedTransaction[];
  fileName: string;
  summary: {
    totalTransactions: number;
    dateRange: { start: string; end: string };
    totalIncome: number;
    totalExpenses: number;
    netFlow: number;
  };
  error?: string;
}

export class FileProcessor {
  static async processFile(file: File): Promise<FileProcessResult> {
    try {
      console.log(`Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      const fileExtension = file.name.toLowerCase().split('.').pop();
      
      switch (fileExtension) {
        case 'csv':
          return await this.processCSV(file);
        case 'xlsx':
        case 'xls':
          return await this.processExcel(file);
        default:
          throw new Error(`Unsupported file format: ${fileExtension}`);
      }
    } catch (error: any) {
      console.error('File processing error:', error);
      return {
        success: false,
        transactions: [],
        fileName: file.name,
        summary: {
          totalTransactions: 0,
          dateRange: { start: '', end: '' },
          totalIncome: 0,
          totalExpenses: 0,
          netFlow: 0
        },
        error: error.message || 'Unknown error processing file'
      };
    }
  }
  
  private static async processCSV(file: File): Promise<FileProcessResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csvData = e.target?.result as string;
          const lines = csvData.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          
          console.log('CSV Headers detected:', headers);
          
          const transactions: ProcessedTransaction[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = this.parseCSVLine(line);
            if (values.length < 3) continue;
            
            const transaction = this.mapToTransaction(headers, values, i);
            if (transaction) {
              transactions.push(transaction);
            }
          }
          
          console.log(`Processed ${transactions.length} transactions from CSV`);
          
          const summary = this.calculateSummary(transactions);
          
          resolve({
            success: true,
            transactions,
            fileName: file.name,
            summary
          });
        } catch (error: any) {
          console.error('CSV processing error:', error);
          resolve({
            success: false,
            transactions: [],
            fileName: file.name,
            summary: {
              totalTransactions: 0,
              dateRange: { start: '', end: '' },
              totalIncome: 0,
              totalExpenses: 0,
              netFlow: 0
            },
            error: error.message
          });
        }
      };
      
      reader.readAsText(file);
    });
  }
  
  private static async processExcel(file: File): Promise<FileProcessResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length < 2) {
            throw new Error('Excel file must have at least a header row and one data row');
          }
          
          const headers = jsonData[0].map((h: any) => String(h || '').trim());
          console.log('Excel Headers detected:', headers);
          
          const transactions: ProcessedTransaction[] = [];
          
          for (let i = 1; i < jsonData.length; i++) {
            const values = jsonData[i];
            if (!values || values.length < 3) continue;
            
            const transaction = this.mapToTransaction(headers, values, i);
            if (transaction) {
              transactions.push(transaction);
            }
          }
          
          console.log(`Processed ${transactions.length} transactions from Excel`);
          
          const summary = this.calculateSummary(transactions);
          
          resolve({
            success: true,
            transactions,
            fileName: file.name,
            summary
          });
        } catch (error: any) {
          console.error('Excel processing error:', error);
          resolve({
            success: false,
            transactions: [],
            fileName: file.name,
            summary: {
              totalTransactions: 0,
              dateRange: { start: '', end: '' },
              totalIncome: 0,
              totalExpenses: 0,
              netFlow: 0
            },
            error: error.message
          });
        }
      };
      
      reader.readAsArrayBuffer(file);
    });
  }
  
  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i - 1] === ',')) {
        inQuotes = true;
      } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i + 1] === ',')) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }
  
  private static mapToTransaction(headers: string[], values: any[], index: number): ProcessedTransaction | null {
    try {
      // Find column indices for common field names
      const dateIndex = this.findColumnIndex(headers, ['date', 'transaction date', 'value date', 'posted date']);
      const amountIndex = this.findColumnIndex(headers, ['amount', 'value', 'transaction amount', 'debit', 'credit']);
      const descriptionIndex = this.findColumnIndex(headers, ['description', 'transaction description', 'details', 'memo']);
      const categoryIndex = this.findColumnIndex(headers, ['category', 'type', 'transaction type']);
      
      if (dateIndex === -1 || amountIndex === -1) {
        console.warn(`Row ${index}: Missing required date or amount column`);
        return null;
      }
      
      // Extract and clean data
      const rawDate = values[dateIndex];
      const rawAmount = values[amountIndex];
      const description = (values[descriptionIndex] || `Transaction ${index}`).toString().trim();
      const category = (values[categoryIndex] || 'Uncategorized').toString().trim();
      
      // Parse date
      let date: string;
      if (typeof rawDate === 'number') {
        // Excel date serial number
        const excelDate = XLSX.SSF.parse_date_code(rawDate);
        date = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
      } else if (rawDate) {
        const parsedDate = new Date(rawDate);
        if (isNaN(parsedDate.getTime())) {
          console.warn(`Row ${index}: Invalid date format: ${rawDate}`);
          return null;
        }
        date = parsedDate.toISOString().split('T')[0];
      } else {
        console.warn(`Row ${index}: Missing date value`);
        return null;
      }
      
      // Parse amount
      let amount: number;
      if (typeof rawAmount === 'number') {
        amount = rawAmount;
      } else if (typeof rawAmount === 'string') {
        // Clean amount string (remove currency symbols, commas)
        const cleanAmount = rawAmount.replace(/[$,£€¥]/g, '').replace(/[()]/g, '').trim();
        amount = parseFloat(cleanAmount);
        
        // Handle parentheses as negative (accounting format)
        if (rawAmount.includes('(') && rawAmount.includes(')')) {
          amount = -Math.abs(amount);
        }
      } else {
        console.warn(`Row ${index}: Invalid amount format: ${rawAmount}`);
        return null;
      }
      
      if (isNaN(amount)) {
        console.warn(`Row ${index}: Amount is not a number: ${rawAmount}`);
        return null;
      }
      
      // Determine transaction type
      const type: 'income' | 'expense' = amount >= 0 ? 'income' : 'expense';
      
      return {
        id: `tx_${index}_${Date.now()}`,
        date,
        amount,
        description,
        category,
        type
      };
    } catch (error: any) {
      console.error(`Error processing row ${index}:`, error);
      return null;
    }
  }
  
  private static findColumnIndex(headers: string[], possibleNames: string[]): number {
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    
    for (const name of possibleNames) {
      const index = normalizedHeaders.findIndex(h => 
        h === name.toLowerCase() || 
        h.includes(name.toLowerCase()) ||
        name.toLowerCase().includes(h)
      );
      if (index !== -1) return index;
    }
    
    return -1;
  }
  
  private static calculateSummary(transactions: ProcessedTransaction[]) {
    if (transactions.length === 0) {
      return {
        totalTransactions: 0,
        dateRange: { start: '', end: '' },
        totalIncome: 0,
        totalExpenses: 0,
        netFlow: 0
      };
    }
    
    const sortedByDate = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const dateRange = {
      start: sortedByDate[0].date,
      end: sortedByDate[sortedByDate.length - 1].date
    };
    
    const totalIncome = transactions
      .filter(tx => tx.amount > 0 || tx.type === 'income')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    const totalExpenses = transactions
      .filter(tx => tx.amount < 0 || tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    return {
      totalTransactions: transactions.length,
      dateRange,
      totalIncome,
      totalExpenses,
      netFlow: totalIncome - totalExpenses
    };
  }
}
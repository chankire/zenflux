import { MockOrganization } from './auth';

export interface MockTransaction {
  id: string;
  organization_id: string;
  account_id: string;
  amount: number;
  currency: string;
  description: string;
  counterparty: string;
  category_id?: string;
  date: string;
  created_at: string;
  running_balance?: number;
  type: 'credit' | 'debit';
}

export interface MockBankAccount {
  id: string;
  organization_id: string;
  name: string;
  account_type: 'checking' | 'savings' | 'business' | 'credit_card';
  balance: number;
  currency: string;
  account_number_masked: string;
  bank_name: string;
  created_at: string;
}

export interface MockCategory {
  id: string;
  name: string;
  parent_id?: string;
  color: string;
  organization_id: string;
  is_system: boolean;
}

// Realistic transaction templates
const transactionTemplates = [
  { description: 'Office Supplies - Staples', counterparty: 'Staples Inc', category: 'Office Expenses', type: 'debit', amount: [50, 200] },
  { description: 'Software License - Microsoft', counterparty: 'Microsoft Corp', category: 'Software', type: 'debit', amount: [100, 500] },
  { description: 'Client Payment - Invoice #1234', counterparty: 'Acme Client Ltd', category: 'Revenue', type: 'credit', amount: [1000, 5000] },
  { description: 'Utility Payment - Electric', counterparty: 'City Power Co', category: 'Utilities', type: 'debit', amount: [200, 800] },
  { description: 'Employee Salary', counterparty: 'Payroll System', category: 'Payroll', type: 'debit', amount: [3000, 8000] },
  { description: 'Marketing - Google Ads', counterparty: 'Google LLC', category: 'Marketing', type: 'debit', amount: [500, 2000] },
  { description: 'Bank Transfer - Savings', counterparty: 'Internal Transfer', category: 'Transfers', type: 'credit', amount: [1000, 10000] },
  { description: 'Office Rent', counterparty: 'Property Management Co', category: 'Rent', type: 'debit', amount: [2000, 5000] },
  { description: 'Insurance Premium', counterparty: 'Business Insurance Co', category: 'Insurance', type: 'debit', amount: [300, 1200] },
  { description: 'Consulting Services', counterparty: 'Tech Consultants Inc', category: 'Professional Services', type: 'debit', amount: [1500, 5000] }
];

const categories: MockCategory[] = [
  { id: 'cat-1', name: 'Revenue', color: '#22c55e', organization_id: 'org-1', is_system: true },
  { id: 'cat-2', name: 'Office Expenses', color: '#f59e0b', organization_id: 'org-1', is_system: true },
  { id: 'cat-3', name: 'Software', color: '#3b82f6', organization_id: 'org-1', is_system: true },
  { id: 'cat-4', name: 'Utilities', color: '#8b5cf6', organization_id: 'org-1', is_system: true },
  { id: 'cat-5', name: 'Payroll', color: '#ef4444', organization_id: 'org-1', is_system: true },
  { id: 'cat-6', name: 'Marketing', color: '#ec4899', organization_id: 'org-1', is_system: true },
  { id: 'cat-7', name: 'Transfers', color: '#64748b', organization_id: 'org-1', is_system: true },
  { id: 'cat-8', name: 'Rent', color: '#dc2626', organization_id: 'org-1', is_system: true },
  { id: 'cat-9', name: 'Insurance', color: '#16a34a', organization_id: 'org-1', is_system: true },
  { id: 'cat-10', name: 'Professional Services', color: '#ca8a04', organization_id: 'org-1', is_system: true }
];

export const generateMockBankAccounts = (organizationId: string): MockBankAccount[] => {
  return [
    {
      id: `acc-${organizationId}-1`,
      organization_id: organizationId,
      name: 'Business Checking',
      account_type: 'checking',
      balance: 125000.50,
      currency: 'USD',
      account_number_masked: '****1234',
      bank_name: 'First National Bank',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: `acc-${organizationId}-2`,
      organization_id: organizationId,
      name: 'Business Savings',
      account_type: 'savings',
      balance: 250000.00,
      currency: 'USD',
      account_number_masked: '****5678',
      bank_name: 'First National Bank',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: `acc-${organizationId}-3`,
      organization_id: organizationId,
      name: 'Operating Account',
      account_type: 'business',
      balance: 75000.25,
      currency: 'USD',
      account_number_masked: '****9012',
      bank_name: 'Metro Business Bank',
      created_at: '2024-01-15T00:00:00Z'
    }
  ];
};

export const generateMockTransactions = (
  organizationId: string,
  accounts: MockBankAccount[],
  months: number = 12
): MockTransaction[] => {
  const transactions: MockTransaction[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - months);

  let transactionId = 1;

  // Generate transactions for each account
  accounts.forEach((account) => {
    let currentBalance = account.balance;
    const accountTransactions: MockTransaction[] = [];

    // Generate 5-20 transactions per month per account
    for (let month = 0; month < months; month++) {
      const monthStart = new Date(startDate);
      monthStart.setMonth(startDate.getMonth() + month);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const transactionsThisMonth = Math.floor(Math.random() * 15) + 5;

      for (let i = 0; i < transactionsThisMonth; i++) {
        const template = transactionTemplates[Math.floor(Math.random() * transactionTemplates.length)];
        const randomDate = new Date(
          monthStart.getTime() + Math.random() * (monthEnd.getTime() - monthStart.getTime())
        );

        const minAmount = template.amount[0];
        const maxAmount = template.amount[1];
        const amount = Math.floor(Math.random() * (maxAmount - minAmount) + minAmount);

        // Adjust balance based on transaction type
        if (template.type === 'debit') {
          currentBalance -= amount;
        } else {
          currentBalance += amount;
        }

        const transaction: MockTransaction = {
          id: `txn-${organizationId}-${transactionId++}`,
          organization_id: organizationId,
          account_id: account.id,
          amount: template.type === 'debit' ? -amount : amount,
          currency: account.currency,
          description: template.description,
          counterparty: template.counterparty,
          category_id: categories.find(c => c.name === template.category)?.id,
          date: randomDate.toISOString().split('T')[0],
          created_at: randomDate.toISOString(),
          running_balance: currentBalance,
          type: template.type as 'credit' | 'debit'
        };

        accountTransactions.push(transaction);
      }
    }

    // Sort transactions by date (oldest first) and recalculate running balance
    accountTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningBalance = account.balance - accountTransactions.reduce((sum, t) => sum + t.amount, 0);
    accountTransactions.forEach(transaction => {
      runningBalance += transaction.amount;
      transaction.running_balance = runningBalance;
    });

    transactions.push(...accountTransactions);
  });

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const generateMockForecastModels = (organizationId: string) => {
  return [
    {
      id: `forecast-${organizationId}-1`,
      organization_id: organizationId,
      name: 'LSTM Revenue Forecast',
      model_type: 'lstm',
      status: 'active',
      accuracy: 0.87,
      created_at: '2024-01-01T00:00:00Z',
      last_run: '2024-03-01T00:00:00Z'
    },
    {
      id: `forecast-${organizationId}-2`,
      organization_id: organizationId,
      name: 'ARIMA Cash Flow Model',
      model_type: 'arima',
      status: 'active',
      accuracy: 0.82,
      created_at: '2024-01-15T00:00:00Z',
      last_run: '2024-03-01T00:00:00Z'
    },
    {
      id: `forecast-${organizationId}-3`,
      organization_id: organizationId,
      name: 'Ensemble Expense Predictor',
      model_type: 'ensemble',
      status: 'training',
      accuracy: 0.91,
      created_at: '2024-02-01T00:00:00Z',
      last_run: '2024-02-28T00:00:00Z'
    }
  ];
};

// Generate complete mock dataset for an organization
export const generateMockDataset = (organization: MockOrganization) => {
  const accounts = generateMockBankAccounts(organization.id);
  const transactions = generateMockTransactions(organization.id, accounts, 12);
  const forecastModels = generateMockForecastModels(organization.id);

  return {
    organization,
    accounts,
    transactions,
    categories: categories.map(cat => ({ ...cat, organization_id: organization.id })),
    forecastModels
  };
};

export { categories };
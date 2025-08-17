import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role to bypass RLS for seeding
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const demoOrgId = '123e4567-e89b-12d3-a456-426614174000';

    console.log('Seeding demo data for user:', user.id);

    // Add user to demo organization
    const { error: membershipError } = await supabase
      .from('memberships')
      .upsert({
        user_id: user.id,
        organization_id: demoOrgId,
        role: 'org_owner'
      });

    if (membershipError && !membershipError.message.includes('duplicate')) {
      throw membershipError;
    }

    // Create sample bank connections and accounts
    const { data: connection, error: connectionError } = await supabase
      .from('bank_connections')
      .upsert({
        organization_id: demoOrgId,
        name: 'Demo Bank Connection',
        provider: 'demo',
        status: 'connected'
      })
      .select()
      .single();

    if (connectionError && !connectionError.message.includes('duplicate')) {
      throw connectionError;
    }

    // Create sample bank accounts
    const bankAccounts = [
      {
        organization_id: demoOrgId,
        connection_id: connection.id,
        name: 'Business Checking',
        currency: 'USD',
        masked_number: '****1234',
        account_type: 'checking',
        current_balance: 125000.00
      },
      {
        organization_id: demoOrgId,
        connection_id: connection.id,
        name: 'Savings Account',
        currency: 'USD',
        masked_number: '****5678',
        account_type: 'savings',
        current_balance: 75000.00
      }
    ];

    const { data: accounts, error: accountsError } = await supabase
      .from('bank_accounts')
      .upsert(bankAccounts)
      .select();

    if (accountsError && !accountsError.message.includes('duplicate')) {
      throw accountsError;
    }

    // Generate sample transactions for the last 90 days
    const transactions = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 90);

    for (let i = 0; i < 90; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      // Generate 2-5 random transactions per day
      const transactionsPerDay = Math.floor(Math.random() * 4) + 2;
      
      for (let j = 0; j < transactionsPerDay; j++) {
        const isInflow = Math.random() > 0.6; // 40% chance of inflow
        const amount = isInflow 
          ? Math.floor(Math.random() * 15000) + 1000  // Inflows: $1K-$16K
          : -(Math.floor(Math.random() * 8000) + 500); // Outflows: $500-$8.5K

        const counterparties = isInflow 
          ? ['Client Payment', 'Contract Revenue', 'Service Fee', 'Product Sale', 'Consulting Revenue']
          : ['Office Rent', 'Payroll', 'Utilities', 'Marketing Spend', 'Software License', 'Travel Expense'];

        transactions.push({
          organization_id: demoOrgId,
          bank_account_id: accounts[Math.floor(Math.random() * accounts.length)].id,
          value_date: date.toISOString().split('T')[0],
          amount: amount,
          currency: 'USD',
          counterparty: counterparties[Math.floor(Math.random() * counterparties.length)],
          memo: `${isInflow ? 'Payment' : 'Expense'} - ${date.toDateString()}`,
          is_forecast: false
        });
      }
    }

    const { error: transactionsError } = await supabase
      .from('transactions')
      .upsert(transactions);

    if (transactionsError && !transactionsError.message.includes('duplicate')) {
      throw transactionsError;
    }

    // Create a sample forecast model
    const { data: model, error: modelError } = await supabase
      .from('forecast_models')
      .upsert({
        organization_id: demoOrgId,
        name: 'Default Cash Flow Model',
        horizon_days: 90,
        frequency: 'daily',
        status: 'pending',
        method: 'ensemble',
        created_by: user.id
      })
      .select()
      .single();

    if (modelError && !modelError.message.includes('duplicate')) {
      throw modelError;
    }

    console.log('Demo data seeded successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Demo data seeded successfully',
      data: {
        organization: demoOrgId,
        accounts: accounts.length,
        transactions: transactions.length,
        model: model.id
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error seeding demo data:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: 'Failed to seed demo data'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
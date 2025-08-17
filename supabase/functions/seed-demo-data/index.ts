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
        // --- ADD THIS LINE ---
    console.log("--- RUNNING LATEST CORRECTED CODE v2 ---");
    // --- END OF NEW LINE ---
    // 1. Initialize the Admin client to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Get the authenticated user from the request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);

    if (!user) {
      throw new Error('User not authenticated');
    }
    console.log('Authenticated user:', user.id);

    // 3. --- FIX --- Ensure the user profile exists before doing anything else.
    // This single 'upsert' will create the profile if it's missing or do nothing if it exists.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email!,
        first_name: user.user_metadata?.first_name || 'Demo',
        last_name: user.user_metadata?.last_name || 'User'
      });

    // If this fails, stop immediately.
    if (profileError) {
      console.error('Error ensuring user profile:', profileError);
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }
    console.log('User profile ensured for:', user.id);

    // 4. Upsert the Demo Organisation
    const demoOrgId = '123e4567-e89b-12d3-a456-426614174000';
    const { error: orgError } = await supabaseAdmin
      .from('organizations')
      .upsert({
        id: demoOrgId,
        name: 'Demo Organisation',
        slug: 'demo-org',
        base_currency: 'USD'
      });

    if (orgError) {
      throw new Error(`Failed to ensure demo organization: ${orgError.message}`);
    }
    console.log('Demo organization ensured.');

   // 5. Upsert the user's membership to the organisation
const { error: membershipError } = await supabaseAdmin
  .from('memberships')
  .upsert(
    {
      user_id: user.id,
      organization_id: demoOrgId,
      role: 'org_owner'
    },
    // --- THIS IS THE FIX ---
    // Tells Supabase to ignore the insert if this user/org combo already exists
    { onConflict: 'user_id, organization_id' } 
  );

    if (membershipError) {
      throw new Error(`Failed to create membership: ${membershipError.message}`);
    }
    console.log('Membership ensured.');

    // 6. Create sample bank connections and accounts (simplified)
    const { data: connection } = await supabaseAdmin
      .from('bank_connections')
      .upsert({
        organization_id: demoOrgId,
        name: 'Demo Bank Connection',
        provider: 'demo',
        status: 'connected'
      })
      .select()
      .single();

    const bankAccounts = [
      { organization_id: demoOrgId, connection_id: connection.id, name: 'Business Current Account', currency: 'USD', masked_number: '****1234', account_type: 'current', current_balance: 125000.00 },
      { organization_id: demoOrgId, connection_id: connection.id, name: 'Business Savings Account', currency: 'USD', masked_number: '****5678', account_type: 'savings', current_balance: 75000.00 },
      { organization_id: demoOrgId, connection_id: connection.id, name: 'Investment Portfolio', currency: 'USD', masked_number: '****9012', account_type: 'investment', current_balance: 250000.00 }
    ];
    const { data: accounts, error: accountsError } = await supabaseAdmin.from('bank_accounts').upsert(bankAccounts).select();
    if (accountsError) throw accountsError;

    // 7. Generate and insert sample transactions
    const transactions = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 90);
    for (let i = 0; i < 90; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);
        const transactionsPerDay = Math.floor(Math.random() * 4) + 2;
        for (let j = 0; j < transactionsPerDay; j++) {
            const isInflow = Math.random() > 0.6;
            const amount = isInflow ? Math.floor(Math.random() * 15000) + 1000 : -(Math.floor(Math.random() * 8000) + 500);
            const counterparties = isInflow ? ['Client Payment', 'Contract Revenue', 'Service Fee'] : ['Office Rent', 'Payroll', 'Utilities', 'Marketing Spend'];
            transactions.push({
                organization_id: demoOrgId,
                bank_account_id: accounts[Math.floor(Math.random() * accounts.length)].id,
                value_date: date.toISOString().split('T')[0],
                amount: amount,
                currency: 'USD',
                counterparty: counterparties[Math.floor(Math.random() * counterparties.length)],
                memo: `${isInflow ? 'Payment' : 'Expense'}`,
                is_forecast: false
            });
        }
    }
    const { error: transactionsError } = await supabaseAdmin.from('transactions').upsert(transactions);
    if (transactionsError) throw transactionsError;

    console.log('Demo data seeded successfully.');
    return new Response(JSON.stringify({ success: true, message: 'Demo data seeded successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Critical error in demo data seeding:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
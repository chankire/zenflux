// Test script for validating the demo data seeding function
// This can be run as a separate function or integrated into your test suite

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  data?: any;
}

export async function validateDemoDataSeeding(authToken: string): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Get user from token
  const { data: { user }, error: authError } = await supabase.auth.getUser(authToken.replace('Bearer ', ''));
  
  if (authError || !user) {
    results.push({
      test: 'User Authentication',
      passed: false,
      error: 'Failed to authenticate user'
    });
    return results;
  }

  const demoOrgId = '123e4567-e89b-12d3-a456-426614174000';

  // Test 1: Verify user profile exists
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    results.push({
      test: 'User Profile Exists',
      passed: !error && !!profile,
      error: error?.message,
      data: profile ? { id: profile.id, email: profile.email } : null
    });
  } catch (error: any) {
    results.push({
      test: 'User Profile Exists',
      passed: false,
      error: error.message
    });
  }

  // Test 2: Verify organization exists
  try {
    const { data: org, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', demoOrgId)
      .single();

    results.push({
      test: 'Demo Organization Exists',
      passed: !error && !!org,
      error: error?.message,
      data: org ? { id: org.id, name: org.name } : null
    });
  } catch (error: any) {
    results.push({
      test: 'Demo Organization Exists',
      passed: false,
      error: error.message
    });
  }

  // Test 3: Verify membership exists
  try {
    const { data: membership, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', user.id)
      .eq('organization_id', demoOrgId)
      .single();

    results.push({
      test: 'User Membership Exists',
      passed: !error && !!membership,
      error: error?.message,
      data: membership ? { role: membership.role } : null
    });
  } catch (error: any) {
    results.push({
      test: 'User Membership Exists',
      passed: false,
      error: error.message
    });
  }

  // Test 4: Verify bank connections exist
  try {
    const { data: connections, error } = await supabase
      .from('bank_connections')
      .select('*')
      .eq('organization_id', demoOrgId);

    results.push({
      test: 'Bank Connections Exist',
      passed: !error && connections && connections.length > 0,
      error: error?.message,
      data: connections ? { count: connections.length } : null
    });
  } catch (error: any) {
    results.push({
      test: 'Bank Connections Exist',
      passed: false,
      error: error.message
    });
  }

  // Test 5: Verify bank accounts exist
  try {
    const { data: accounts, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('organization_id', demoOrgId);

    results.push({
      test: 'Bank Accounts Exist',
      passed: !error && accounts && accounts.length >= 2,
      error: error?.message,
      data: accounts ? { count: accounts.length, accounts: accounts.map(a => ({ name: a.name, balance: a.current_balance })) } : null
    });
  } catch (error: any) {
    results.push({
      test: 'Bank Accounts Exist',
      passed: false,
      error: error.message
    });
  }

  // Test 6: Verify transactions exist
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('count')
      .eq('organization_id', demoOrgId);

    const count = transactions?.[0]?.count || 0;
    
    results.push({
      test: 'Sample Transactions Exist',
      passed: !error && count > 0,
      error: error?.message,
      data: { count }
    });
  } catch (error: any) {
    results.push({
      test: 'Sample Transactions Exist',
      passed: false,
      error: error.message
    });
  }

  // Test 7: Verify data integrity (foreign key relationships)
  try {
    const { data: integrityCheck, error } = await supabase
      .from('transactions')
      .select(`
        id,
        bank_accounts!inner(
          id,
          name,
          organizations!inner(
            id,
            name
          )
        )
      `)
      .eq('organization_id', demoOrgId)
      .limit(5);

    results.push({
      test: 'Data Integrity Check',
      passed: !error && integrityCheck && integrityCheck.length > 0,
      error: error?.message,
      data: integrityCheck ? { samplesChecked: integrityCheck.length } : null
    });
  } catch (error: any) {
    results.push({
      test: 'Data Integrity Check',
      passed: false,
      error: error.message
    });
  }

  return results;
}

// Edge function for testing the demo seeding
export const testDemoSeeding = async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const results = await validateDemoDataSeeding(authHeader);
    const allPassed = results.every(r => r.passed);
    const summary = {
      allTestsPassed: allPassed,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length
    };

    return new Response(JSON.stringify({
      success: true,
      summary,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: allPassed ? 200 : 422
    });

  } catch (error: any) {
    console.error('Test validation error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

// Manual cleanup function (use with caution in development)
export const cleanupDemoData = async (authToken: string, organizationId: string = '123e4567-e89b-12d3-a456-426614174000') => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data: { user } } = await supabase.auth.getUser(authToken.replace('Bearer ', ''));
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Delete in correct order to respect foreign key constraints
  await supabase.from('transactions').delete().eq('organization_id', organizationId);
  await supabase.from('bank_accounts').delete().eq('organization_id', organizationId);
  await supabase.from('bank_connections').delete().eq('organization_id', organizationId);
  await supabase.from('memberships').delete().eq('user_id', user.id).eq('organization_id', organizationId);
  // Note: We don't delete the organization or profile as they might be shared

  console.log('Demo data cleaned up successfully');
};
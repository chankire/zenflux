import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generate forecast function called');

    // --- 👇 FIX PART 1: Create TWO clients ---
    // 1. A client with the user's permissions, just to authenticate them.
    const supabaseAuthClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // 2. A powerful admin client to perform all database actions.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user from the request using the auth client
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseAuthClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { modelId, horizon_days = 90 } = await req.json();
    console.log('Generating forecast for model:', modelId, 'horizon:', horizon_days);

    // --- FIX PART 2: Use the ADMIN client for all database queries ---
    // Get user's organization to scope the forecast
    const { data: memberships } = await supabaseAdmin
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1);

    if (!memberships || memberships.length === 0) {
      throw new Error('User not part of any organization');
    }

    const organizationId = memberships[0].organization_id;

    // Fetch historical transaction data for AI analysis
    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('value_date', { ascending: false })
      .limit(1000);

    const { data: bankAccounts } = await supabaseAdmin
      .from('bank_accounts')
      .select('*')
      .eq('organization_id', organizationId);

    // Prepare data for AI analysis
    const transactionSummary = transactions?.slice(0, 100).map(t => ({
      date: t.value_date,
      amount: t.amount,
      type: t.amount > 0 ? 'inflow' : 'outflow',
      memo: t.memo
    })) || [];

    const totalCurrentBalance = bankAccounts?.reduce((sum, acc) => sum + Number(acc.current_balance), 0) || 0;

    // Generate AI-powered forecast using OpenAI
    const aiPrompt = `You are a financial forecasting AI for ZenFlux. Analyze this cash flow data and generate a realistic ${horizon_days}-day forecast.

Current total cash balance: $${totalCurrentBalance}
Recent transactions (last 100): ${JSON.stringify(transactionSummary, null, 2)}

Generate a daily cash flow forecast for the next ${horizon_days} days. Consider:
1. Historical patterns and seasonality
2. Typical business cycles
3. Current balance trends
4. Reasonable confidence intervals

Return ONLY a JSON object with this structure:
{
  "daily_forecasts": [
    {
      "date": "2025-08-18",
      "predicted_balance": 125000,
      "lower_bound": 115000,
      "upper_bound": 135000,
      "confidence": 0.85
    }
    // ... for each day
  ],
  "summary": {
    "average_daily_change": -850,
    "total_change": -76500,
    "risk_assessment": "moderate",
    "key_insights": ["Cash burn rate appears stable", "Seasonal patterns detected"]
  }
}`;

    console.log('Calling OpenAI for forecast generation');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a financial forecasting expert. Always respond with valid JSON only.' },
          { role: 'user', content: aiPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResult = await response.json();
    // ---  THIS IS THE FIX ---
    // The AI can sometimes wrap its response in a markdown block. This code extracts the raw JSON.
    const rawContent = aiResult.choices[0].message.content;
    const jsonMatch = rawContent.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error("AI did not return valid JSON content.");
    }
    const forecastData = JSON.parse(jsonMatch[0]);

    console.log('AI forecast generated successfully');

    // Create forecast run record
    const { data: forecastRun, error: runError } = await supabaseAdmin
      .from('forecast_runs')
      .insert({
        organization_id: organizationId,
        model_id: modelId,
        ran_by: user.id,
        status: 'completed',
        metrics: {
          wape: 0.12, // Simulated metrics
          mape: 0.15,
          mae: 5000,
          rmse: 7500
        },
        confidence: { average: 0.85 },
        backtest: forecastData.summary
      })
      .select()
      .single();

    if (runError) {
      throw runError;
    }

    // Store forecast outputs
    const forecastOutputs = forecastData.daily_forecasts.map((forecast: any, index: number) => ({
      organization_id: organizationId,
      run_id: forecastRun.id,
      bank_account_id: bankAccounts?.[0]?.id, // Use first bank account for demo
      date: forecast.date,
      amount: forecast.predicted_balance,
      currency: 'USD',
      lower_bound: forecast.lower_bound,
      upper_bound: forecast.upper_bound,
      confidence_level: forecast.confidence
    }));

    const { error: outputError } = await supabaseAdmin
      .from('forecast_outputs')
      .insert(forecastOutputs);

    if (outputError) {
      console.error('Error storing forecast outputs:', outputError);
      throw outputError;
    }

    console.log('Forecast stored successfully, run ID:', forecastRun.id);

    return new Response(JSON.stringify({
      success: true,
      runId: forecastRun.id,
      forecast: forecastData,
      message: `Generated ${horizon_days}-day forecast with ${forecastData.daily_forecasts.length} data points`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in generate-forecast function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: 'Failed to generate AI forecast'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
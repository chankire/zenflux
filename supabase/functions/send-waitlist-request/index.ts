import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ Fixed environment variable names
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Rate limiting helper
async function checkRateLimit(supabase: any, identifier: string, endpoint: string): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 60000); // 1 minute window
  
  const { data: existingRequests } = await supabase
    .from('rate_limits')
    .select('requests_count')
    .eq('identifier', identifier)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart.toISOString());

  const totalRequests = existingRequests?.reduce((sum: number, record: any) => sum + record.requests_count, 0) || 0;
  
  if (totalRequests >= 5) { // Max 5 requests per minute
    return false;
  }

  // Log this request
  await supabase
    .from('rate_limits')
    .insert({
      identifier,
      endpoint,
      requests_count: 1,
      window_start: now.toISOString()
    });

  return true;
}

// Input validation helper
function validateWaitlistRequest(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (!data.email || typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!data.company || typeof data.company !== 'string' || data.company.trim().length < 2) {
    errors.push('Company name must be at least 2 characters long');
  }
  
  if (!data.role || typeof data.role !== 'string' || data.role.trim().length < 2) {
    errors.push('Role must be specified');
  }
  
  // Sanitize inputs
  if (data.name) data.name = data.name.trim().substring(0, 100);
  if (data.email) data.email = data.email.trim().toLowerCase().substring(0, 255);
  if (data.company) data.company = data.company.trim().substring(0, 100);
  if (data.role) data.role = data.role.trim().substring(0, 50);
  
  return { isValid: errors.length === 0, errors };
}

interface WaitlistRequest {
  name: string;
  email: string;
  company: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for') || 
                     'unknown';

    // Check rate limit
    const isAllowed = await checkRateLimit(supabase, clientIP, 'waitlist-signup');
    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const waitlistData: WaitlistRequest = await req.json();
    
    // Validate input
    const validation = validateWaitlistRequest(waitlistData);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { name, email, company, role } = waitlistData;

    console.log("Received waitlist request:", { name, email, company, role });

    // ✅ Save to Supabase table
    const { error: dbError } = await supabase
      .from("waitlist_signups")
      .insert([{ name, email, company, role }]);

    if (dbError) {
      console.error("DB insert error:", dbError);
      throw dbError;
    }

    console.log("Successfully inserted to database");

    // ✅ Send notification email to admin
    const adminEmail = await resend.emails.send({
      from: "ZenFlux Waitlist <onboarding@resend.dev>",
      to: ["info@zenchise.com"],
      subject: `New Waitlist Signup from ${company}`,
      html: `
        <h1>New Waitlist Signup</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Role:</strong> ${role}</p>
      `,
    });

    console.log("Admin email sent:", adminEmail);

    // ✅ Send confirmation email to prospect
    const confirmEmail = await resend.emails.send({
      from: "ZenFlux Team <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to the ZenFlux Waitlist!",
      html: `
        <h1>Welcome to ZenFlux!</h1>
        <p>Hi ${name}, thanks for joining the waitlist! 🎉</p>
        <p><strong>Company:</strong> ${company}<br/>
        <strong>Role:</strong> ${role}<br/>
        <strong>Email:</strong> ${email}</p>
        <p>We'll be in touch soon with early access details.</p>
        <p>Best regards,<br/>The ZenFlux Team</p>
      `,
    });

    console.log("Confirmation email sent:", confirmEmail);

    return new Response(
      JSON.stringify({ success: true, message: "Waitlist signup successful" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-waitlist-request function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check function logs for more information"
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
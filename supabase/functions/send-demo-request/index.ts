import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Import Supabase client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  
  if (totalRequests >= 3) { // Max 3 demo requests per minute
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
function validateDemoRequest(data: any): { isValid: boolean; errors: string[] } {
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
  
  if (data.phone && typeof data.phone === 'string' && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
    errors.push('Invalid phone number format');
  }
  
  // Sanitize inputs
  if (data.name) data.name = data.name.trim().substring(0, 100);
  if (data.email) data.email = data.email.trim().toLowerCase().substring(0, 255);
  if (data.company) data.company = data.company.trim().substring(0, 100);
  if (data.phone) data.phone = data.phone.trim().substring(0, 20);
  if (data.message) data.message = data.message.trim().substring(0, 1000);
  
  return { isValid: errors.length === 0, errors };
}

interface DemoRequest {
  name: string;
  email: string;
  company: string;
  phone?: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for') || 
                     'unknown';

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check rate limit
    const isAllowed = await checkRateLimit(supabase, clientIP, 'demo-request');
    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const demoData: DemoRequest = await req.json();
    
    // Validate input
    const validation = validateDemoRequest(demoData);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { name, email, company, phone, message } = demoData;

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "ZenFlux Demo Requests <onboarding@resend.dev>",
      to: ["info@zenchise.com"],
      subject: `New Demo Request from ${company}`,
      html: `
        <h1>New Demo Request</h1>
        <h2>Contact Information</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        
        ${message ? `
        <h2>Message</h2>
        <p>${message}</p>
        ` : ''}
        
        <hr>
        <p><em>Respond to this demo request within 24 hours to maintain our service commitment.</em></p>
      `,
    });

    // Send confirmation email to prospect
    const confirmationEmailResponse = await resend.emails.send({
      from: "ZenFlux Team <onboarding@resend.dev>",
      to: [email],
      subject: "Your ZenFlux Demo Request - We'll be in touch soon!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Thank you for your interest in ZenFlux!</h1>
          
          <p>Hi ${name},</p>
          
          <p>We've received your demo request for <strong>${company}</strong> and are excited to show you how ZenFlux can transform your cash flow forecasting.</p>
          
          <h2 style="color: #2563eb;">What happens next?</h2>
          <ul>
            <li>Our team will review your requirements</li>
            <li>We'll contact you within 24 hours to schedule your personalized demo</li>
            <li>During the demo, we'll show you how ZenFlux works with scenarios relevant to your business</li>
          </ul>
          
          <h2 style="color: #2563eb;">Your Request Details</h2>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Company:</strong> ${company}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${message ? `<p><strong>Requirements:</strong> ${message}</p>` : ''}
          </div>
          
          <p>If you have any questions in the meantime, feel free to reply to this email.</p>
          
          <p>Best regards,<br>
          The ZenFlux Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b;">
            ZenFlux - AI-Powered Cash Flow Forecasting<br>
            This email was sent because you requested a demo at zenflux.com
          </p>
        </div>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);
    console.log("Confirmation email sent:", confirmationEmailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Demo request sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-demo-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
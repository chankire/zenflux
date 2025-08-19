import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ Load secrets
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SB_URL")!;
const supabaseServiceKey = Deno.env.get("SB_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
    const { name, email, company, role }: WaitlistRequest = await req.json();

    // ✅ Save to Supabase table
    const { error: dbError } = await supabase
      .from("waitlist_signups")
      .insert([{ name, email, company, role }]);

    if (dbError) {
      console.error("DB insert error:", dbError);
      throw dbError;
    }

    // ✅ Send notification email to admin
    await resend.emails.send({
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

    // ✅ Send confirmation email to prospect
    await resend.emails.send({
      from: "ZenFlux Team <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to the ZenFlux Waitlist!",
      html: `
        <h1>Welcome to ZenFlux!</h1>
        <p>Hi ${name}, thanks for joining the waitlist! 🎉</p>
        <p>Company: ${company}<br/>Role: ${role}<br/>Email: ${email}</p>
        <p>We’ll be in touch soon with early access.</p>
      `,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Waitlist signup successful" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-waitlist-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

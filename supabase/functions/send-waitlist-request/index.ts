import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, company, role }: WaitlistRequest = await req.json();

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "ZenFlux Waitlist <onboarding@resend.dev>",
      to: ["info@zenchise.com"],
      subject: `New Waitlist Signup from ${company}`,
      html: `
        <h1>New Waitlist Signup</h1>
        <h2>Contact Information</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Role:</strong> ${role}</p>
        
        <hr>
        <p><em>Follow up with early access details and onboarding information.</em></p>
      `,
    });

    // Send confirmation email to prospect
    const confirmationEmailResponse = await resend.emails.send({
      from: "ZenFlux Team <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to the ZenFlux Waitlist!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to the ZenFlux Waitlist!</h1>
          
          <p>Hi ${name},</p>
          
          <p>Thank you for joining the ZenFlux waitlist! We're excited to have <strong>${company}</strong> as part of our early access community.</p>
          
          <h2 style="color: #2563eb;">What's Next?</h2>
          <ul>
            <li>You'll be among the first to get access to ZenFlux when we launch</li>
            <li>We'll send you updates on our progress and new features</li>
            <li>You'll receive exclusive early access invitations and beta testing opportunities</li>
            <li>Priority support and onboarding when you join</li>
          </ul>
          
          <h2 style="color: #2563eb;">Your Waitlist Details</h2>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Company:</strong> ${company}</p>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          
          <p>In the meantime, feel free to explore our blog for insights on cash flow forecasting and AI-powered finance.</p>
          
          <p>Best regards,<br>
          The ZenFlux Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b;">
            ZenFlux - AI-Powered Cash Flow Forecasting<br>
            This email was sent because you joined our waitlist at zenflux.com
          </p>
        </div>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);
    console.log("Confirmation email sent:", confirmationEmailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Waitlist signup successful"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-waitlist-request function:", error);
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
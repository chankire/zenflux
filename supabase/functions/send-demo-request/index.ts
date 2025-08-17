import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
    const { name, email, company, phone, message }: DemoRequest = await req.json();

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "ZenFlux Demo Requests <onboarding@resend.dev>",
      to: ["demo@zenflux.com"], // Replace with your actual email
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
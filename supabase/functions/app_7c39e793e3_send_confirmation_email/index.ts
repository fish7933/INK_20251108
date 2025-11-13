import { createClient } from 'npm:@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Request received:`, {
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error(`[${requestId}] Failed to parse request body:`, error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { applicationId } = body;
    console.log(`[${requestId}] Processing confirmation email for application:`, applicationId);

    if (!applicationId) {
      return new Response(
        JSON.stringify({ error: 'Application ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch application details
    console.log(`[${requestId}] Fetching application details`);
    const { data: application, error: appError } = await supabase
      .from('app_7c39e793e3_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      console.error(`[${requestId}] Application not found:`, appError);
      return new Response(
        JSON.stringify({ error: 'Application not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Application found:`, {
      name: application.full_name,
      email: application.email,
      jobTitle: application.job_title,
      selectedPosition: application.selected_position,
    });

    // Configure SMTP transporter
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const smtpSecure = Deno.env.get('SMTP_SECURE') !== 'false';
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');
    const smtpFrom = Deno.env.get('SMTP_FROM');

    if (!smtpHost || !smtpUser || !smtpPassword || !smtpFrom) {
      console.error(`[${requestId}] SMTP configuration missing`);
      return new Response(
        JSON.stringify({ error: 'SMTP configuration not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Prepare confirmation email content
    const emailSubject = `Application Received: ${application.job_title} - ${application.selected_position}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; margin: 0;">INK CO., LTD.</h1>
          <p style="color: #6b7280; margin-top: 10px;">Maritime Recruitment</p>
        </div>

        <div style="background-color: #f0f9ff; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #1e40af; margin-top: 0;">Application Received Successfully! ✓</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Dear <strong>${application.full_name}</strong>,
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Thank you for applying for the <strong>${application.selected_position}</strong> position on <strong>${application.job_title}</strong>.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            We have received your application and our recruitment team will review it carefully. 
            We will contact you via email or phone if your qualifications match our requirements.
          </p>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #374151; margin-top: 0;">Application Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Position:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 600;">${application.selected_position}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Vessel:</td>
              <td style="padding: 8px 0; color: #111827;">${application.job_title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Submitted:</td>
              <td style="padding: 8px 0; color: #111827;">${new Date(application.submitted_date).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Application ID:</td>
              <td style="padding: 8px 0; color: #111827; font-family: monospace;">${application.id.substring(0, 8)}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
          <h3 style="color: #92400e; margin-top: 0; font-size: 16px;">📌 What's Next?</h3>
          <ul style="color: #78350f; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li>Our recruitment team will review your application within 5-7 business days</li>
            <li>If selected, we will contact you for an interview</li>
            <li>Please keep your phone and email accessible</li>
            <li>You may be asked to provide additional documents</li>
          </ul>
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #374151; margin-top: 0; font-size: 16px;">💡 Tips for Success</h3>
          <ul style="color: #6b7280; margin: 10px 0; padding-left: 20px; line-height: 1.8;">
            <li>Ensure all your certificates are up to date</li>
            <li>Prepare for potential technical interviews</li>
            <li>Review the job requirements and responsibilities</li>
            <li>Be ready to discuss your previous vessel experience</li>
          </ul>
        </div>

        <div style="text-align: center; padding: 20px; border-top: 2px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 10px 0;">
            If you have any questions, please don't hesitate to contact us.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 10px 0;">
            <strong>INK CO., LTD.</strong><br>
            Maritime Recruitment Department
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
            This is an automated confirmation email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `;

    // Send confirmation email to applicant
    console.log(`[${requestId}] Sending confirmation email to:`, application.email);
    try {
      await transporter.sendMail({
        from: smtpFrom,
        to: application.email,
        subject: emailSubject,
        html: emailHtml,
      });
      console.log(`[${requestId}] Confirmation email sent successfully to:`, application.email);

      return new Response(
        JSON.stringify({
          message: 'Confirmation email sent successfully',
          recipient: application.email,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error(`[${requestId}] Failed to send confirmation email:`, error);
      return new Response(
        JSON.stringify({
          error: 'Failed to send confirmation email',
          details: error.message,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
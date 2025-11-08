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
    console.log(`[${requestId}] Processing application:`, applicationId);

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
      nationality: application.nationality,
      jobTitle: application.job_title,
      resumeUrl: application.resume_url,
    });

    // Fetch email recipients based on nationality
    console.log(`[${requestId}] Fetching email recipients for nationality:`, application.nationality);
    const { data: recipients, error: recipientsError } = await supabase
      .from('app_7c39e793e3_email_recipients')
      .select('*')
      .eq('is_active', true)
      .or(`nationality.is.null,nationality.eq.${application.nationality || ''}`);

    if (recipientsError) {
      console.error(`[${requestId}] Failed to fetch recipients:`, recipientsError);
      
      // Update application with failed status
      await supabase
        .from('app_7c39e793e3_applications')
        .update({
          email_sent: false,
          email_sent_at: new Date().toISOString(),
          email_recipients: [],
          resume_attached: false
        })
        .eq('id', applicationId);
      
      return new Response(
        JSON.stringify({ error: 'Failed to fetch email recipients' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!recipients || recipients.length === 0) {
      console.log(`[${requestId}] No active recipients found`);
      
      // Update application with no recipients status
      await supabase
        .from('app_7c39e793e3_applications')
        .update({
          email_sent: false,
          email_sent_at: new Date().toISOString(),
          email_recipients: [],
          resume_attached: false
        })
        .eq('id', applicationId);
      
      return new Response(
        JSON.stringify({ message: 'No active email recipients configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Found ${recipients.length} recipients`);

    // Configure SMTP transporter
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587');
    const smtpSecure = Deno.env.get('SMTP_SECURE') !== 'false';
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');
    const smtpFrom = Deno.env.get('SMTP_FROM');

    if (!smtpHost || !smtpUser || !smtpPassword || !smtpFrom) {
      console.error(`[${requestId}] SMTP configuration missing`);
      
      // Update application with failed status
      await supabase
        .from('app_7c39e793e3_applications')
        .update({
          email_sent: false,
          email_sent_at: new Date().toISOString(),
          email_recipients: [],
          resume_attached: false
        })
        .eq('id', applicationId);
      
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

    // Prepare email content
    const emailSubject = `New Job Application: ${application.job_title} - ${application.full_name}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Job Application Received</h2>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Applicant Information</h3>
          <p><strong>Name:</strong> ${application.full_name}</p>
          <p><strong>Email:</strong> <a href="mailto:${application.email}">${application.email}</a></p>
          <p><strong>Phone:</strong> ${application.phone}</p>
          <p><strong>Nationality:</strong> ${application.nationality || 'Not specified'}</p>
          <p><strong>Date of Birth:</strong> ${application.date_of_birth || 'Not specified'}</p>
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Position Details</h3>
          <p><strong>Job Title:</strong> ${application.job_title}</p>
          <p><strong>Experience Years:</strong> ${application.experience_years || 'Not specified'}</p>
          <p><strong>Expected Salary:</strong> ${application.expected_salary ? `$${application.expected_salary.toLocaleString()} ${application.salary_currency || 'USD'}` : 'Not specified'}</p>
          <p><strong>Certificates:</strong> ${application.certificates || 'Not specified'}</p>
          <p><strong>Previous Vessels:</strong> ${application.previous_vessels || 'Not specified'}</p>
        </div>

        ${application.cover_letter ? `
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Cover Letter</h3>
          <p style="white-space: pre-wrap;">${application.cover_letter}</p>
        </div>
        ` : ''}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            <strong>Submitted:</strong> ${new Date(application.submitted_date).toLocaleString()}
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Please log in to the admin dashboard to review and manage this application.
          </p>
          <p style="color: #059669; font-size: 14px; margin-top: 15px;">
            <strong>💡 Tip:</strong> Click "Reply" to respond directly to the applicant at ${application.email}
          </p>
        </div>
      </div>
    `;

    // Prepare attachments array
    const attachments = [];
    let resumeAttached = false;

    // Download and attach resume if available
    if (application.resume_url && application.resume_filename) {
      console.log(`[${requestId}] Downloading resume from:`, application.resume_url);
      try {
        // Get signed URL for the resume
        const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from('app_7c39e793e3_resumes')
          .createSignedUrl(application.resume_url.split('/').pop(), 60); // 60 seconds expiry

        if (signedUrlError) {
          console.error(`[${requestId}] Failed to get signed URL:`, signedUrlError);
        } else if (signedUrlData?.signedUrl) {
          // Download the file
          const response = await fetch(signedUrlData.signedUrl);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            
            attachments.push({
              filename: application.resume_filename,
              content: buffer,
            });
            resumeAttached = true;
            console.log(`[${requestId}] Resume attached successfully:`, application.resume_filename);
          } else {
            console.error(`[${requestId}] Failed to download resume: HTTP ${response.status}`);
          }
        }
      } catch (error) {
        console.error(`[${requestId}] Error attaching resume:`, error);
        // Continue without attachment rather than failing the entire email
      }
    }

    // Send emails to all recipients with Reply-To header set to applicant's email
    const emailPromises = recipients.map(async (recipient) => {
      console.log(`[${requestId}] Sending email to:`, recipient.email);
      try {
        await transporter.sendMail({
          from: smtpFrom,
          to: recipient.email,
          replyTo: application.email, // Set Reply-To to applicant's email
          subject: emailSubject,
          html: emailHtml,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
        console.log(`[${requestId}] Email sent successfully to:`, recipient.email, `with Reply-To: ${application.email}`, attachments.length > 0 ? `and ${attachments.length} attachment(s)` : '');
        return { email: recipient.email, success: true };
      } catch (error) {
        console.error(`[${requestId}] Failed to send email to ${recipient.email}:`, error);
        return { email: recipient.email, success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    const successfulEmails = results.filter(r => r.success).map(r => r.email);

    console.log(`[${requestId}] Email sending completed: ${successCount}/${results.length} successful`);

    // Update application with email status
    const { error: updateError } = await supabase
      .from('app_7c39e793e3_applications')
      .update({
        email_sent: successCount > 0,
        email_sent_at: new Date().toISOString(),
        email_recipients: successfulEmails,
        resume_attached: resumeAttached
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error(`[${requestId}] Failed to update application email status:`, updateError);
    } else {
      console.log(`[${requestId}] Application email status updated successfully`);
    }

    return new Response(
      JSON.stringify({
        message: `Emails sent to ${successCount} out of ${results.length} recipients`,
        results,
        attachments: attachments.length,
        resumeAttached,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
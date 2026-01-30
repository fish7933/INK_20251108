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

    // Fetch application details with vessel and position info
    console.log(`[${requestId}] Fetching application details`);
    const { data: application, error: appError } = await supabase
      .from('app_7c39e793e3_applications')
      .select('*, vessel:app_7c39e793e3_vessels(*), position:app_7c39e793e3_positions(*)')
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
      vessel: application.vessel?.vessel_name,
      position: application.position?.position_name,
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

    // Prepare admin email content
    const adminEmailSubject = `New Job Application: ${application.vessel?.vessel_name} - ${application.position?.position_name} - ${application.full_name}`;
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Job Application Received</h2>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Vessel & Position</h3>
          <p><strong>Vessel:</strong> ${application.vessel?.vessel_name} (${application.vessel?.vessel_type})</p>
          <p><strong>Position:</strong> ${application.position?.position_name} (${application.position?.rank})</p>
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Applicant Information</h3>
          <p><strong>Name:</strong> ${application.full_name}</p>
          <p><strong>Email:</strong> <a href="mailto:${application.email}">${application.email}</a></p>
          <p><strong>Phone:</strong> ${application.phone}</p>
          <p><strong>Nationality:</strong> ${application.nationality || 'Not specified'}</p>
          <p><strong>Date of Birth:</strong> ${application.date_of_birth || 'Not specified'}</p>
          <p><strong>Experience Years:</strong> ${application.experience_years || 'Not specified'}</p>
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Professional Details</h3>
          <p><strong>Expected Salary:</strong> ${application.expected_salary ? `$${application.expected_salary.toLocaleString()} ${application.salary_currency}` : 'Not specified'}</p>
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
        const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from('app_7c39e793e3_resumes')
          .createSignedUrl(application.resume_url.split('/').pop(), 60);

        if (signedUrlError) {
          console.error(`[${requestId}] Failed to get signed URL:`, signedUrlError);
        } else if (signedUrlData?.signedUrl) {
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
      }
    }

    // Send emails to admin recipients
    const adminEmailPromises = recipients.map(async (recipient) => {
      console.log(`[${requestId}] Sending admin email to:`, recipient.email);
      try {
        await transporter.sendMail({
          from: smtpFrom,
          to: recipient.email,
          replyTo: application.email,
          subject: adminEmailSubject,
          html: adminEmailHtml,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
        console.log(`[${requestId}] Admin email sent successfully to:`, recipient.email);
        return { email: recipient.email, success: true };
      } catch (error) {
        console.error(`[${requestId}] Failed to send admin email to ${recipient.email}:`, error);
        return { email: recipient.email, success: false, error: error.message };
      }
    });

    // Send confirmation email to applicant
    const applicantEmailSubject = `Application Received - ${application.position?.position_name} on ${application.vessel?.vessel_name}`;
    const applicantEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Thank You for Your Application!</h2>
        
        <p>Dear ${application.full_name},</p>
        
        <p>We have successfully received your application for the position of <strong>${application.position?.position_name}</strong> on board <strong>${application.vessel?.vessel_name}</strong>.</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #1e40af; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Application Summary</h3>
          <p><strong>Vessel:</strong> ${application.vessel?.vessel_name}</p>
          <p><strong>Vessel Type:</strong> ${application.vessel?.vessel_type}</p>
          <p><strong>Position:</strong> ${application.position?.position_name}</p>
          <p><strong>Rank:</strong> ${application.position?.rank}</p>
          <p><strong>Submitted:</strong> ${new Date(application.submitted_date).toLocaleString()}</p>
        </div>
        
        <h3 style="color: #374151;">What Happens Next?</h3>
        <ol style="color: #6b7280; line-height: 1.8;">
          <li>Our recruitment team will review your application within 5-7 business days</li>
          <li>If your qualifications match our requirements, we will contact you for an interview</li>
          <li>You will receive updates via email at <strong>${application.email}</strong></li>
        </ol>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            <strong>📧 Questions?</strong> Feel free to reply to this email if you have any questions about your application.
          </p>
        </div>
        
        <p style="color: #6b7280;">Best regards,<br><strong>Recruitment Team</strong></p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px;">
            This is an automated confirmation email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `;

    console.log(`[${requestId}] Sending confirmation email to applicant:`, application.email);
    let applicantEmailSent = false;
    try {
      await transporter.sendMail({
        from: smtpFrom,
        to: application.email,
        subject: applicantEmailSubject,
        html: applicantEmailHtml,
      });
      console.log(`[${requestId}] Confirmation email sent successfully to applicant:`, application.email);
      applicantEmailSent = true;
    } catch (error) {
      console.error(`[${requestId}] Failed to send confirmation email to applicant:`, error);
    }

    const adminResults = await Promise.all(adminEmailPromises);
    const successCount = adminResults.filter(r => r.success).length;
    const successfulEmails = adminResults.filter(r => r.success).map(r => r.email);

    console.log(`[${requestId}] Email sending completed: ${successCount}/${adminResults.length} admin emails successful, applicant email: ${applicantEmailSent ? 'sent' : 'failed'}`);

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
        message: `Admin emails sent to ${successCount} out of ${adminResults.length} recipients`,
        applicantEmailSent,
        results: adminResults,
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
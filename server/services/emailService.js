const nodemailer = require('nodemailer');
const User = require('../models/User');

let transporter = null;

/**
 * Initialize the Nodemailer transporter.
 * If SMTP_USER is set, uses those credentials.
 * Otherwise, creates an Ethereal test account for dev previews.
 */
async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('📧 SMTP configured with provided credentials');
  } else {
    // Create Ethereal test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 SMTP configured with Ethereal test account');
    console.log(`   Preview URL base: https://ethereal.email`);
  }

  return transporter;
}

/**
 * Build the HTML email template for a new item notification.
 */
function buildEmailTemplate(item) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const itemUrl = `${frontendUrl}/items/${item._id}`;
  const typeLabel = item.type === 'lost' ? 'Lost' : 'Found';
  const typeColor = item.type === 'lost' ? '#EF4444' : '#14B8A6';
  const typeBg = item.type === 'lost' ? '#FEF2F2' : '#F0FDFA';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F1F5F9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4338CA 0%,#6366F1 50%,#0D9488 100%);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
      <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:12px;padding:8px 16px;margin-bottom:16px;">
        <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:1px;">UF</span>
      </div>
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 4px 0;font-weight:700;">New Item Reported</h1>
      <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">UniFound Campus Lost & Found Portal</p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <!-- Type Badge -->
      <div style="margin-bottom:24px;text-align:center;">
        <span style="display:inline-block;background:${typeBg};color:${typeColor};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:6px 16px;border-radius:20px;border:1px solid ${typeColor}20;">
          ${typeLabel} Item
        </span>
      </div>

      <!-- Item Name -->
      <h2 style="color:#1E293B;font-size:22px;margin:0 0 20px 0;text-align:center;font-weight:700;">
        ${item.title}
      </h2>

      <!-- Details Grid -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:12px 16px;background:#F8FAFC;border-radius:8px 0 0 0;border-bottom:1px solid #E2E8F0;">
            <span style="color:#94A3B8;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Category</span><br>
            <span style="color:#334155;font-size:15px;font-weight:500;">${item.category}</span>
          </td>
          <td style="padding:12px 16px;background:#F8FAFC;border-radius:0 8px 0 0;border-bottom:1px solid #E2E8F0;">
            <span style="color:#94A3B8;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Location</span><br>
            <span style="color:#334155;font-size:15px;font-weight:500;">${item.location}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px;background:#F8FAFC;border-radius:0 0 0 8px;" colspan="2">
            <span style="color:#94A3B8;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Description</span><br>
            <span style="color:#334155;font-size:14px;line-height:1.5;">${item.description ? item.description.substring(0, 200) : 'No description provided.'}${item.description && item.description.length > 200 ? '...' : ''}</span>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <div style="text-align:center;margin-top:28px;">
        <a href="${itemUrl}" style="display:inline-block;background:linear-gradient(135deg,#4338CA,#6366F1);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:12px;box-shadow:0 4px 14px rgba(67,56,202,0.3);">
          View Details →
        </a>
      </div>

      <!-- Footer note -->
      <p style="color:#94A3B8;font-size:12px;text-align:center;margin-top:28px;line-height:1.5;">
        You received this email because you are registered on the UniFound portal.<br>
        This is an automated notification from the NIET campus lost and found system.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:20px;color:#94A3B8;font-size:11px;">
      © ${new Date().getFullYear()} UniFound — NIET University Portal
    </div>
  </div>
</body>
</html>`;
}

/**
 * Broadcast a new item notification to ALL registered users.
 * Runs asynchronously (fire-and-forget).
 */
async function broadcastNewItem(item) {
  try {
    const mailer = await getTransporter();
    const users = await User.find({}, 'email name');

    if (users.length === 0) {
      console.log('📧 No users to broadcast to');
      return;
    }

    const html = buildEmailTemplate(item);
    const subject = `[UniFound] New ${item.type === 'lost' ? 'Lost' : 'Found'} Item: ${item.title}`;
    const from = process.env.SMTP_FROM || 'UniFound Portal <noreply@niet.co.in>';

    // Send to all users (BCC for privacy)
    const allEmails = users.map((u) => u.email);

    const info = await mailer.sendMail({
      from,
      to: from, // Send to self
      bcc: allEmails.join(', '),
      subject,
      html,
    });

    console.log(`📧 Broadcast sent to ${allEmails.length} users — Message ID: ${info.messageId}`);

    // Show Ethereal preview URL in development
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 Preview URL: ${previewUrl}`);
    }
  } catch (err) {
    console.error('📧 Broadcast email error:', err.message);
  }
}

module.exports = { broadcastNewItem };

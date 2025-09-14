import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create the transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an invitation email to a new user.
 * @param {string} toEmail - The recipient's email address.
 * @param {string} groupName - The name of the group they are invited to.
 * @param {string} inviteLink - The unique link for them to register.
 */
export const sendInvitationEmail = async (toEmail, groupName, inviteLink) => {
  const mailOptions = {
    from: `"FairShare" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `You're invited to join the group "${groupName}" on FairShare!`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Hello!</h2>
        <p>You have been invited to join the expense-sharing group "<strong>${groupName}</strong>" on FairShare.</p>
        <p>Click the link below to sign up and join the group:</p>
        <p style="text-align: center;">
          <a 
            href="${inviteLink}" 
            style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;"
          >
            Join the Group
          </a>
        </p>
        <p>If you were not expecting this invitation, you can safely ignore this email.</p>
        <p>Thanks,<br/>The FairShare Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Invitation email sent to ${toEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${toEmail}:`, error);
    // Depending on requirements, you might want to throw the error
    // to let the calling function know that the email failed.
  }
};
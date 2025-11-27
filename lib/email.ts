import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  name: string
  originalMessage: string
  reply: string
}

export async function sendReplyEmail({ to, name, originalMessage, reply }: EmailOptions) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.PASS_USER,
    },
  })

  const websiteUrl = process.env.NEXTAUTH_URL || 'https://yourwebsite.com'

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reply to Your Message</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', 'Arial', sans-serif;
          line-height: 1.7;
          color: #4A5568;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #6B4423 0%, #D97706 50%, #F59E0B 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        
        .logo {
          max-width: 120px;
          height: auto;
          border-radius: 12px;
          display: block;
          margin: 0 auto;
        }
        
        .brand-name {
          font-size: 28px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.5px;
          margin-top: 15px;
        }
        
        .header h1 {
          color: white;
          font-size: 32px;
          font-weight: 700;
          margin: 15px 0 0 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .header p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          margin-top: 8px;
          font-weight: 400;
        }
        
        .content {
          padding: 40px 30px;
          background: #FFFFFF;
        }
        
        .greeting {
          font-size: 18px;
          color: #4A5568;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section-title {
          color: #6B4423;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .section-title::before {
          content: '';
          width: 4px;
          height: 20px;
          background: linear-gradient(135deg, #6B4423, #D97706);
          border-radius: 2px;
        }
        
        .reply-box {
          background: linear-gradient(135deg, #FEF7ED 0%, #FEF3C7 100%);
          padding: 25px;
          border-radius: 12px;
          border-left: 4px solid #D97706;
          box-shadow: 0 4px 12px rgba(107, 68, 35, 0.08);
        }
        
        .original-message {
          background: #F7FAFC;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          font-style: italic;
          color: #4A5568;
        }
        
        .message-text {
          white-space: pre-wrap;
          line-height: 1.8;
          color: #2D3748;
        }
        
        .signature {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 2px solid #E2E8F0;
          text-align: center;
        }
        
        .signature-main {
          font-size: 20px;
          font-weight: 700;
          color: #6B4423;
          margin-bottom: 8px;
        }
        
        .signature-title {
          color: #D97706;
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .signature-tagline {
          color: #718096;
          font-size: 14px;
          margin-top: 10px;
        }
        
        .footer {
          background: #1A202C;
          color: white;
          padding: 30px;
          text-align: center;
        }
        
        .footer-content {
          max-width: 400px;
          margin: 0 auto;
        }
        
        .footer-logo {
          font-size: 24px;
          font-weight: 700;
          color: #D97706;
          margin-bottom: 15px;
        }
        
        .footer-text {
          color: #A0AEC0;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        
        .social-links {
          text-align: center;
          margin: 20px 0;
        }
        
        .social-link {
          width: 44px;
          height: 44px;
          background: #2D3748;
          border-radius: 12px;
          display: inline-block;
          text-align: center;
          line-height: 44px;
          color: white;
          text-decoration: none;
          font-size: 24px;
          margin: 0 7px;
          vertical-align: middle;
        }
        
        .social-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
        
        .instagram:hover {
          background: #E1306C;
        }
        
        .linkedin:hover {
          background: #0077B5;
        }
        
        .youtube:hover {
          background: #FF0000;
        }
        
        .website:hover {
          background: #D97706;
        }
        
        .contact-info {
          color: #A0AEC0;
          font-size: 12px;
          margin-top: 20px;
        }
        
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #E2E8F0, transparent);
          margin: 30px 0;
        }
        
        .website-link {
          display: inline-block;
          margin-top: 15px;
          padding: 10px 20px;
          background: #D97706;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .website-link:hover {
          background: #B45309;
          transform: translateY(-2px);
        }
        
        @media (max-width: 600px) {
          body {
            padding: 10px;
          }
          
          .header {
            padding: 30px 20px;
          }
          
          .header h1 {
            font-size: 24px;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          .brand-name {
            font-size: 22px;
          }
          
          .logo {
            max-width: 100px;
          }
          
          .social-links {
            margin: 15px 0;
          }
          
          .social-link {
            width: 40px;
            height: 40px;
            font-size: 22px;
            line-height: 40px;
            margin: 0 6px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header Section -->
        <div class="header">
          <div class="logo-container">
            <img src="https://image2url.com/images/1764283142040-b4e424ed-3c8f-4dcc-affe-a606e90c1c51.png" alt="Khaled Sameh Logo" class="logo">
          </div>
          <div class="brand-name">Khaled Sameh</div>
          <h1>Reply to Your Message</h1>
          <p>Thank you for getting in touch!</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
          <div class="greeting">
            Hi <strong>${name}</strong>,<br>
            Thank you for reaching out through my portfolio. I appreciate you taking the time to write to me. Here's my response to your message:
          </div>
          
          <div class="divider"></div>
          
          <!-- Reply Section -->
          <div class="section">
            <div class="section-title">My Response</div>
            <div class="reply-box">
              <div class="message-text">${reply.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          
          <!-- Original Message -->
          <div class="section">
            <div class="section-title">Your Original Message</div>
            <div class="original-message">
              <div class="message-text">${originalMessage.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          
          <!-- Signature -->
          <div class="signature">
            <div class="signature-main">Warm regards,</div>
            <div class="signature-title">Khaled Sameh</div>
            <div>Professional Barista & Coffee Consultant</div>
            <div class="signature-tagline">☕ Creating exceptional coffee experiences</div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-content">
            <div class="footer-logo">Khaled Sameh</div>
            <div class="footer-text">
              Dedicated to the art and science of exceptional coffee brewing and education.
            </div>
            
            <a href="${websiteUrl}" class="website-link">🌐 Visit My Website</a>
            
            <div class="social-links">
              <a href="https://www.instagram.com/khaledsameh37" class="social-link instagram" style="text-decoration: none;">
                📷
              </a>
              <a href="https://www.linkedin.com/in/khaled-sameh-16a3bb257" class="social-link linkedin" style="text-decoration: none;">
                💼
              </a>
              <a href="https://www.youtube.com/@khaledsameh1939" class="social-link youtube" style="text-decoration: none;">
                ▶️
              </a>
              <a href="${websiteUrl}" class="social-link website" style="text-decoration: none;">
                🌐
              </a>
            </div>
            
            <div class="contact-info">
              <p>This email was sent in response to your contact form submission.</p>
              <p>If you have any further questions, please reply directly to this email.</p>
              <p style="margin-top: 15px; color: #718096;">
                © 2025 Khaled Sameh. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
REPLY TO YOUR MESSAGE - KHALED SAMEH
=====================================

Hi ${name},

Thank you for reaching out through my portfolio. I appreciate you taking the time to write to me. Here's my response to your message:

MY RESPONSE:
${reply}

YOUR ORIGINAL MESSAGE:
${originalMessage}

Warm regards,
Khaled Sameh
Professional Barista & Coffee Consultant
☕ Creating exceptional coffee experiences

---
Visit my website: ${websiteUrl}

Connect with me:
Instagram: https://www.instagram.com/khaledsameh37
LinkedIn: https://www.linkedin.com/in/khaled-sameh-16a3bb257
YouTube: https://www.youtube.com/@khaledsameh1939

Dedicated to the art and science of exceptional coffee brewing and education.

This email was sent in response to your contact form submission.
If you have any further questions, please reply directly to this email.

© 2025 Khaled Sameh. All rights reserved.
  `

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Khaled Sameh'}" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Re: Your Message - Khaled Sameh Portfolio',
    text: textContent,
    html: htmlContent,
  }

  const info = await transporter.sendMail(mailOptions)

  console.log('Email sent: %s', info.messageId)
  return info
}
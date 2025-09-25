import nodemailer from "nodemailer";
import { Supporter } from "../modules/supporter/models/Supporter"; // Adjust path as needed
import whatsappHelper from "./whatsapp-simple-helper";

interface MailOptions {
  supporterId: string; // We'll fetch details from DB
}
interface EmailOptions {
  to: string;
  name: string;
  amount: string; // e.g. "120 AUD"
  bedNo: string;
  supportLink: string;
  vcLink: string;
}

class SupporterMailer {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  public async sendWelcomeEmail(options: MailOptions) {
    try {
      // 1. First find the supporter and populate bed and organization
      const supporter: any = await Supporter.findById(
        options.supporterId
      ).populate(["user", { path: "bed", populate: { path: "organization" } }]);
      console.log(supporter);

      if (!supporter) {
        throw new Error("Supporter not found");
      }

      // 2. Use the vcLink from supporter's organization
      const baseUrl = supporter.bed?.organization?.vcLink;
      if (!baseUrl) {
        throw new Error("Organization VC link not found");
      }

      const supportLink = `${baseUrl}supporter?supporter=${supporter._id.toString()}`;

      // 3. Send email
      const mailOptions = {
        from: `"Shanthibhavan Bed Donation" <${process.env.EMAIL_FROM}>`,
        to: supporter.user.email,
        subject: "Welcome to Shanthibhavan Bed Donation Program",
        html: this.generateWelcomeTemplate(supporter.name, supportLink),
      };
      console.log(mailOptions);
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${supporter.email}`);
      whatsappHelper.sendSupporterWelcomeMessage(
        supporter.user.mobileNo,
        supportLink
      );
    } catch (error) {
      console.error("Error in sendWelcomeEmail:", error);
      throw error;
    }
  }

  private generateWelcomeTemplate(name: string, supportLink: string): string {
    return `
      <!DOCTYPE html>
<html>
<head>
    <style>
        /* Email styles with better button presentation */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .button-container {
            margin: 25px 0;
        }
        .button {
            background-color: #04aa6d;
            color: white;
            padding: 12px 0;
            text-decoration: none;
            border-radius: 4px;
            display: block;
            width: 100%;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .button:link, , button:visited{
            background-color: #04aa6d;
            color: white;
            text-decoration: none;
        }
        
        p {
            margin-bottom: 15px;
        }
        .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #666666;
        }
    </style>
</head>
<body>
    <p>Dear ${name},</p>
    
    <p>Thank you for registering as a supporter with Shanthibhavan!</p>
    
    <p>You can now access your supporter portal using the button below to make and manage your monthly contributions:</p>
    
    <div class="button-container">
        <a href="${supportLink}" class="button">Access Your Supporter Portal</a>
    </div>
    
    <p>If the button above doesn't work, copy and paste this link into your browser:<br>
    <small>${supportLink}</small></p>
    
    <div class="footer">
        <p>Best regards,<br>
        <strong>Shanthibhavan Team</strong></p>
    </div>
</body>
</html>
    `;
  }

  public async sendPaymentReminderEmail(options: EmailOptions) {
    const mailOptions = {
      from: `"Shanthibhavan Palliative International" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: `Thanks for supporting Shanthibhavan's Hands of Grace Programme   Shanthibhavan`,
      html: this.generateTemplate(options),
    };

    const result = await this.transporter.sendMail(mailOptions);
    return result.messageId;
  }

private generateTemplate({
  name,
  amount,
  bedNo,
  supportLink,
  vcLink,
}: EmailOptions): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
          
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.7;
              color: #2c3e50;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              padding: 20px;
          }
          
          .email-container {
              max-width: 650px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              overflow: hidden;
          }
          
          .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              position: relative;
          }
          
          .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50%" cy="0%" r="100%"><stop offset="0%" stop-color="white" stop-opacity=".1"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient></defs><rect width="100" height="20" fill="url(%23a)"/></svg>');
              opacity: 0.3;
          }
          
          .header h1 {
              font-size: 28px;
              font-weight: 600;
              margin-bottom: 10px;
              position: relative;
              z-index: 1;
          }
          
          .header p {
              font-size: 16px;
              opacity: 0.9;
              position: relative;
              z-index: 1;
          }
          
          .content {
              padding: 40px 30px;
          }
          
          .greeting {
              font-size: 18px;
              color: #667eea;
              font-weight: 600;
              margin-bottom: 25px;
          }
          
          .main-text {
              font-size: 16px;
              margin-bottom: 20px;
              text-align: justify;
          }
          
          .highlight-box {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              padding: 25px;
              border-radius: 12px;
              margin: 25px 0;
              text-align: center;
              box-shadow: 0 8px 25px rgba(240, 147, 251, 0.3);
          }
          
          .highlight-box h3 {
              font-size: 20px;
              margin-bottom: 10px;
              font-weight: 600;
          }
          
          .bed-number {
              font-size: 32px;
              font-weight: bold;
              margin: 10px 0;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .button {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 50px;
              display: inline-block;
              margin: 20px 0;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              transition: all 0.3s ease;
              box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
              text-transform: uppercase;
              letter-spacing: 1px;
          }
          
          .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 35px rgba(79, 172, 254, 0.6);
          }
          
          .qr-section {
              background: #f8f9ff;
              margin: 30px 0;
              padding: 30px;
              border-radius: 12px;
              text-align: center;
              border: 2px dashed #e0e6ff;
          }
          
          .qr-section h3 {
              color: #667eea;
              margin-bottom: 20px;
              font-size: 18px;
              font-weight: 600;
          }
          
          .qr-section img {
              width: 200px;
              height: 200px;
              border: 3px solid #667eea;
              padding: 10px;
              border-radius: 16px;
              background: white;
              box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
          }
          
          .app-buttons {
              margin: 30px 0;
              text-align: center;
              display: flex;
              gap: 15px;
              justify-content: center;
              flex-wrap: wrap;
          }
          
          .app-button {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 25px;
              font-weight: 600;
              font-size: 14px;
              transition: all 0.3s ease;
              box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
              display: inline-flex;
              align-items: center;
              gap: 8px;
          }
          
          .app-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
          }
          
          .divider {
              height: 2px;
              background: linear-gradient(90deg, transparent, #e0e6ff, transparent);
              margin: 30px 0;
          }
          
          .footer {
              background: #f8f9ff;
              padding: 30px;
              text-align: center;
              margin-top: 30px;
              border-radius: 12px;
          }
          
          .footer p {
              font-size: 16px;
              color: #667eea;
              font-weight: 500;
              line-height: 1.8;
          }
          
          .signature {
              margin-top: 20px;
              padding: 20px;
              background: white;
              border-radius: 8px;
              border-left: 4px solid #667eea;
          }
          
          .url-fallback {
              background: #f1f3f4;
              padding: 15px;
              border-radius: 8px;
              margin-top: 15px;
              font-size: 12px;
              color: #666;
              word-break: break-all;
          }
          
          .blessing-info {
              background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
              padding: 20px;
              border-radius: 12px;
              margin: 20px 0;
              border-left: 4px solid #ff9a56;
          }
          
          .blessing-info strong {
              color: #d63384;
          }
          
          @media (max-width: 600px) {
              .email-container {
                  margin: 10px;
                  border-radius: 12px;
              }
              
              .header, .content, .footer {
                  padding: 25px 20px;
              }
              
              .app-buttons {
                  flex-direction: column;
                  align-items: center;
              }
              
              .app-button {
                  width: 200px;
                  justify-content: center;
              }
          }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="header">
              <h1>Hands of Grace</h1>
              <p>Shanthibhavan Palliative Hospital</p>
          </div>
          
          <div class="content">
              <div class="greeting">Dear ${name},</div>
              
              <p class="main-text">
                  On behalf of <strong>Shanthibhavan Palliative Hospital</strong>, we extend our heartfelt gratitude for supporting our sacred mission. Your generous monthly donation of <strong>${amount} AUD</strong> to the <strong>Hands of Grace</strong> program enables us to provide free palliative hospital care to those who need it most.
              </p>
              
              <div class="blessing-info">
                  <p>
                      🏥 We have built a new ICU-standard medical ward, which will be blessed by <strong>His Grace Mar Andrews Thazhath on 24-08-2025</strong>. Your sponsorship enables a needy patient to access this ward free of cost, with full medical and bystander care.
                  </p>
              </div>
              
              <div class="highlight-box">
                  <h3>Your Sponsored Bed</h3>
                  <div class="bed-number">BED #${bedNo}</div>
                  <p>Thank you for making healing possible</p>
              </div>
              
              <p class="main-text">
                  To help us prepare the ward for our patients, we kindly invite you to make your first monthly contribution at your earliest convenience.
              </p>
              
              <p class="main-text">
                  If you know someone in need of the bed you are sponsoring, please feel free to connect them with us — we are here to help with open hearts and caring hands.
              </p>
              
              <div style="text-align: center;">
                  <p style="margin-bottom: 10px; font-weight: 600;">Kindly click the button below to access your dashboard and proceed with your contribution</p>
                  <a href="${supportLink}" class="button">Go to Your Dashboard and Make Your First Contribution</a>
                  
                  <div class="url-fallback">
                      <p><strong>Alternative link to access your dashboard and proceed with your contribution:</strong> If the button doesn't work, copy and paste this URL into your browser:</p>
                      <p>${supportLink}</p>
                  </div>
              </div>
              
              <div class="divider"></div>
              
              <!-- QR Code Section -->
              <div class="qr-section">
                  <h3>📱 Live view of your sponsored bed </h3>
                  <p style="margin-bottom: 20px; color: #666;">First download the "UNV-Link User" app, then scan the QR code below:</p>
                  <img src="${vcLink}" alt="QR code to view sponsored bed – if this image is hidden, please click 'Show image' in your email to view it" crossOrigin="anonymous">
              </div>
              
              <!-- App Store and Play Store Links -->
              <div class="app-buttons">
                  <a href="https://apps.apple.com/us/app/unv-link-user/id1353278463" target="_blank" class="app-button">
                      🍎 Download on App Store
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=com.soft.user.link&pcampaignid=web_share" target="_blank" class="app-button">
                      📱 Get it on Google Play
                  </a>
              </div>
              
          </div>
          
          <div class="footer">
              <p>Your compassion transforms lives and brings dignity to those in their most vulnerable moments.</p>
              
              <div class="signature">
                  <p><strong>Gratefully,</strong></p>
                  <p><strong>Fr. Joy Koothur</strong><br>
                  Co-Founder<br>
                  Shanthibhavan Palliative Hospital</p>
              </div>
          </div>
      </div>
  </body>
  </html>
  `;
}
}

export default new SupporterMailer();

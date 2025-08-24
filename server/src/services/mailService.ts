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
      subject: `Your Contribution to Hands of Grace`,
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
  }: EmailOptions): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
              }
              .button {
                  background-color: #04aa6d;
                  color: white;
                  padding: 12px;
                  text-decoration: none;
                  border-radius: 4px;
                  display: inline-block;
                  margin-top: 20px;
                  font-weight: bold;
              }
              .footer {
                  margin-top: 30px;
                  font-size: 14px;
                  color: #666;
              }
          </style>
      </head>
      <body>
          <p>Dear ${name},</p>
          <p>
            On behalf of <strong>Shanthibhavan Palliative Hospital</strong>, heartfelt thanks for your support to our mission. 
            Your monthly donation of <strong>${amount}</strong> to the <strong>Hands of Grace</strong> program helps us provide free palliative hospital care.
          </p>
          <p>
            We’ve built a new ICU-standard medical ward, to be inaugurated on the 26th by His Grace Mar Andrews Thazhath.Your sponsorship enables a needy patient to access this ward free of cost, along with full medical and bystander care.
          </p>
          <p>Your sponsored bed number is <strong>${bedNo}</strong></p>
          <p>
            To help us prepare the ward for its inauguration, we kindly invite you to make your first monthly contribution at your convenience.
          </p>
          <p>
            If you know someone in need of your supporting bed, please feel free to connect them with us — we are here to help.
          </p>
          <p>
            Kindly click the link below to access your dashboard and proceed with your contribution:
          </p>
          <a href="${supportLink}" class="button">Go to Your Dashboard</a>
          <p>If the button above doesn't work, you can also copy and paste this link into your browser:<br>
          <small>${supportLink}</small></p>
          <div class="footer">
              <p>Gratefully,<br>
              Fr. Joy Koothur<br>
              Co-Founder<br>
              Shanthibhavan Palliative Hospital</p>
          </div>
      </body>
      </html>
    `;
  }
}

export default new SupporterMailer();

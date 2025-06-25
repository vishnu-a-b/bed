import nodemailer from "nodemailer";
import { Supporter } from "../modules/supporter/models/Supporter"; // Adjust path as needed

interface MailOptions {
  supporterId: string; // We'll fetch details from DB
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
              /* Your email styles here */
              .button {
                  background-color: #15c;
                  color: white;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
                  display: inline-block;
              }
          </style>
      </head>
      <body>
          <p>Dear ${name},</p>
          <p>Thank you for registering as a supporter!</p>
          <p>Your supporter link: <a href="${supportLink}" class="button">Access Portal</a></p>
          <p>Best regards,<br/>Shanthibhavan Team</p>
      </body>
      </html>
    `;
  }
}

export default new SupporterMailer();

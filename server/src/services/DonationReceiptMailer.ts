// server/src/services/DonationReceiptMailer.ts
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import { toWords } from "number-to-words";

interface DonationMailOptions {
  email: string;
  name: string;
  amount: number;
  transactionNumber: string;
  receiptNumber: string;
  date: string;
  programName?: string;
}

class DonationReceiptMailer {
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

  private async generateReceiptPDF(receiptData: {
    name: string;
    amount: number;
    date: string;
    transactionNumber: string;
    receiptNumber: string;
    programName: string;
  }): Promise<Buffer> {
    const htmlTemplatePath = path.join(__dirname, "./receipt-template.ejs");

    const html = await ejs.renderFile(htmlTemplatePath, {
      name: receiptData.name,
      amount: receiptData.amount,
      date: receiptData.date,
      transactionNumber: receiptData.transactionNumber,
      receiptNumber: receiptData.receiptNumber,
      programName: receiptData.programName,
      amountWords: toWords(receiptData.amount).replace(/\b\w/g, (c) => c.toUpperCase()) + " Only",
    });

    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // For server deployment
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");

    const pdfBuffer:any = await page.pdf({ 
      format: "A4", 
      printBackground: true 
    });

    await browser.close();
    return pdfBuffer;
  }

  public async sendDonationReceiptEmail(options: DonationMailOptions): Promise<void> {
    try {
      // Generate PDF receipt
      const pdfBuffer = await this.generateReceiptPDF({
        name: options.name,
        amount: options.amount,
        date: options.date,
        transactionNumber: options.transactionNumber,
        receiptNumber: options.receiptNumber,
        programName: options.programName || "Generous Contribution Program"
      });

      // Prepare email
      const mailOptions = {
        from: `"Shanthibhavan Donations" <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: `Donation Receipt - ${options.receiptNumber}`,
        html: this.generateEmailTemplate(options),
        attachments: [
          {
            filename: `${options.receiptNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Donation receipt email sent to ${options.email}`);
    } catch (error) {
      console.error("Error in sendDonationReceiptEmail:", error);
      throw error;
    }
  }

  private generateEmailTemplate(options: DonationMailOptions): string {
    const formattedAmount = new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(options.amount);

    return `
      <!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #1565c0;
        }
        .header h1 {
            color: #1565c0;
            margin: 0;
            font-size: 24px;
        }
        .receipt-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }
        .detail-label {
            font-weight: bold;
            color: #555;
        }
        .detail-value {
            color: #333;
        }
        .amount-highlight {
            font-size: 18px;
            font-weight: bold;
            color: #1565c0;
        }
        .thank-you {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background-color: #e8f5e8;
            border-radius: 6px;
            border-left: 4px solid #4caf50;
        }
        .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #666666;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        .attachment-note {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You for Your Donation!</h1>
        </div>
        
        <p>Dear ${options.name},</p>
        
        <p>We are deeply grateful for your generous contribution to Shanthibhavan. Your support makes a meaningful difference in the lives of those we serve.</p>
        
        <div class="receipt-details">
            <h3 style="margin-top: 0; color: #1565c0;">Donation Details</h3>
            <div class="detail-row">
                <span class="detail-label">Receipt Number:</span>
                <span class="detail-value">${options.receiptNumber}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Transaction Number:</span>
                <span class="detail-value">${options.transactionNumber}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${options.date}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Program:</span>
                <span class="detail-value">${options.programName || "Generous Contribution Program"}</span>
            </div>
            <div class="detail-row" style="border-top: 2px solid #1565c0; margin-top: 15px; padding-top: 15px;">
                <span class="detail-label">Donation Amount:</span>
                <span class="detail-value amount-highlight">${formattedAmount}</span>
            </div>
        </div>
        
        <div class="attachment-note">
            <strong>📎 Receipt Attached:</strong> Please find your official donation receipt attached as a PDF file for your tax records.
        </div>
        
        <div class="thank-you">
            <h3 style="margin: 0 0 10px 0; color: #4caf50;">🙏 Your Impact Matters</h3>
            <p style="margin: 0;">Your generous donation helps us continue our mission of providing care, support, and hope to those in need. Thank you for being part of our community.</p>
        </div>
        
        <p>If you have any questions about your donation or need additional documentation, please don't hesitate to contact us.</p>
        
        <div class="footer">
            <p><strong>The Shanthibhavan Team</strong></p>
            <p>This is an automated email. Please keep this receipt for your tax records.</p>
        </div>
    </div>
</body>
</html>
    `;
  }
}

export default new DonationReceiptMailer();
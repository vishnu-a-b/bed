// server/src/services/DonationReceiptMailer.ts
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { toWords } from "number-to-words";
import whatsappHelper from "./whatsapp-simple-helper";

interface DonationMailOptions {
  email: string;
  name: string;
  address: string;
  phoneNo: string;
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

  private async generateReceiptPDF(user: {
    name: string;
    address: string;
    phoneNo: string;
    amount: number;
    date: string;
    transactionNumber: string;
    receiptNumber: string;
    programName: string;
  }): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    // Create a buffer to store the PDF
    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));

    // Promise to handle PDF generation completion
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
    });

    // Helper function to add a horizontal line
    const addHorizontalLine = (y: number, margin = 40) => {
      doc
        .moveTo(margin, y)
        .lineTo(doc.page.width - margin, y)
        .stroke("#ddd");
    };

    // Helper function to wrap text and return height
    const getTextHeight = (text: string, width: number, options: any = {}) => {
      const lines = doc.heightOfString(text, { width, ...options });
      return lines;
    };

    let yPosition = 40;

    // Header section
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("Shanthibhavan Palliative International Ltd", 40, yPosition);
    yPosition += 15;
    doc.text("ABN: 52 686 682 851", 40, yPosition);
    yPosition += 15;
    doc.text("Public Benevolent Institution - DGR Endorsed", 40, yPosition);

    // Logo (if you have a logo file)
    try {
      const logoPath = path.join(
        __dirname,
        "https://api.donatebed.shanthibhavan.in/logo/logo.png"
      );
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.width - 140, 20, {
          width: 75,
          height: 75,
        });
      }
    } catch (error) {
      console.log("Logo not found, skipping...");
    }

    yPosition += 30;
    addHorizontalLine(yPosition);
    yPosition += 20;

    // Address section
    doc.fontSize(10).font("Helvetica");
    doc.text("To", 40, yPosition);
    yPosition += 15;
    doc.fontSize(12).font("Helvetica");
    doc.text(user.name, 40, yPosition);
    yPosition += 15;
    doc.fontSize(10).font("Helvetica");

    // Handle multi-line address
    const addressHeight = getTextHeight(user.address, 250);
    doc.text(user.address, 40, yPosition, { width: 250 });
    yPosition += addressHeight + 5;
    doc.text(user.phoneNo, 40, yPosition);
    yPosition += 25;

    // Greeting
    doc.fontSize(11).font("Helvetica");
    doc.text(`Dear `, 40, yPosition, { continued: true });
    doc.font("Helvetica-Bold").text(user.name, { continued: true });
    doc.font("Helvetica").text(",");
    yPosition += 20;

    // Thank you message
    doc.text(
      `Thank you for your donation of AUD ${user.amount}. Below are the details of your contribution.`,
      40,
      yPosition,
      { width: 500 }
    );
    yPosition += 30;

    // Receipt header
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("Receipt", 40, yPosition);
    yPosition += 20;

    // Receipt description
    doc.fontSize(11).font("Helvetica");
    doc.text(
      `We confirm the receipt of payment from Mr/Ms/Mrs ${user.name} as per details below:-`,
      40,
      yPosition,
      { width: 500 }
    );
    yPosition += 30;

    // Table data
    const tableData = [
      ["Receipt No", user.receiptNumber],
      ["Payment Date", user.date],
      ["Transaction Number", user.transactionNumber],
      [
        "Amount Received",
        `AUD ${user.amount} (${toWords(user.amount).replace(/\b\w/g, (c) =>
          c.toUpperCase()
        )} Only)`,
      ],
      ["Towards", "Shanthibhavan palliative international LTD"],
    ];

    // Draw table
    const tableStartY = yPosition;
    const rowHeight = 25;
    const col1Width = 150;
    const col2Width = 350;
    const tableWidth = col1Width + col2Width;

    // Table borders and content
    tableData.forEach((row, index) => {
      const currentY = tableStartY + index * rowHeight;

      // Draw row borders
      doc.rect(40, currentY, col1Width, rowHeight).stroke("#ddd");
      doc.rect(40 + col1Width, currentY, col2Width, rowHeight).stroke("#ddd");

      // Add content
      doc.fontSize(10).font("Helvetica-Bold");
      doc.text(row[0], 50, currentY + 8, { width: col1Width - 20 });

      doc.font("Helvetica");
      doc.text(row[1], 50 + col1Width, currentY + 8, { width: col2Width - 20 });
    });

    yPosition = tableStartY + tableData.length * rowHeight + 20;

    // Description
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("Description", 40, yPosition, { continued: true });
    doc
      .font("Helvetica")
      .text(
        " : This is a gift received to support the free treatment of bedridden patients."
      );
    yPosition += 30;

    addHorizontalLine(yPosition);
    yPosition += 15;

    // Declaration
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("Declaration", 40, yPosition, { continued: true });
    doc
      .font("Helvetica")
      .text(
        " : This receipt acknowledges that the above amount was donated to Shanthibhavan Palliative International Ltd. No goods or services were received in return for this donation. This donation is tax-deductible under Australian law.",
        { width: 500 }
      );
    yPosition += 50;

    addHorizontalLine(yPosition);
    yPosition += 15;

    // Registered office
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("Registered office address", 40, yPosition, { continued: true });
    doc
      .font("Helvetica")
      .text(
        " : Shanthibhavan palliative international LTD, Office 3261, Ground Floor, 470 St Kilda Rd, MELBOURNE VIC 3004, Australia",
        { width: 500 }
      );
    yPosition += 40;

    addHorizontalLine(yPosition);
    yPosition += 15;

    // Contact information
    doc.fontSize(10).font("Helvetica");
    doc.text(
      "This receipt can be used for claiming a tax deduction under Australian tax law.",
      40,
      yPosition,
      { width: 500 }
    );
    yPosition += 15;
    doc.text("For any enquiries, please contact us at:", 40, yPosition);
    yPosition += 12;
    doc.text(
      "Email: operationssbau@palliativeinternational.com",
      40,
      yPosition
    );
    yPosition += 12;
    doc.text("Phone: +61 3 9111 2473", 40, yPosition);
    yPosition += 12;
    doc.text("Website: www.palliativeinternational.com", 40, yPosition);
    yPosition += 20;

    addHorizontalLine(yPosition);
    yPosition += 15;

    // Tax deduction notice
    doc.fontSize(10).font("Helvetica");
    doc.text(
      "Shanthibhavan Palliative International Ltd is endorsed as a Deductible Gift Recipient (DGR) under Subdivision 30-BA of the Income Tax Assessment Act 1997. Donations of $2 or more are tax deductible.",
      40,
      yPosition,
      { width: 500 }
    );
    yPosition += 40;

    // Footer
    doc.fontSize(9).font("Helvetica");
    const footerText =
      "This is an electronically generated receipt and does not require a signature.";
    const footerWidth = doc.widthOfString(footerText);
    const centerX = (doc.page.width - footerWidth) / 2;
    doc.fillColor("#666").text(footerText, centerX, yPosition);

    // Finalize the PDF
    doc.end();

    // Wait for PDF generation to complete
    const pdfBuffer = await pdfPromise;

    try {
      // Send PDF via WhatsApp
      const response = await whatsappHelper.sendDonationReceipt(
        user.phoneNo,
        pdfBuffer,
        `${user.receiptNumber}.pdf`
      );
      console.log(response);
    } catch (whatsappError) {
      console.error("Failed to send WhatsApp message:", whatsappError);
      // Continue with PDF download even if WhatsApp fails
    }

    return pdfBuffer;
  }

  public async sendDonationReceiptEmail(
    options: DonationMailOptions
  ): Promise<void> {
    try {
      // Generate PDF receipt
      console.warn(options);
      console.log();
      const pdfBuffer = await this.generateReceiptPDF({
        name: options.name,
        amount: options.amount,
        address: options.address,
        phoneNo: options.phoneNo,
        date: options.date,
        transactionNumber: options.transactionNumber,
        receiptNumber: options.receiptNumber,
        programName: options.programName || "Generous Contribution Program",
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
            contentType: "application/pdf",
          },
        ],
      };
      try {
        // Send PDF via WhatsApp
        const response = await whatsappHelper.sendDonationReceipt(
          options.phoneNo,
          pdfBuffer,
          `${options.receiptNumber}.pdf`
        );
        console.log(response);
      } catch (whatsappError) {
        console.error("Failed to send WhatsApp message:", whatsappError);
        // Continue with PDF download even if WhatsApp fails
      }

      await this.transporter.sendMail(mailOptions);
      console.log(`Donation receipt email sent to ${options.email}`);
    } catch (error) {
      console.error("Error in sendDonationReceiptEmail:", error);
      throw error;
    }
  }

  private generateEmailTemplate(options: DonationMailOptions): string {
    const formattedAmount = new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
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
        .footer .img{
            border-radius: 10px;
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
                <span class="detail-label">Receipt Number : </span>
                <span class="detail-value">${options.receiptNumber}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Transaction Number : </span>
                <span class="detail-value">${options.transactionNumber}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date : </span>
                <span class="detail-value">${options.date}</span>
            </div>
            
            <div class="detail-row" style="border-top: 2px solid #1565c0; margin-top: 15px; padding-top: 15px;">
                <span class="detail-label">Donation Amount : </span>
                <span class="detail-value amount-highlight">AUD${formattedAmount}</span>
            </div>
        </div>
        
        <div class="attachment-note">
            <strong>📎 Receipt Attached:</strong> Please find your official donation receipt attached as a PDF file .
        </div>
        
        <div class="thank-you">
            <h3 style="margin: 0 0 10px 0; color: #4caf50;">🙏 Your Impact Matters</h3>
            <p style="margin: 0;">Your generous donation helps us continue our mission of providing care, support, and hope to those in need. Thank you for being part of our community.</p>
        </div>
        
        <p>If you have any questions about your donation or need additional documentation, please don't hesitate to contact us.</p>
        
        <div class="footer">
            <p><strong>The Shanthibhavan Team</strong></p>
            <img
        crossorigin="anonymous"
        src="https://palliativeinternational.com/assets/images/resources/logo-1.png"
        alt="Logo"
      />
        </div>
    </div>
</body>
</html>
    `;
  }
}

export default new DonationReceiptMailer();

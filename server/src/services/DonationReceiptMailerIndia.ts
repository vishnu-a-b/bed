// server/src/services/DonationReceiptMailerIndia.ts
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

class DonationReceiptMailerIndia {
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
    email?: string;
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

    // Recipient address at top
    doc.fontSize(11).font("Helvetica");
    doc.text(user.name, 40, yPosition);
    yPosition += 15;

    // Handle multi-line address
    const addressHeight = getTextHeight(user.address, 300);
    doc.text(user.address, 40, yPosition, { width: 300 });
    yPosition += addressHeight + 5;
    doc.text(user.phoneNo, 40, yPosition);
    yPosition += 5;
    doc.text(user.email || "", 40, yPosition);
    yPosition += 25;

    // Greeting and thank you message
    doc.fontSize(10).font("Helvetica");
    doc.text(`Dear `, 40, yPosition, { continued: true });
    doc.font("Helvetica-Bold").text(user.name);
    yPosition += 20;

    doc.font("Helvetica");
    doc.text(
      `Thank you for making a contribution of Rs ${user.amount.toLocaleString("en-IN")} on Shanthibhavan. Please keep this written acknowledgement of your payment for your tax records.`,
      40,
      yPosition,
      { width: 500 }
    );
    yPosition += 35;

    // Payment Receipt header
    doc.fontSize(14).font("Helvetica-Bold");
    doc.text("Payment Receipt", 40, yPosition);
    yPosition += 25;

    // Receipt description
    doc.fontSize(10).font("Helvetica");
    doc.text(
      `We confirm the receipt of payment from Mr/Ms/Mrs ${user.name} as per details below:-`,
      40,
      yPosition,
      { width: 500 }
    );
    yPosition += 25;

    // Convert amount to words
    const amountInWords = toWords(user.amount).replace(/\b\w/g, (c) =>
      c.toUpperCase()
    );

    // Table data - India specific (proper table layout)
    const tableData = [
      ["Receipt No", user.receiptNumber],
      ["Payment date", user.date],
      ["Transaction Number", user.transactionNumber],
      ["Generous Contribution Received", `Rs ${user.amount.toLocaleString("en-IN")}`],
      ["Generous Contribution Received (Words)", amountInWords],
      ["Towards (Nonprofit/Program Name)", "ShanthiBhavan Palliative Hospital"],
    ];

    // Draw table with borders
    const tableTop = yPosition;
    const tableLeft = 40;
    const colWidths = [250, 300]; // Column widths for label and value
    const rowHeight = 30;

    // Draw table header (optional - can be removed if not needed)
    // doc.fontSize(10).font("Helvetica-Bold");
    // doc.rect(tableLeft, yPosition, colWidths[0] + colWidths[1], rowHeight).stroke();

    // Draw table rows
    tableData.forEach((row, index) => {
      const currentY = tableTop + index * rowHeight;

      // Draw cell borders
      doc.rect(tableLeft, currentY, colWidths[0], rowHeight).stroke();
      doc.rect(tableLeft + colWidths[0], currentY, colWidths[1], rowHeight).stroke();

      // Draw label (left column) - Bold
      doc.fontSize(10).font("Helvetica-Bold");
      doc.text(row[0], tableLeft + 5, currentY + 10, {
        width: colWidths[0] - 10,
        align: 'left'
      });

      // Draw value (right column) - Regular
      doc.font("Helvetica");
      doc.text(row[1], tableLeft + colWidths[0] + 5, currentY + 10, {
        width: colWidths[1] - 10,
        align: 'left'
      });
    });

    yPosition = tableTop + tableData.length * rowHeight + 15;

    // 80G Declaration
    doc.fontSize(10).font("Helvetica");
    doc.text(
      "Payment given to this Trust is eligible for deduction u/s 80G (5) of Income Tax Act 1961 as per Registration no. AAATF4482H/09/16-17/T0072/80G dated 30.09.2016, allotted to the trust by Commissioner of Income Tax (Exemptions), Kochi.",
      40,
      yPosition,
      { width: 500, align: 'justify' }
    );
    yPosition += 50;

    // For clarification section
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("FOR CLARIFICATION ONLY", 40, yPosition);
    yPosition += 20;

    doc.fontSize(9).font("Helvetica");
    doc.text(
      "This is an electronically generated receipt and does not require further validation.",
      40,
      yPosition,
      { width: 500 }
    );
    yPosition += 25;

    // Registered office
    doc.fontSize(9).font("Helvetica-Bold");
    doc.text("Registered office address: ", 40, yPosition, { continued: true });
    doc.font("Helvetica").text(
      "Shanthibhavan Palliative Hospital, Mountain of Mercy, Pallissery, Arattupuzha P.O, Thrissur - 680562",
      { width: 500 }
    );
    yPosition += 25;

    // Contact information
    doc.fontSize(9).font("Helvetica-Bold");
    doc.text("Contact: ", 40, yPosition, { continued: true });
    doc.font("Helvetica").text(
      "8921538116, 04876611600 | office@shanthibhavan.in",
      { width: 500 }
    );
    yPosition += 35;

    // Customer care
    doc.fontSize(9).font("Helvetica-Bold");
    doc.text("Customer Care: ", 40, yPosition, { continued: true });
    doc.font("Helvetica").text(
      "If you have any question regarding this 80G tax deduction certificate, kindly get in touch with our Customer Care team at office@shanthibhavan.in by quoting the Transaction Reference Number",
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
        email: options.email,
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
    const formattedAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
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
            border-bottom: 2px solid #ff9800;
        }
        .header h1 {
            color: #ff9800;
            margin: 0;
            font-size: 24px;
        }
        .receipt-details {
            background-color: #fff3e0;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #ff9800;
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
            color: #ff9800;
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
        .tax-info {
            background-color: #e3f2fd;
            border: 1px solid #90caf9;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-size: 14px;
        }
        .indian-flag {
            color: #ff9800;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🙏 Thank You for Your Donation!</h1>
        </div>

        <p>Dear ${options.name},</p>

        <p>We are deeply grateful for your generous contribution to Shanthibhavan Palliative Hospital. Your support makes a meaningful difference in the lives of those we serve.</p>

        <div class="receipt-details">
            <h3 style="margin-top: 0; color: #ff9800;">🧾 Donation Details</h3>
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

            <div class="detail-row" style="border-top: 2px solid #ff9800; margin-top: 15px; padding-top: 15px;">
                <span class="detail-label">Donation Amount : </span>
                <span class="detail-value amount-highlight">${formattedAmount}</span>
            </div>
        </div>

        <div class="tax-info">
            <strong>💼 Tax Benefit:</strong> This donation is eligible for tax deduction under Section 80G of the Income Tax Act, 1961. Please retain this receipt for your tax filing.
        </div>

        <div class="attachment-note">
            <strong>📎 Receipt Attached:</strong> Please find your official donation receipt attached as a PDF file.
        </div>

        <div class="thank-you">
            <h3 style="margin: 0 0 10px 0; color: #4caf50;">🙏 Your Impact Matters</h3>
            <p style="margin: 0;">Your generous donation helps us continue our mission of providing compassionate palliative care and support to patients and their families. Thank you for being part of our community.</p>
        </div>

        <p>If you have any questions about your donation or need additional documentation, please don't hesitate to contact us.</p>

        <div class="footer">
            <p><strong>The Shanthibhavan Team</strong></p>
            <p style="font-size: 12px; color: #888;">
                Shanthibhavan Palliative Hospital<br>
                Mountain of Mercy, Pallissery<br>
                Arattupuzha P.O, Thrissur - 680562, Kerala, India<br>
                Phone: 8921538116, 04876611600<br>
                Email: office@shanthibhavan.in<br>
                PAN: AAKTS3146K | 80G Approved
            </p>
            <img
        crossorigin="anonymous"
        src="https://donatebed.shanthibhavan.in/father.png"
        alt="Shanthibhavan Logo"
        style="max-width: 150px; height: auto;"
      />
        </div>
    </div>
</body>
</html>
    `;
  }
}

export default new DonationReceiptMailerIndia();

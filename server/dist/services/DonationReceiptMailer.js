"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/services/DonationReceiptMailer.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const number_to_words_1 = require("number-to-words");
const whatsapp_simple_helper_1 = __importDefault(require("./whatsapp-simple-helper"));
class DonationReceiptMailer {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: process.env.EMAIL_SERVICE || "gmail",
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }
    generateReceiptPDF(receiptData) {
        return __awaiter(this, void 0, void 0, function* () {
            const htmlTemplatePath = path_1.default.join(__dirname, "./receipt-template.ejs");
            const html = yield ejs_1.default.renderFile(htmlTemplatePath, {
                name: receiptData.name,
                amount: receiptData.amount,
                address: "",
                phoneNo: receiptData.phoneNo,
                date: receiptData.date,
                transactionNumber: receiptData.transactionNumber,
                receiptNumber: receiptData.receiptNumber,
                programName: receiptData.programName,
                amountWords: (0, number_to_words_1.toWords)(receiptData.amount).replace(/\b\w/g, (c) => c.toUpperCase()) +
                    " Only",
            });
            const browser = yield puppeteer_1.default.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"], // For server deployment
            });
            const page = yield browser.newPage();
            yield page.setContent(html, { waitUntil: "networkidle0" });
            yield page.emulateMediaType("screen");
            const pdfBuffer = yield page.pdf({
                format: "A4",
                printBackground: true,
            });
            yield browser.close();
            return pdfBuffer;
        });
    }
    sendDonationReceiptEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Generate PDF receipt
                const pdfBuffer = yield this.generateReceiptPDF({
                    name: options.name,
                    amount: options.amount,
                    address: "",
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
                    const response = yield whatsapp_simple_helper_1.default.sendDonationReceipt(options.phoneNo, pdfBuffer, `${options.receiptNumber}.pdf`);
                    console.log(response);
                }
                catch (whatsappError) {
                    console.error("Failed to send WhatsApp message:", whatsappError);
                    // Continue with PDF download even if WhatsApp fails
                }
                yield this.transporter.sendMail(mailOptions);
                console.log(`Donation receipt email sent to ${options.email}`);
            }
            catch (error) {
                console.error("Error in sendDonationReceiptEmail:", error);
                throw error;
            }
        });
    }
    generateEmailTemplate(options) {
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
            <div class="detail-row">
                <span class="detail-label">Program : </span>
                <span class="detail-value"> ${options.programName || "Generous Contribution Program"}</span>
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
exports.default = new DonationReceiptMailer();

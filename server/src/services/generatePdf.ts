import * as pdf from "html-pdf";
import ejs from "ejs";
import path from "path";
import { Response } from "express";
import { toWords } from "number-to-words";
import fs from "fs";
import whatsappHelper from "./whatsapp-simple-helper";
import { promisify } from "util";

export const generateReceiptPDF = async (
  res: Response,
  user: {
    name: string;
    amount: number;
    date: string;
    phoneNo: string;
    address: string;
    transactionNumber: string;
    receiptNumber: string;
    programName: string;
  }
) => {
  try {
    const htmlTemplatePath = path.join(
      __dirname,
      "../../views/receipt-template.ejs"
    );
    console.log(user);

    const html = await ejs.renderFile(htmlTemplatePath, {
      name: user.name,
      amount: user.amount,
      phoneNo: user.phoneNo,
      address: user.address,
      date: user.date,
      transactionNumber: user.transactionNumber,
      receiptNumber: user.receiptNumber,
      programName: user.programName,
      amountWords:
        toWords(user.amount).replace(/\b\w/g, (c) => c.toUpperCase()) + " Only",
    });

    // html-pdf options
    const options: pdf.CreateOptions = {
      format: "A4",
      orientation: "portrait",
      type: "pdf",
      quality: "100",
      
    };

    // Convert html-pdf.create to Promise
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      pdf.create(html, options).toBuffer((err, buffer) => {
        if (err) return reject(err);
        resolve(buffer);
      });
    });

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

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${user.receiptNumber}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    res.end(pdfBuffer);
  } catch (error: any) {
    console.error("PDF generation error:", error);
    res.status(500).json({
      error: "Failed to generate PDF",
      details: error.message,
    });
  }
};

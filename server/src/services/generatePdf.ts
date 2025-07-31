import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import { Response } from "express";
import { toWords } from "number-to-words";
import fs from "fs";
import whatsappHelper from "./whatsapp-simple-helper";

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

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.emulateMediaType("screen");

  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  //const response:any = whatsappHelper.sendDonationReceipt('+91 8848196653',pdfBuffer)
  //console.log(response);
  await browser.close();
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
};

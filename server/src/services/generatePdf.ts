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
  const htmlTemplatePath = path.join(__dirname, "./receipt-template.ejs");

  const html = await ejs.renderFile(htmlTemplatePath, {
    name: user.name,
    amount: user.amount,
    phoneNo: user.phoneNo,
    address: user.address,
    date: user.date,
    transactionNumber: user.transactionNumber,
    receiptNumber: user.receiptNumber,
    programName: user.programName,
    amountWords: toWords(user.amount).replace(/\b\w/g, (c) => c.toUpperCase()) + " Only",
  });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.emulateMediaType("screen");
  

  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  // const response = whatsappHelper.sendDonationReceipt('+91 8848196653',pdfBuffer)

  await browser.close();

  // Optional: Save to debug
  // fs.writeFileSync("debug-receipt.pdf", pdfBuffer);

  res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${user.receiptNumber}.pdf"`,
    "Content-Length": pdfBuffer.length,
  });

  res.end(pdfBuffer);
};

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
exports.generateReceiptPDF = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const number_to_words_1 = require("number-to-words");
const whatsapp_simple_helper_1 = __importDefault(require("./whatsapp-simple-helper"));
const generateReceiptPDF = (res, user) => __awaiter(void 0, void 0, void 0, function* () {
    const htmlTemplatePath = path_1.default.join(__dirname, "./receipt-template.ejs");
    const html = yield ejs_1.default.renderFile(htmlTemplatePath, {
        name: user.name,
        amount: user.amount,
        phoneNo: user.phoneNo,
        address: user.address,
        date: user.date,
        transactionNumber: user.transactionNumber,
        receiptNumber: user.receiptNumber,
        programName: user.programName,
        amountWords: (0, number_to_words_1.toWords)(user.amount).replace(/\b\w/g, (c) => c.toUpperCase()) + " Only",
    });
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    yield page.setContent(html, { waitUntil: "networkidle0" });
    yield page.emulateMediaType("screen");
    const pdfBuffer = yield page.pdf({ format: "A4", printBackground: true });
    //const response:any = whatsappHelper.sendDonationReceipt('+91 8848196653',pdfBuffer)
    //console.log(response);
    yield browser.close();
    try {
        // Send PDF via WhatsApp
        const response = yield whatsapp_simple_helper_1.default.sendDonationReceipt(user.phoneNo, pdfBuffer, `${user.receiptNumber}.pdf`);
        console.log(response);
    }
    catch (whatsappError) {
        console.error("Failed to send WhatsApp message:", whatsappError);
        // Continue with PDF download even if WhatsApp fails
    }
    res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${user.receiptNumber}.pdf"`,
        "Content-Length": pdfBuffer.length,
    });
    res.end(pdfBuffer);
});
exports.generateReceiptPDF = generateReceiptPDF;

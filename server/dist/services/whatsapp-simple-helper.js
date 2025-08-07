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
exports.whatsappHelper = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const OMNI_API_URL = "https://wb.omni.tatatelebusiness.com/whatsapp-cloud/messages";
const OMNI_API_KEY = process.env.OMNI_API_KEY || "your_api_key_here";
exports.whatsappHelper = {
    /**
     * Send a simple "Hi" WhatsApp message
     */
    sendHiMessage: (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const response = yield axios_1.default.post(OMNI_API_URL, {
                to: phoneNumber,
                type: "template",
                source: "external",
                template: {
                    name: "welcome",
                    language: {
                        code: "en",
                    },
                    components: [],
                },
                metaData: {
                    custom_callback_data: "optional_callback_data",
                },
            }, {
                headers: {
                    accept: "application/json",
                    Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6Iis5MTQ4NzY2MTE2MDAiLCJwaG9uZU51bWJlcklkIjoiNTkyODgyNzUzOTE2NjExIiwiaWF0IjoxNzQ1NTg1OTAwfQ.qmjk1dJX9qkcWvshZYdrkN13Bowe74k9qch8w8gWMRA`,
                    "Content-Type": "application/json",
                },
            });
            console.log("Hi message sent successfully!");
            return response.data.messageId;
        }
        catch (error) {
            console.error("Error sending Hi message:", error);
            if (axios_1.default.isAxiosError(error)) {
                console.error("Error sending Hi message:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || "Failed to send Hi message");
            }
            throw new Error("Unexpected error occurred");
        }
    }),
    sendSupporterWelcomeMessage: (phoneNumber, text) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const response = yield axios_1.default.post(OMNI_API_URL, {
                to: phoneNumber,
                type: "template",
                source: "external",
                template: {
                    name: "supporter_welcome",
                    language: {
                        code: "en",
                    },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                {
                                    type: "text",
                                    text: text,
                                },
                            ],
                        },
                    ],
                },
                metaData: {
                    custom_callback_data: "optional_callback_data",
                },
            }, {
                headers: {
                    accept: "application/json",
                    Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6Iis5MTQ4NzY2MTE2MDAiLCJwaG9uZU51bWJlcklkIjoiNTkyODgyNzUzOTE2NjExIiwiaWF0IjoxNzQ1NTg1OTAwfQ.qmjk1dJX9qkcWvshZYdrkN13Bowe74k9qch8w8gWMRA`,
                    "Content-Type": "application/json",
                },
            });
            console.log("Supporter welcome message sent successfully!");
            return response.data.messageId;
        }
        catch (error) {
            console.error("Error sending supporter welcome message:", error);
            if (axios_1.default.isAxiosError(error)) {
                console.error("Axios error details:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) ||
                    "Failed to send supporter welcome message");
            }
            throw new Error("Unexpected error occurred");
        }
    }),
    /**
     * Upload PDF buffer to temporary storage and get URL
     */
    uploadPDFToStorage: (pdfBuffer, filename) => __awaiter(void 0, void 0, void 0, function* () {
        // Option 1: Save to local temp directory (for development)
        const tempDir = path_1.default.join(process.cwd(), `public/temp`);
        if (!fs_1.default.existsSync(tempDir)) {
            fs_1.default.mkdirSync(tempDir, { recursive: true });
        }
        const filePath = path_1.default.join(tempDir, filename);
        fs_1.default.writeFileSync(filePath, pdfBuffer);
        // Return a publicly accessible URL - you'll need to serve this static directory
        // or upload to a cloud storage service like AWS S3, Google Cloud Storage, etc.
        return `${process.env.DOMAIN}/temp/${filename}`;
        // Option 2: Upload to cloud storage (uncomment and configure as needed)
        /*
        // Example for AWS S3
        const AWS = require('aws-sdk');
        const s3 = new AWS.S3();
        
        const uploadParams = {
          Bucket: 'your-bucket-name',
          Key: `receipts/${filename}`,
          Body: pdfBuffer,
          ContentType: 'application/pdf',
          ACL: 'public-read'
        };
        
        const result = await s3.upload(uploadParams).promise();
        return result.Location;
        */
    }),
    /**
     * Send donation receipt PDF via WhatsApp
     */
    sendDonationReceipt: (phoneNumber_1, pdfBuffer_1, ...args_1) => __awaiter(void 0, [phoneNumber_1, pdfBuffer_1, ...args_1], void 0, function* (phoneNumber, pdfBuffer, filename = `receipt_${Date.now()}.pdf`) {
        var _a, _b, _c;
        try {
            // Upload PDF and get URL
            const pdfUrl = yield exports.whatsappHelper.uploadPDFToStorage(pdfBuffer, filename);
            const components = [
                {
                    type: "header",
                    parameters: [
                        {
                            type: "document",
                            document: {
                                link: pdfUrl,
                                filename: filename,
                            },
                        },
                    ],
                },
            ];
            const response = yield axios_1.default.post(OMNI_API_URL, {
                to: phoneNumber,
                type: "template",
                source: "external",
                template: {
                    name: "gc_donation_receipt_au",
                    language: {
                        code: "en",
                    },
                    components: components,
                },
                metaData: {
                    custom_callback_data: "donation_receipt",
                },
            }, {
                headers: {
                    accept: "application/json",
                    Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6Iis5MTQ4NzY2MTE2MDAiLCJwaG9uZU51bWJlcklkIjoiNTkyODgyNzUzOTE2NjExIiwiaWF0IjoxNzQ1NTg1OTAwfQ.qmjk1dJX9qkcWvshZYdrkN13Bowe74k9qch8w8gWMRA`,
                    "Content-Type": "application/json",
                },
            });
            console.log("Donation receipt sent successfully!");
            // Clean up temporary file after sending (optional)
            setTimeout(() => {
                try {
                    const tempFilePath = path_1.default.join(process.cwd(), "temp", filename);
                    if (fs_1.default.existsSync(tempFilePath)) {
                        fs_1.default.unlinkSync(tempFilePath);
                    }
                }
                catch (cleanupError) {
                    console.warn("Could not clean up temporary file:", cleanupError);
                }
            }, 60000); // Delete after 1 minute
            return response.data.messageId;
        }
        catch (error) {
            console.error("Error sending donation receipt:", error);
            if (axios_1.default.isAxiosError(error)) {
                console.error("Error details:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || "Failed to send donation receipt");
            }
            throw new Error("Unexpected error occurred");
        }
    }),
};
exports.default = exports.whatsappHelper;

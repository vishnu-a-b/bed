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
const OMNI_API_URL = "https://wb.omni.tatatelebusiness.com/whatsapp-cloud/messages";
const OMNI_API_KEY = process.env.OMNI_API_KEY || "your_api_key_here";
exports.whatsappHelper = {
    /**
     * Send a simple "Hi" WhatsApp message
     * @param phoneNumber Recipient phone number with country code
     * @returns Promise with message ID
     * @throws Error if message fails to send
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
};
// Explicitly declare as module
exports.default = exports.whatsappHelper;

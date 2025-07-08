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
const nodemailer_1 = __importDefault(require("nodemailer"));
const Supporter_1 = require("../modules/supporter/models/Supporter"); // Adjust path as needed
class SupporterMailer {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: process.env.EMAIL_SERVICE || "gmail",
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }
    sendWelcomeEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                // 1. First find the supporter and populate bed and organization
                const supporter = yield Supporter_1.Supporter.findById(options.supporterId).populate(["user", { path: "bed", populate: { path: "organization" } }]);
                console.log(supporter);
                if (!supporter) {
                    throw new Error("Supporter not found");
                }
                // 2. Use the vcLink from supporter's organization
                const baseUrl = (_b = (_a = supporter.bed) === null || _a === void 0 ? void 0 : _a.organization) === null || _b === void 0 ? void 0 : _b.vcLink;
                if (!baseUrl) {
                    throw new Error("Organization VC link not found");
                }
                const supportLink = `${baseUrl}supporter?supporter=${supporter._id.toString()}`;
                // 3. Send email
                const mailOptions = {
                    from: `"Shanthibhavan Bed Donation" <${process.env.EMAIL_FROM}>`,
                    to: supporter.user.email,
                    subject: "Welcome to Shanthibhavan Bed Donation Program",
                    html: this.generateWelcomeTemplate(supporter.name, supportLink),
                };
                console.log(mailOptions);
                yield this.transporter.sendMail(mailOptions);
                console.log(`Welcome email sent to ${supporter.email}`);
            }
            catch (error) {
                console.error("Error in sendWelcomeEmail:", error);
                throw error;
            }
        });
    }
    generateWelcomeTemplate(name, supportLink) {
        return `
      <!DOCTYPE html>
<html>
<head>
    <style>
        /* Email styles with better button presentation */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .button-container {
            margin: 25px 0;
        }
        .button {
            background-color: #1565c0;
            color: white;
            padding: 12px 0;
            text-decoration: none;
            border-radius: 4px;
            display: block;
            width: 100%;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .button:hover {
            background-color: #0d47a1;
        }
        p {
            margin-bottom: 15px;
        }
        .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #666666;
        }
    </style>
</head>
<body>
    <p>Dear ${name},</p>
    
    <p>Thank you for registering as a supporter with Shanthibhavan!</p>
    
    <p>You can now access your supporter portal using the button below:</p>
    
    <div class="button-container">
        <a href="${supportLink}" class="button">Access Your Supporter Portal</a>
    </div>
    
    <p>If the button above doesn't work, copy and paste this link into your browser:<br>
    <small>${supportLink}</small></p>
    
    <div class="footer">
        <p>Best regards,<br>
        <strong>The Shanthibhavan Team</strong></p>
    </div>
</body>
</html>
    `;
    }
}
exports.default = new SupporterMailer();

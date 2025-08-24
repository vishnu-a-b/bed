import axios from "axios";
import fs from "fs";
import path from "path";

interface WhatsAppResponse {
  messageId: string;
  // Add other response properties as needed
}

const OMNI_API_URL =
  "https://wb.omni.tatatelebusiness.com/whatsapp-cloud/messages";
const OMNI_API_KEY = process.env.OMNI_API_KEY || "your_api_key_here";

export const whatsappHelper = {
  /**
   * Send a simple "Hi" WhatsApp message
   */
  sendHiMessage: async (phoneNumber: string): Promise<string> => {
    try {
      const response = await axios.post<WhatsAppResponse>(
        OMNI_API_URL,
        {
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
        },
        {
          headers: {
            accept: "application/json",
            Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6Iis5MTQ4NzY2MTE2MDAiLCJwaG9uZU51bWJlcklkIjoiNTkyODgyNzUzOTE2NjExIiwiaWF0IjoxNzQ1NTg1OTAwfQ.qmjk1dJX9qkcWvshZYdrkN13Bowe74k9qch8w8gWMRA`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Hi message sent successfully!");
      return response.data.messageId;
    } catch (error) {
      console.error("Error sending Hi message:", error);
      if (axios.isAxiosError(error)) {
        console.error(
          "Error sending Hi message:",
          error.response?.data || error.message
        );
        throw new Error(
          error.response?.data?.message || "Failed to send Hi message"
        );
      }
      throw new Error("Unexpected error occurred");
    }
  },
  sendSupporterWelcomeMessage: async (
    phoneNumber: string,
    text: string
  ): Promise<string> => {
    try {
      const response = await axios.post<WhatsAppResponse>(
        OMNI_API_URL,
        {
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
        },
        {
          headers: {
            accept: "application/json",
            Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6Iis5MTQ4NzY2MTE2MDAiLCJwaG9uZU51bWJlcklkIjoiNTkyODgyNzUzOTE2NjExIiwiaWF0IjoxNzQ1NTg1OTAwfQ.qmjk1dJX9qkcWvshZYdrkN13Bowe74k9qch8w8gWMRA`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Supporter welcome message sent successfully!");
      return response.data.messageId;
    } catch (error) {
      console.error("Error sending supporter welcome message:", error);
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios error details:",
          error.response?.data || error.message
        );
        throw new Error(
          error.response?.data?.message ||
            "Failed to send supporter welcome message"
        );
      }
      throw new Error("Unexpected error occurred");
    }
  },

  /**
   * Upload PDF buffer to temporary storage and get URL
   */
  uploadPDFToStorage: async (
    pdfBuffer: Buffer,
    filename: string
  ): Promise<string> => {
    // Option 1: Save to local temp directory (for development)
    const tempDir = path.join(process.cwd(), `public/temp`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, pdfBuffer);

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
  },

  /**
   * Send donation receipt PDF via WhatsApp
   */
  sendDonationReceipt: async (
    phoneNumber: string,
    pdfBuffer: any,
    filename: string = `receipt_${Date.now()}.pdf`
  ): Promise<string> => {
    try {
      // Upload PDF and get URL
      const pdfUrl = await whatsappHelper.uploadPDFToStorage(
        pdfBuffer,
        filename
      );

      const components: any = [
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

      const response = await axios.post<WhatsAppResponse>(
        OMNI_API_URL,
        {
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
        },
        {
          headers: {
            accept: "application/json",
            Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6Iis5MTQ4NzY2MTE2MDAiLCJwaG9uZU51bWJlcklkIjoiNTkyODgyNzUzOTE2NjExIiwiaWF0IjoxNzQ1NTg1OTAwfQ.qmjk1dJX9qkcWvshZYdrkN13Bowe74k9qch8w8gWMRA`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Donation receipt sent successfully!");

      // Clean up temporary file after sending (optional)
      setTimeout(() => {
        try {
          const tempFilePath = path.join(process.cwd(), "temp", filename);
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (cleanupError) {
          console.warn("Could not clean up temporary file:", cleanupError);
        }
      }, 60000); // Delete after 1 minute

      return response.data.messageId;
    } catch (error) {
      console.error("Error sending donation receipt:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error details:", error.response?.data || error.message);
        throw new Error(
          error.response?.data?.message || "Failed to send donation receipt"
        );
      }
      throw new Error("Unexpected error occurred");
    }
  },
  sendPaymentReminderMessage: async (
    phoneNumber: string,
    name: string,
    amount: string,
    bedNo: string,
    supportLink: string,
  ): Promise<string> => {
    try {
      const response = await axios.post<WhatsAppResponse>(
        OMNI_API_URL,
        {
          to: phoneNumber,
          type: "template",
          source: "external",
          template: {
            name: "first_followup_au",
            language: {
              code: "en",
            },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: name },
                  { type: "text", text: amount },
                  { type: "text", text: bedNo },
                  { type: "text", text: supportLink },
                ],
              },
              
            ],
          },
          metaData: {
            custom_callback_data: "first_followup_au",
          },
        },
        {
          headers: {
            accept: "application/json",
            Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6Iis5MTQ4NzY2MTE2MDAiLCJwaG9uZU51bWJlcklkIjoiNTkyODgyNzUzOTE2NjExIiwiaWF0IjoxNzQ1NTg1OTAwfQ.qmjk1dJX9qkcWvshZYdrkN13Bowe74k9qch8w8gWMRA`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Payment reminder message sent successfully!");
      return response.data.messageId;
    } catch (error) {
      console.error("Error sending payment reminder message:", error);
      if (axios.isAxiosError(error)) {
        console.error(
          "Axios error details:",
          error.response?.data || error.message
        );
        throw new Error(
          error.response?.data?.message ||
            "Failed to send payment reminder message"
        );
      }
      throw new Error("Unexpected error occurred");
    }
  },
};

export default whatsappHelper;

import axios from "axios";

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
   * @param phoneNumber Recipient phone number with country code
   * @returns Promise with message ID
   * @throws Error if message fails to send
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
sendDonationReceipt: async (
  phoneNumber: string,
  pdfBuffer: any,  // Accept buffer instead of URL
): Promise<string> => {
  try {
    // First upload the PDF to a storage service to get a URL
    
    
    const components: any = [
      {
        type: "header",
        parameters: [
          {
            type: "document",
            document: {
              pdfBuffer,
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
          name: "gc_donation_receipt_ac",
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
    return response.data.messageId;
  } catch (error) {
    console.error("Error sending donation receipt:", error);
    if (axios.isAxiosError(error)) {
      console.error(
        "Error details:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to send donation receipt"
      );
    }
    throw new Error("Unexpected error occurred");
  }
},


};


// Explicitly declare as module
export default whatsappHelper;

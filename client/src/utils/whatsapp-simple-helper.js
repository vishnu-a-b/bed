// whatsapp-simple-helper.js
const axios = require('axios');

const whatsappHelper = {
    /**
     * Send a simple "Hi" WhatsApp message
     * @param {string} phoneNumber - Recipient phone number with country code
     * @returns {Promise<string>} Message ID
     */
    sendHiMessage: async (phoneNumber) => {
        try {
            const response = await axios.post(
                'https://wb.omni.tatatelebusiness.com/messages',
                {
                    channel: "whatsapp",
                    recipient: phoneNumber,
                    text: {
                        body: "Hi"
                    }
                },
                {
                    headers: {
                        'Authorization': 'key YOUR_OMNI_API_KEY',
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log("Hi message sent successfully!");
            return response.data.messageId;
        } catch (error) {
            console.error('Error sending Hi message:', error.response?.data || error.message);
            throw new Error('Failed to send Hi message');
        }
    }
};

module.exports = whatsappHelper;
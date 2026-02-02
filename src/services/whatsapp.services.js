import axios from "axios";

/**
 * Send a WhatsApp template message using Meta WhatsApp Cloud API
 * @param {string} phoneNumber - Recipient's phone number (with country code, e.g., +919876543210)
 * @param {string} templateName - Name of the approved template message
 * @param {Array} parameters - Array of template parameters
 * @returns {Promise<Object>} - API response
 */
export const sendWhatsAppMessage = async (phoneNumber, templateName, parameters) => {
  try {
    const url = `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`;
    
    const payload = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: "en",
        },
        components: [
          {
            type: "body",
            parameters: parameters.map((param) => ({
              type: "text",
              text: param,
            })),
          },
        ],
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("WhatsApp API Error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Send maintenance reminder to car owner
 * @param {Object} maintenanceRecord - Car maintenance record
 * @returns {Promise<Object>} - Send result
 */
export const sendMaintenanceReminder = async (maintenanceRecord) => {
  const { ownerWhatsAppNumber, carRegistrationNumber, nextServiceDate } = maintenanceRecord;
  
  // Format date for display
  const formattedDate = new Date(nextServiceDate).toLocaleDateString("en-GB");
  
  // Template parameters: Car Number, Service Date
  const parameters = [carRegistrationNumber, formattedDate];
  
  return await sendWhatsAppMessage(
    ownerWhatsAppNumber,
    "maintenance_reminder",
    parameters
  );
};

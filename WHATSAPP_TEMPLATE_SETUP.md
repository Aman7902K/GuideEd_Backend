# WhatsApp Cloud API Template Setup Guide

## Template Details for Auto-Reminder System

### Template Name
`maintenance_reminder`

### Template Category
**Transactional** (or Utility)

### Template Language
English (en)

## Template Structure

### Header (Optional)
You can add a header if desired, but it's not required for this use case.

### Body (Required)
```
Hello! Your car {{1}} is due for maintenance on {{2}}. Please schedule your service appointment soon to keep your vehicle in top condition.
```

**Variables:**
- `{{1}}` - Car Registration Number (e.g., "MH12AB1234")
- `{{2}}` - Next Service Date (e.g., "15/04/2024")

### Footer (Optional)
```
Thank you for using our Auto-Reminder service!
```

### Buttons (Optional)
You can add call-to-action buttons:
- **Call Button**: "Call Service Center"
- **URL Button**: "Book Appointment"

## Complete Template Example

**Template Type**: Marketing or Utility/Transactional

**Message Format:**
```
Hello! Your car MH12AB1234 is due for maintenance on 15/04/2024. Please schedule your service appointment soon to keep your vehicle in top condition.

Thank you for using our Auto-Reminder service!
```

## Steps to Create Template in Meta Business Manager

### 1. Access WhatsApp Manager
- Go to [Meta Business Suite](https://business.facebook.com/)
- Navigate to **WhatsApp Manager**
- Select your **WhatsApp Business Account**

### 2. Create Message Template
1. Click on **Message Templates** in the left sidebar
2. Click **Create Template** button
3. Fill in the template details:
   - **Template Name**: `maintenance_reminder`
   - **Category**: Utility (recommended) or Marketing
   - **Languages**: English

### 3. Design Template Content

#### Body Section
1. Click on the **Body** section
2. Enter the text:
```
Hello! Your car {{1}} is due for maintenance on {{2}}. Please schedule your service appointment soon to keep your vehicle in top condition.
```
3. The `{{1}}` and `{{2}}` will automatically be recognized as variables

#### Footer Section (Optional)
```
Thank you for using our Auto-Reminder service!
```

#### Buttons (Optional)
- **Type**: Call to Action
- **Button 1**: "Call Now" (phone number)
- **Button 2**: "Visit Website" (URL)

### 4. Submit for Approval
1. Review your template
2. Click **Submit**
3. Wait for Meta to approve (usually 1-24 hours)

## Template Approval Tips

To increase chances of quick approval:
- ✅ Keep message clear and professional
- ✅ Use proper grammar and punctuation
- ✅ Make purpose of message obvious
- ✅ Avoid promotional language in transactional templates
- ✅ Include clear opt-out instructions if needed
- ❌ Don't use misleading content
- ❌ Avoid sensitive topics
- ❌ Don't include promotional offers in utility templates

## Using the Template in Code

The template is already integrated in the backend:

### File: `src/services/whatsapp.services.js`

```javascript
export const sendMaintenanceReminder = async (maintenanceRecord) => {
  const { ownerWhatsAppNumber, carRegistrationNumber, nextServiceDate } = maintenanceRecord;
  
  // Format date for display
  const formattedDate = new Date(nextServiceDate).toLocaleDateString("en-GB");
  
  // Template parameters: Car Number, Service Date
  const parameters = [carRegistrationNumber, formattedDate];
  
  return await sendWhatsAppMessage(
    ownerWhatsAppNumber,
    "maintenance_reminder",  // Template name
    parameters
  );
};
```

### API Request Structure

The code sends this JSON to WhatsApp API:

```json
{
  "messaging_product": "whatsapp",
  "to": "+919876543210",
  "type": "template",
  "template": {
    "name": "maintenance_reminder",
    "language": {
      "code": "en"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "text": "MH12AB1234"
          },
          {
            "type": "text",
            "text": "15/04/2024"
          }
        ]
      }
    ]
  }
}
```

## Testing the Template

### Option 1: Via WhatsApp Manager
1. Go to your approved template
2. Click **Send Test Message**
3. Enter your phone number
4. Fill in test values for variables
5. Send and verify receipt

### Option 2: Via API (Postman/cURL)

```bash
curl -X POST \
  'https://graph.facebook.com/v21.0/YOUR_PHONE_NUMBER_ID/messages' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "messaging_product": "whatsapp",
    "to": "YOUR_TEST_PHONE_NUMBER",
    "type": "template",
    "template": {
      "name": "maintenance_reminder",
      "language": {
        "code": "en"
      },
      "components": [
        {
          "type": "body",
          "parameters": [
            {
              "type": "text",
              "text": "TEST123"
            },
            {
              "type": "text",
              "text": "01/01/2025"
            }
          ]
        }
      ]
    }
  }'
```

### Option 3: Via Application Cron Job

Uncomment the test line in `src/services/cron.services.js`:

```javascript
export const initCronJobs = () => {
  cron.schedule("0 9 * * *", checkAndSendReminders, {
    timezone: "Asia/Kolkata",
  });
  
  console.log("✓ Cron job initialized");
  
  // Uncomment to test immediately on server start:
  checkAndSendReminders();  // <-- Uncomment this line
};
```

## Alternative Template Designs

### Design 1: Simple and Direct
```
Your vehicle {{1}} requires maintenance on {{2}}. Book your appointment now!
```

### Design 2: Detailed with Personalization
```
Hi there! 

This is a friendly reminder that your car ({{1}}) is scheduled for its next service on {{2}}.

Regular maintenance helps:
✓ Extend vehicle life
✓ Maintain safety
✓ Prevent costly repairs

Please contact us to schedule your appointment.
```

### Design 3: With Urgency
```
⚠️ Service Alert!

Your car {{1}} is due for maintenance on {{2}}.

Don't wait - book your service appointment today to ensure optimal performance and safety.
```

## Troubleshooting Template Issues

### Template Not Approved
- **Reason**: Violates Meta policies
- **Solution**: Review content guidelines, remove promotional language, resubmit

### Template Rejected
- **Reason**: Contains sensitive content or spam
- **Solution**: Make message more professional, follow template guidelines

### Messages Not Sending
- **Check**: Template status is "Approved"
- **Check**: Template name matches exactly in code
- **Check**: Phone number format is correct (+countrycode)
- **Check**: Access token is valid
- **Check**: Phone number is registered with WhatsApp

### Variables Not Replaced
- **Check**: Parameters array in code matches template variables
- **Check**: Parameters are in correct order
- **Check**: All required parameters are provided

## Best Practices

1. **Keep It Short**: Mobile users prefer concise messages
2. **Clear Purpose**: Make the reason for contact obvious
3. **Professional Tone**: Use business-appropriate language
4. **Time Sensitivity**: Include dates/deadlines when relevant
5. **Call to Action**: Tell users what to do next
6. **Test Thoroughly**: Always test before going live
7. **Monitor Delivery**: Check API responses for errors
8. **Respect Opt-outs**: Honor user preferences

## Resources

- [Meta WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates)
- [Template Components](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages#template-object)
- [Business Policy](https://www.whatsapp.com/legal/business-policy)

## Support

For template-related issues:
1. Check [WhatsApp Business API Status](https://developers.facebook.com/status/)
2. Review [Template Quality Guidelines](https://www.facebook.com/business/help/2055875911147364)
3. Contact Meta Business Support through Business Manager

---

**Important**: Always ensure your templates comply with Meta's policies and local regulations regarding automated messaging.

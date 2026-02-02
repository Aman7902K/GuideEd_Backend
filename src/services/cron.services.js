import cron from "node-cron";
import { CarMaintenance } from "../models/carmaintenance.model.js";
import { sendMaintenanceReminder } from "./whatsapp.services.js";

/**
 * Check for cars due for maintenance today and send reminders
 */
const checkAndSendReminders = async () => {
  try {
    console.log("Running daily maintenance reminder check...");
    
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date at midnight
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find all records where nextServiceDate is today and reminder not yet sent
    const dueRecords = await CarMaintenance.find({
      nextServiceDate: {
        $gte: today,
        $lt: tomorrow,
      },
      reminderSent: false,
    });
    
    console.log(`Found ${dueRecords.length} records due for maintenance today`);
    
    // Send reminders
    for (const record of dueRecords) {
      try {
        const result = await sendMaintenanceReminder(record);
        
        if (result.success) {
          // Mark reminder as sent
          record.reminderSent = true;
          await record.save();
          console.log(`✓ Reminder sent for car: ${record.carRegistrationNumber}`);
        } else {
          console.error(`✗ Failed to send reminder for car: ${record.carRegistrationNumber}`, result.error);
        }
      } catch (error) {
        console.error(`Error sending reminder for car: ${record.carRegistrationNumber}`, error);
      }
    }
    
    console.log("Daily maintenance reminder check completed");
  } catch (error) {
    console.error("Error in checkAndSendReminders:", error);
  }
};

/**
 * Initialize the cron job to run daily at 9:00 AM
 */
export const initCronJobs = () => {
  // Run every day at 9:00 AM
  // Format: second minute hour day month weekday
  cron.schedule("0 9 * * *", checkAndSendReminders, {
    timezone: "Asia/Kolkata", // Adjust timezone as needed
  });
  
  console.log("✓ Cron job initialized: Daily maintenance reminder at 9:00 AM");
  
  // Optional: Run immediately on startup for testing
  // Uncomment the next line if you want to test the cron job on server start
  // checkAndSendReminders();
};

// Export for manual testing
export { checkAndSendReminders };

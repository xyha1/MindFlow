import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Helper to convert string IDs (from our app) to Integer IDs (required by Capacitor)
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash); // Ensure positive
};

export const requestNotificationPermission = async () => {
  // Only run on native platforms to avoid browser errors
  if (!Capacitor.isNativePlatform()) {
    console.log("Web platform: Notifications simulated");
    return true;
  }

  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (e) {
    console.error("Error requesting notification permissions", e);
    return false;
  }
};

// Define Action Type ID
const REMINDER_ACTION_TYPE = 'EVENT_REMINDER';

export const configureNotifications = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: REMINDER_ACTION_TYPE,
          actions: [
            {
              id: 'complete',
              title: 'Mark Completed',
              foreground: false // Perform action in background without opening app fully if possible
            },
            {
              id: 'ignore',
              title: 'Ignore',
              destructive: true, // Usually shows in red
              foreground: false
            }
          ]
        }
      ]
    });
    console.log('Notification actions configured');
  } catch (e) {
    console.error('Failed to configure notifications', e);
  }
};

export const scheduleNotification = async (
  id: string,
  title: string,
  body: string,
  dateStr: string, // YYYY-MM-DD
  timeStr: string  // HH:MM
) => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Construct Date object
    const scheduleDate = new Date(`${dateStr}T${timeStr}:00`);
    const now = new Date();

    // Only schedule if the time is in the future
    if (scheduleDate <= now) return;

    const intId = hashCode(id);

    await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: body || `Reminder for ${timeStr}`,
          id: intId,
          schedule: { at: scheduleDate },
          sound: undefined, 
          actionTypeId: REMINDER_ACTION_TYPE, // Link to the buttons we defined
          extra: {
            eventId: id,
            dateStr: dateStr
          }
        }
      ]
    });
    console.log(`Notification scheduled for ${scheduleDate.toLocaleString()} (ID: ${intId})`);
  } catch (e) {
    console.error("Failed to schedule notification", e);
  }
};

export const cancelNotification = async (id: string) => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const intId = hashCode(id);
    await LocalNotifications.cancel({ notifications: [{ id: intId }] });
  } catch (e) {
    console.error("Failed to cancel notification", e);
  }
};
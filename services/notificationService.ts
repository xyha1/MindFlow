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

// CHANGED: Use v2 ID to force Android to recreate the channel with new high-priority settings
// This is critical for Xiaomi devices where channel settings get cached aggressively
const REMINDER_CHANNEL_ID = 'mindflow_alerts_v2';
const REMINDER_ACTION_TYPE = 'EVENT_REMINDER_ACTIONS';

export const configureNotifications = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // 1. Create a Channel with High Importance for Sound and Vibration (Android)
    await LocalNotifications.createChannel({
        id: REMINDER_CHANNEL_ID,
        name: 'Event Reminders',
        description: 'Notifications for scheduled calendar events',
        importance: 5, // HIGH importance (heads-up display, sound, vibration)
        visibility: 1, // PUBLIC (Show on lock screen)
        vibration: true,
        lights: true,
        lightColor: '#14b8a6', // Teal
    });

    // 2. Register Action Types (Buttons)
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: REMINDER_ACTION_TYPE,
          actions: [
            {
              id: 'complete',
              title: 'Complete',
              foreground: false 
            },
            {
              id: 'snooze',
              title: 'Snooze 10m',
              foreground: false
            },
            {
              id: 'cancel',
              title: 'Cancel',
              destructive: true, // Usually red
              foreground: false
            }
          ]
        }
      ]
    });
    console.log('Notification channels and actions configured (v2)');
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
    const scheduleDate = new Date(`${dateStr}T${timeStr}:00`);
    const now = new Date();

    if (scheduleDate <= now) return;

    const intId = hashCode(id);

    await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: body || `Reminder for ${timeStr}`,
          id: intId,
          schedule: { 
            at: scheduleDate,
            allowWhileIdle: true // CRITICAL: Fixes late delivery in Android Doze mode
          },
          channelId: REMINDER_CHANNEL_ID, // Use our high-priority channel
          actionTypeId: REMINDER_ACTION_TYPE, // Attach buttons
          smallIcon: 'ic_stat_icon_config_sample', // Default capacitor resource for clean icon
          extra: {
            eventId: id,
            dateStr: dateStr,
            originalTitle: title,
            originalBody: body
          }
        }
      ]
    });
    console.log(`Notification scheduled for ${scheduleDate.toLocaleString()} (ID: ${intId})`);
  } catch (e) {
    console.error("Failed to schedule notification", e);
  }
};

export const snoozeNotification = async (notification: any) => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
        const extra = notification.extra;
        // Schedule for 10 minutes from now
        const snoozeTime = new Date(Date.now() + 10 * 60 * 1000); 
        
        await LocalNotifications.schedule({
            notifications: [{
                title: extra?.originalTitle || notification.title,
                body: "💤 Snoozed: " + (extra?.originalBody || notification.body),
                id: notification.id + 1, // Simple way to generate new ID or use same
                schedule: { 
                  at: snoozeTime,
                  allowWhileIdle: true 
                },
                channelId: REMINDER_CHANNEL_ID,
                actionTypeId: REMINDER_ACTION_TYPE,
                smallIcon: 'ic_stat_icon_config_sample',
                extra: extra
            }]
        });
        console.log("Notification snoozed for 10 minutes");
    } catch (e) {
        console.error("Failed to snooze", e);
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
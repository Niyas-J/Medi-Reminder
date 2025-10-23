import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform } from 'react-native';
import { Medicine, NotificationConfig } from '../types';

class NotificationService {
  constructor() {
    this.configure();
  }

  configure = () => {
    PushNotification.configure({
      // Called when a notification is clicked
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },

      // IOS ONLY (optional): Called when Token is generated
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'medicine-reminder',
          channelName: 'Medicine Reminders',
          channelDescription: 'Notifications for medication schedules',
          playSound: true,
          soundName: 'default',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );
    }
  };

  /**
   * Schedule notifications for a medicine
   */
  scheduleMedicineNotifications = (medicine: Medicine): NotificationConfig[] => {
    const notifications: NotificationConfig[] = [];

    medicine.times.forEach((time, index) => {
      const [hours, minutes] = time.split(':').map(Number);
      const notificationId = this.generateNotificationId(medicine.id, index);

      // Schedule repeating notification
      PushNotification.localNotificationSchedule({
        channelId: 'medicine-reminder',
        id: notificationId,
        title: '💊 Medicine Reminder',
        message: `Time to take ${medicine.name} - ${medicine.dosage}`,
        date: this.getNextNotificationDate(hours, minutes),
        repeatType: 'day',
        repeatTime: 1,
        allowWhileIdle: true,
        playSound: true,
        soundName: 'default',
        importance: 'high',
        vibrate: true,
        vibration: 300,
        actions: ['Take', 'Skip', 'Snooze 10min'],
        invokeApp: true,
        userInfo: {
          medicineId: medicine.id,
          medicineName: medicine.name,
          dosage: medicine.dosage,
          scheduledTime: time,
        },
      });

      notifications.push({
        id: `${medicine.id}-${index}`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        scheduledTime: this.getNextNotificationDate(hours, minutes),
        notificationId,
        enabled: true,
      });
    });

    return notifications;
  };

  /**
   * Schedule refill reminder notification
   */
  scheduleRefillNotification = (medicine: Medicine) => {
    const notificationId = this.generateNotificationId(medicine.id, 999);
    
    // Schedule notification 3 days before refill date
    const refillReminderDate = new Date(medicine.refillDate);
    refillReminderDate.setDate(refillReminderDate.getDate() - 3);

    PushNotification.localNotificationSchedule({
      channelId: 'medicine-reminder',
      id: notificationId,
      title: '🔔 Refill Reminder',
      message: `Your ${medicine.name} needs to be refilled soon. Order now for delivery.`,
      date: refillReminderDate,
      allowWhileIdle: true,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      vibrate: true,
      actions: ['Order Now', 'Dismiss'],
      userInfo: {
        type: 'refill',
        medicineId: medicine.id,
        medicineName: medicine.name,
      },
    });
  };

  /**
   * Cancel all notifications for a specific medicine
   */
  cancelMedicineNotifications = (medicineId: string) => {
    // Cancel up to 10 possible notification slots for this medicine
    for (let i = 0; i < 10; i++) {
      const notificationId = this.generateNotificationId(medicineId, i);
      PushNotification.cancelLocalNotification(notificationId);
    }
  };

  /**
   * Cancel a specific notification
   */
  cancelNotification = (notificationId: number) => {
    PushNotification.cancelLocalNotification(notificationId);
  };

  /**
   * Snooze a notification
   */
  snoozeNotification = (medicineId: string, medicineName: string, minutes: number = 10) => {
    const snoozeId = parseInt(`${Date.now()}`.slice(-6));
    const snoozeDate = new Date();
    snoozeDate.setMinutes(snoozeDate.getMinutes() + minutes);

    PushNotification.localNotificationSchedule({
      channelId: 'medicine-reminder',
      id: snoozeId,
      title: '💊 Snoozed Reminder',
      message: `Time to take ${medicineName}`,
      date: snoozeDate,
      allowWhileIdle: true,
      playSound: true,
      soundName: 'default',
      userInfo: {
        type: 'snoozed',
        medicineId,
        medicineName,
      },
    });
  };

  /**
   * Request notification permissions
   */
  requestPermissions = async () => {
    return new Promise((resolve) => {
      PushNotification.requestPermissions(['alert', 'badge', 'sound']).then(
        (permissions) => {
          console.log('Permissions:', permissions);
          resolve(permissions);
        }
      );
    });
  };

  /**
   * Get all scheduled notifications
   */
  getScheduledNotifications = () => {
    return new Promise((resolve) => {
      PushNotification.getScheduledLocalNotifications((notifications) => {
        resolve(notifications);
      });
    });
  };

  /**
   * Cancel all notifications
   */
  cancelAllNotifications = () => {
    PushNotification.cancelAllLocalNotifications();
  };

  /**
   * Generate unique notification ID from medicine ID and index
   */
  private generateNotificationId = (medicineId: string, index: number): number => {
    const hash = medicineId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return Math.abs(hash + index) % 1000000;
  };

  /**
   * Get next notification date for given time
   */
  private getNextNotificationDate = (hours: number, minutes: number): Date => {
    const now = new Date();
    const notificationDate = new Date();
    notificationDate.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (notificationDate <= now) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }

    return notificationDate;
  };
}

export default new NotificationService();


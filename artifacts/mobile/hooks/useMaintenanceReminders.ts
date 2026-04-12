import { useState, useEffect, useCallback } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface ReminderData {
  notificationId: string;
  reminderDate: string;
}

const storageKey = (recordId: number) => `maintenance-reminder-${recordId}`;

async function saveReminder(recordId: number, data: ReminderData) {
  await AsyncStorage.setItem(storageKey(recordId), JSON.stringify(data));
}

async function loadReminder(recordId: number): Promise<ReminderData | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(recordId));
    return raw ? (JSON.parse(raw) as ReminderData) : null;
  } catch {
    return null;
  }
}

async function deleteReminder(recordId: number) {
  await AsyncStorage.removeItem(storageKey(recordId));
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleMaintenanceReminder(
  recordId: number,
  type: string,
  reminderDate: Date
): Promise<boolean> {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  const existing = await loadReminder(recordId);
  if (existing) {
    await Notifications.cancelScheduledNotificationAsync(existing.notificationId).catch(() => {});
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Maintenance Reminder",
      body: `Time for ${type} on your vehicle.`,
      data: { recordId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });

  await saveReminder(recordId, {
    notificationId,
    reminderDate: reminderDate.toISOString(),
  });
  return true;
}

export async function cancelMaintenanceReminder(recordId: number): Promise<void> {
  const existing = await loadReminder(recordId);
  if (existing) {
    await Notifications.cancelScheduledNotificationAsync(existing.notificationId).catch(() => {});
    await deleteReminder(recordId);
  }
}

export function useMaintenanceReminder(recordId: number) {
  const [reminder, setReminder] = useState<ReminderData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await loadReminder(recordId);
    setReminder(data);
    setLoading(false);
  }, [recordId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { reminder, loading, refresh };
}

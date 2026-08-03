import notifee, { AndroidImportance } from '@notifee/react-native';


export async function setupNotifications() {

  await notifee.requestPermission();

  await notifee.createChannel({
    id: "habit-reminders",
    name: "Habit Erinnerungen",
    importance: AndroidImportance.HIGH,
  });


  console.log("Notifications ready");
}
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import client from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPush() {
  try {
    if (!Device.isDevice) return null;
    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      finalStatus = req.status;
    }
    if (finalStatus !== 'granted') return null;

    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    const token = tokenResponse?.data;
    if (token) {
      try {
        await client.post('/user/push-token', { expo_push_token: token });
      } catch (err) {
        console.warn('Could not sync push token with backend:', err.message);
      }
    }
    return token;
  } catch (error) {
    console.warn('Push notification registration failed:', error.message);
    return null;
  }
}

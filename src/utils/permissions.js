import { Alert, Linking, Platform } from 'react-native';

import * as Camera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as MediaLibrary from 'expo-media-library';

const showPermissionAlert = (title, message) => {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Open Settings',
      onPress: () => Linking.openSettings(),
    },
  ]);
};

export const requestCameraPermission = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();

  if (status !== 'granted') {
    showPermissionAlert(
      'Camera Permission Needed',
      'Please allow camera access to take photos and make video calls.'
    );
    return false;
  }

  return true;
};

export const requestMicrophonePermission = async () => {
  const { status } = await Camera.requestMicrophonePermissionsAsync();

  if (status !== 'granted') {
    showPermissionAlert(
      'Microphone Permission Needed',
      'Please allow microphone access for voice notes, calls and video calls.'
    );
    return false;
  }

  return true;
};

export const requestMediaLibraryPermission = async () => {
  const { status } =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    showPermissionAlert(
      'Gallery Permission Needed',
      'Please allow gallery access to choose photos, videos and documents.'
    );
    return false;
  }

  return true;
};

export const requestLocationPermission = async () => {
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    showPermissionAlert(
      'Location Permission Needed',
      'Please allow location access for prayer times, Qibla direction and mosque finder.'
    );
    return false;
  }

  return true;
};

export const requestNotificationPermission = async () => {
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } =
      await Notifications.requestPermissionsAsync();

    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    showPermissionAlert(
      'Notification Permission Needed',
      'Please allow notifications for prayer reminders, messages, calls and important updates.'
    );
    return false;
  }

  return true;
};

export const requestMediaSavePermission = async () => {
  const { status } =
    await MediaLibrary.requestPermissionsAsync();

  if (status !== 'granted') {
    showPermissionAlert(
      'Storage Permission Needed',
      'Please allow storage access to save downloaded images, videos and files.'
    );
    return false;
  }

  return true;
};

export const requestCallPermissions = async () => {
  const camera = await requestCameraPermission();
  const microphone = await requestMicrophonePermission();

  return camera && microphone;
};

export const requestAllBasicPermissions = async () => {
  const camera = await requestCameraPermission();
  const microphone = await requestMicrophonePermission();
  const gallery = await requestMediaLibraryPermission();
  const location = await requestLocationPermission();
  const notifications = await requestNotificationPermission();

  return {
    camera,
    microphone,
    gallery,
    location,
    notifications,
    allGranted:
      camera &&
      microphone &&
      gallery &&
      location &&
      notifications,
  };
};

export const openAppSettings = () => {
  Linking.openSettings();
};

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export default {
  requestCameraPermission,
  requestMicrophonePermission,
  requestMediaLibraryPermission,
  requestLocationPermission,
  requestNotificationPermission,
  requestMediaSavePermission,
  requestCallPermissions,
  requestAllBasicPermissions,
  openAppSettings,
  isIOS,
  isAndroid,
};
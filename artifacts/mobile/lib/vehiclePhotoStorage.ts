import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Alert } from "react-native";

const key = (vehicleId: number) => `vehicle-photo-${vehicleId}`;

const MAX_DIMENSION = 800;

export async function getVehiclePhoto(vehicleId: number): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key(vehicleId));
  } catch {
    return null;
  }
}

export async function setVehiclePhoto(vehicleId: number, base64Uri: string): Promise<void> {
  await AsyncStorage.setItem(key(vehicleId), base64Uri);
}

export async function removeVehiclePhoto(vehicleId: number): Promise<void> {
  await AsyncStorage.removeItem(key(vehicleId));
}

async function processAsset(
  asset: ImagePicker.ImagePickerAsset
): Promise<string | null> {
  const { width, height } = asset;
  const needsResize = width > MAX_DIMENSION || height > MAX_DIMENSION;
  const resize = needsResize
    ? width >= height
      ? { width: MAX_DIMENSION }
      : { height: MAX_DIMENSION }
    : undefined;

  const actions: ImageManipulator.Action[] = resize ? [{ resize }] : [];
  const result = await ImageManipulator.manipulateAsync(
    asset.uri,
    actions,
    {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  if (!result.base64) return null;
  return `data:image/jpeg;base64,${result.base64}`;
}

export async function pickVehiclePhoto(
  source: "camera" | "gallery"
): Promise<string | null> {
  let pickerResult: ImagePicker.ImagePickerResult;

  if (source === "camera") {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera access is required to take a photo.");
      return null;
    }
    pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  } else {
    pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  }

  if (pickerResult.canceled || !pickerResult.assets[0]) return null;

  const dataUri = await processAsset(pickerResult.assets[0]);
  if (!dataUri) {
    Alert.alert("Error", "Failed to process the selected photo.");
    return null;
  }
  return dataUri;
}

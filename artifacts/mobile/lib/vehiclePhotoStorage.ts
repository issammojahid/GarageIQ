import AsyncStorage from "@react-native-async-storage/async-storage";

const key = (vehicleId: number) => `vehicle-photo-${vehicleId}`;

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

// utils/storage.ts
import { Platform } from "react-native";

export const storageSet = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    const AsyncStorage = await import("@react-native-async-storage/async-storage");
    await AsyncStorage.setItem(key, value);
  }
};

export const storageGet = async (key: string) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  } else {
    const AsyncStorage = await import("@react-native-async-storage/async-storage");
    return await AsyncStorage.getItem(key);
  }
};

export const storageRemove = async (key: string) => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    const AsyncStorage = await import("@react-native-async-storage/async-storage");
    await AsyncStorage.removeItem(key);
  }
};

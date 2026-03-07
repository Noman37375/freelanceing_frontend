// utils/storage.ts
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storageSet = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
};

export const storageGet = async (key: string) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  } else {
    return await AsyncStorage.getItem(key);
  }
};

export const storageRemove = async (key: string) => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
};

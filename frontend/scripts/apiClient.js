// import {API_URL} from '@env';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";


// 1. Verify the URL loaded correctly (Debugging)
// const API_URL = "https://api.stylefinder.tech";
// const API_URL = "http://localhost:8080";
const API_URL = "http://{Your-IP-Address}:8080"; // Use your machine's local IP address for Android emulator
console.log("Connecting to Backend at:", API_URL);

// 2. Create a global Axios instance
export const apiClient = axios.create({
    baseURL: API_URL || 'http://10.0.2.2:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000 // Stop trying if the backend takes longer than 10 seconds
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    //console.log("TOKEN BEING SENT:", token); 

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const describeApiError = (error) => {
  return {
    status: error?.response?.status || error?.status || null,
    message:
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error",
  };
};
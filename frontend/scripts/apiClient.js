import { API_URL } from '@env';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";


// 1. Verify the URL loaded correctly (Debugging)
// const API_URL = "https://api.stylefinder.tech";

// If using web 
// const API_URL = "http://localhost:8080";

// If Expo Go, and to get IP address in terminal, run `ipconfig getifaddr en0` for Mac or `ipconfig` for Windows 
// const API_URL = "http://{IP_ADDRESS}:8080";

console.log("Connecting to Backend at:", API_URL);

// Create a global Axios instance
export const apiClient = axios.create({
    baseURL: API_URL || 'http://10.0.2.2:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 20000 // Stop trying if the backend takes longer than 10 seconds
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    //only attach token for protected routes
    const isPublicRoute =
      config.url.includes("/login") ||
      config.url.includes("/register") ||
      config.url.includes("/check-username") ||
      config.url.includes("/reset-password");

    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization; //remove bad header
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const describeApiError = (error) => {
   // Normalize axios/network/runtime errors into one shape for UI messaging.
    if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? null;
        const data = error.response?.data;

        const message =
            data?.message ||
            data?.error ||
            error.message ||
            'Request failed. Please try again.';

        return {
            status,
            message,
            data: data ?? null,
        };
    }

    return {
        status: null,
        message: error?.message || 'Unexpected error occurred.',
        data: null,
    };
};
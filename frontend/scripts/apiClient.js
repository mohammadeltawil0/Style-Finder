// import {API_URL} from '@env';
import axios from 'axios';

// 1. Verify the URL loaded correctly (Debugging)
// const API_URL = "https://api.stylefinder.tech";

// If using web 
// const API_URL = "http://localhost:8080";

// If Expo Go, and to get IP address in terminal, run `ipconfig getifaddr en0` for Mac or `ipconfig` for Windows 
const API_URL = "http://192.168.68.106:8080";

console.log("Connecting to Backend at:", API_URL);

// Create a global Axios instance
export const apiClient = axios.create({
    baseURL: API_URL || 'http://10.0.2.2:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000 // Stop trying if the backend takes longer than 10 seconds
});

export function describeApiError(error) {
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
}
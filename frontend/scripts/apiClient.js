// import {API_URL} from '@env';
import axios from 'axios';

// 1. Verify the URL loaded correctly (Debugging)
// const API_URL = "https://api.stylefinder.tech";
const API_URL = "http://localhost:8080";
// const API_URL = "http://{localIP}:8080"; // Use your machine's local IP address for Android emulator
console.log("Connecting to Backend at:", API_URL);

// 2. Create a global Axios instance
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
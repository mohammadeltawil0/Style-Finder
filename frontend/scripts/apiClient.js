// import {API_URL} from '@env';
import axios from 'axios';

// Verify the URL loaded correctly (Debugging)
// const API_URL = "https://api.stylefinder.tech";
const API_URL = "http://localhost:8080";

console.log("Connecting to Backend at:", API_URL);

// Create a global Axios instance
export const apiClient = axios.create({
    baseURL: API_URL || 'http://10.0.2.2:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000 // Stop trying if the backend takes longer than 10 seconds
});
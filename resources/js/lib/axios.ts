import axios from 'axios';

// Create axios instance with default configuration
const instance = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Include cookies in requests
});

// Request interceptor to add CSRF token
instance.interceptors.request.use(
    (config) => {
        // Get CSRF token from meta tag
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            config.headers['X-CSRF-TOKEN'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle authentication errors
        if (error.response?.status === 401) {
            // Redirect to login page
            window.location.href = '/login';
        }
        
        // Handle forbidden errors
        if (error.response?.status === 403) {
            // Redirect to unauthorized page
            window.location.href = '/unauthorized';
        }
        
        return Promise.reject(error);
    }
);

export default instance; 
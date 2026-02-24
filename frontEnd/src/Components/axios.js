import axios from 'axios';

// Create an axios instance with a base URL from environment variables.
// Vercel will use the environment variable you set in the project settings.
// For local development, you can create a .env.local file in your `frontEnd` directory with:
// VITE_API_BASE_URL=http://localhost:8000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // This is important for sending cookies (like auth tokens) with each request
});

export default api;
// This file helps us communicate with the backend server
// Think of it as a messenger between frontend and backend

import axios from 'axios'
import { getAuthToken, clearAuth } from './auth'

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api


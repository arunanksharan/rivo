import axios from 'axios';
import { API_CONFIG } from '@/config';
import { logger } from '@/utils/logger';

// Create axios instance with base URL
export const apiClient = axios.create({
  baseURL: API_CONFIG.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error) => {
    logger.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    logger.debug(`API Response: ${response.status} ${response.config.url}`, {
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error(`API Error ${error.response.status}:`, {
        url: error.config.url,
        data: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      logger.error('API No Response Error:', {
        url: error.config.url,
        request: error.request,
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      logger.error('API Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

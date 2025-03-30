import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Base URL from the specification
const BASE_URL = 'https://qdos-api.liquidiser.co.uk/api';

// Create an Axios instance with default configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Get API key from environment variables
const API_KEY = process.env.QDOS_API_KEY || '';

// Request interceptor to add API key to all requests
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (config.headers) {
      config.headers['x-api-key'] = API_KEY;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      console.error('API Error Status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response Error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Define API client methods
const apiClient = {
  /**
   * Perform a GET request
   * @param url - API endpoint
   * @param params - Query parameters
   * @param config - Additional Axios configuration
   */
  get: async <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.get<T>(url, { ...config, params });
    return response.data;
  },

  /**
   * Perform a POST request
   * @param url - API endpoint
   * @param data - Request body
   * @param config - Additional Axios configuration
   */
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  },

  /**
   * Perform a PUT request
   * @param url - API endpoint
   * @param data - Request body
   * @param config - Additional Axios configuration
   */
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  },

  /**
   * Perform a DELETE request
   * @param url - API endpoint
   * @param config - Additional Axios configuration
   */
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  },
};

export default apiClient;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { BASE_URL } from "@/constants/URLS";
import { Api } from "./Api";

// Token getter function that can be updated by auth context
let getToken: () => string | null = () => localStorage.getItem("auth_token");

// Function to update the token getter (called by auth context)
export const setTokenGetter = (getter: () => string | null) => {
  getToken = getter;
};

const http = new Api();
http.instance.defaults.baseURL = BASE_URL;

// Request interceptor to add auth token
http.instance.interceptors.request.use(async (config: any) => {
  const token = getToken();

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor to handle authentication errors
http.instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and it's not a login/register request, try to refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/signup") &&
      !originalRequest.url?.includes("/auth/google") &&
      !originalRequest.url?.includes("/auth/facebook")
    ) {
      originalRequest._retry = true;

      try {
        // Check if we have a refresh token endpoint
        // For now, we'll trigger a logout via a custom event
        // In production, you'd call: await http.auth.authControllerRefreshToken()
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
        return Promise.reject(error);
      } catch (refreshError) {
        // If refresh fails, trigger logout
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default http;

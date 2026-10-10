import axios from "axios";

const Api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

Api.interceptors.request.use(
  (config) => {
    const isAuthEndpoint = config.url && (config.url.includes("/api/auth/login") || config.url.includes("/api/auth/register"));
    if (!isAuthEndpoint) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default Api;

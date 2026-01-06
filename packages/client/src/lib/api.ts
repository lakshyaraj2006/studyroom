import axios, { type AxiosRequestConfig } from "axios";

const config: AxiosRequestConfig = {
    baseURL: import.meta.env.VITE_API_BASE_URL
}

const axiosInstance = axios.create(config);
export default axiosInstance;
import axios, { type AxiosRequestConfig } from "axios";

const config: AxiosRequestConfig = {
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true
}

const axiosInstance = axios.create(config);
export const axiosPrivateInstance = axios.create({ ...config, withCredentials: true });

export default axiosInstance;
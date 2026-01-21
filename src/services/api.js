import axios from "axios";
import { useAuthStore } from "@/store/auth";

const api = axios.create({
    baseURL: "https://saleapi.tmqcreator.top",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token; // ✅ ĐÚNG

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;

import axios from "axios";
import { useAuthStore } from "@/store/auth";

export function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

export async function isTokenValid() {
    const { token, setAuth, clearAuth } = useAuthStore.getState();

    if (!token) {
        clearAuth();
        return false;
    }

    try {
        const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BE}/auth/me`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        setAuth(res.data, token);
        return true;

    } catch {
        clearAuth();
        return false;
    }
}

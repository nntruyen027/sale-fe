import {useAuthStore} from "@/store/auth";
import api from "@/services/api";

/* ================= LOGIN ================= */

export async function login(username, password) {
    try {
        // 1️⃣ Login
        const res = await api.post("/auth/login", { username, password });
        const token = res.data?.token;

        if (!token) {
            throw new Error("Không nhận được token!");
        }

        // 2️⃣ set token vào store TRƯỚC
        useAuthStore.getState().setAuth({
            token,
            user: null,
        });

        // 3️⃣ gọi /auth/me (lúc này interceptor đã có token)
        const resMe = await api.get("/auth/me");
        const user = resMe.data;

        // 4️⃣ cập nhật lại store
        useAuthStore.getState().setAuth({
            token,
            user,
        });

        // 5️⃣ lưu localStorage để reload
        if (typeof window !== "undefined") {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
        }

        return { token, user };

    } catch (e) {
        // clear nếu login lỗi
        useAuthStore.getState().clearAuth();

        throw new Error(
            e?.response?.data?.message || "Sai tài khoản hoặc mật khẩu"
        );
    }
}

/* ================= GET ME ================= */

export async function getMe() {
    const res = await api.get("/auth/me");
    return res.data;
}

/* ================= ĐỊA CHỈ ================= */

export async function getTinh(search, page = 1, limit = 10) {
    const res = await api.get("/auth/tinh", {
        params: {search, page, limit},
    });
    return {
        dsTinh: res.data.data,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
    };
}

export async function getXa(search, tinhId, page = 1, limit = 10) {
    const res = await api.get(`/auth/tinh/${tinhId}/xa`, {
        params: {search, page, limit},
    });
    return {
        dsXa: res.data.data,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
    };
}

/* ================= ĐĂNG KÝ ================= */

export async function dangKyGiaoVien(body) {
    const res = await api.post("/auth/dang-ky-giao-vien", body);
    return res.data;
}

export async function capNhatThongTinQuanTri(body) {
    const res = await api.put("/quan-tri", body);
    return res.data;
}


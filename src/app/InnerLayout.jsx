"use client";

import {useEffect, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useAuthStore} from "@/store/auth";
import {getMe} from "@/services/auth";


export default function InnerLayout({children}) {
    const router = useRouter();
    const pathname = usePathname();

    const {user, setAuth, clearAuth} = useAuthStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            // 🔥 không check auth ở trang login
            if (!pathname.startsWith("/")) {
                setLoading(false);
                return;
            }

            const token = localStorage.getItem("jwtToken");
            const userLocal = localStorage.getItem("userInfo");

            // ❌ chưa login
            if (!token || !userLocal) {
                clearAuth();
                if (pathname.startsWith("/quan-tri-vien"))
                    router.replace("/quan-tri-vien/login");
                else
                    router.replace("/");
                setLoading(false);
                return;
            }

            if (!user) {
                try {
                    // optional: gọi lại /me để đảm bảo user mới nhất
                    const me = await getMe();

                    setAuth({
                        token,
                        user: me,
                    });
                } catch (e) {
                    clearAuth();
                    if (pathname.startsWith("/quan-tri-vien"))
                        router.replace("/quan-tri-vien/login");
                    else
                        router.replace("/");
                }
            }

            setLoading(false);
        };

        initAuth();
    }, []); // ⛔ CHỈ CHẠY 1 LẦN

    if (loading) return null;

    return <>{children}</>;
}

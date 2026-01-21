"use client";

import { Form, Input, Button, App } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useState } from "react";
import { login } from "@/services/auth";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";

export default function Login() {
    const [form] = Form.useForm();
    const { message } = App.useApp();
    const { setAuth } = useAuthStore();
    const router = useRouter(); // ✅ hook đặt đúng chỗ
    const [loading, setLoading] = useState(false);

    const onLogin = async ({ username, password }) => {
        setLoading(true);

        try {
            const result = await login(username, password);

            // ✅ LƯU ĐÚNG KEY (đồng bộ toàn app)
            localStorage.setItem("jwtToken", result.token);
            localStorage.setItem("userInfo", JSON.stringify(result.user));

            // ✅ set vào zustand store
            setAuth({
                token: result.token,
                user: result.user,
            });

            message.success("Đăng nhập thành công");

            // ✅ redirect SAU khi setAuth xong
            router.replace("/quan-tri-vien/dashboard");

        } catch (err) {
            message.error(err?.message || "Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="
                w-screen h-screen
                flex items-center justify-center
                bg-[url('https://www.pixground.com/wallpapers/bright-colorful-gradient-waves-4k-wallpaper/?download-img=4k')]
                bg-cover bg-center bg-no-repeat
            "
        >
            <div
                className="
                    w-[380px]
                    rounded-2xl
                    bg-white/10
                    backdrop-blur-xl
                    border border-white/20
                    shadow-2xl
                    p-8
                    text-white
                "
            >
                <h1 className="text-3xl font-semibold text-center mb-6">
                    HỆ THỐNG QUẢN LÝ BÁN HÀNG
                </h1>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onLogin}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Username"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            className="
                                uppercase
                                w-full
                                rounded-full
                                bg-white text-purple-700
                                font-semibold
                            "
                        >
                            ĐĂNG NHẬP
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

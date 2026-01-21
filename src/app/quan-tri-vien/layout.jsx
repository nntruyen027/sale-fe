"use client";

import {
    Avatar,
    Button,
    Dropdown,
    Layout,
    Menu,
    theme,
    Typography,
} from "antd";

import {
    BarChartOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SafetyOutlined,
    SettingOutlined,
    TableOutlined,
    UsergroupAddOutlined,
    UserOutlined,
} from "@ant-design/icons";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useModal } from "@/store/modal";
import { useAuthStore } from "@/store/auth";
import { usePermission } from "@/hook/usePermission";

const { Sider, Header, Content } = Layout;

/* ================= MENU CONFIG ================= */

const menuConfig = [
    {
        key: "/quan-tri-vien/dashboard",
        label: "Dashboard",
        icon: <BarChartOutlined />,
        permissions: [], // PUBLIC
    },
    {
        key: "quan-ly",
        label: "Người dùng",
        icon: <UsergroupAddOutlined />,
        children: [
            {
                key: "/quan-tri-vien/nguoi-dung",
                label: "Tài khoản",
                permissions: ['user:read', 'user:create', 'user:update', 'user:delete'],
            },
            {
                key: "/quan-tri-vien/vai-tro",
                label: "Vai trò",
                permissions: ['role:read', 'role:create', 'role:update', 'role:delete'],
            },
        ],
    },
    {
        key: "danh-muc",
        label: "Danh mục",
        icon: <TableOutlined />,
        children: [
            {
                key: "/quan-tri-vien/tinh",
                label: "Tỉnh / Thành phố",
                permissions: ["tinh:read", "tinh:update", "tinh:delete", 'tinh:create'],
            },
            {
                key: "/quan-tri-vien/xa",
                label: "Xã / Phường",
                permissions: ["xa:read", "xa:update", "xa:delete", 'xa:create'],
            },
        ],
    },
    {
        key: "he-thong",
        label: "Hệ thống",
        icon: <SettingOutlined />,
        children: [
            {
                key: "/quan-tri-vien/tham-so",
                label: "Tham số",
                permissions: ["param:read", "param:update", "param:delete", 'param:create'],
            },
        ],
    },
];

/* ================= UTILS ================= */

// gom permission từ children
const collectPermissionsFromChildren = (children = []) => {
    const set = new Set();

    const walk = (items) => {
        items.forEach(i => {
            if (Array.isArray(i.permissions)) {
                i.permissions.forEach(p => set.add(p));
            }
            if (i.children) walk(i.children);
        });
    };

    walk(children);
    return Array.from(set);
};

// chuẩn hoá menu (parent tự có permission)
const normalizeMenu = (menus) =>
    menus.map(m => {
        if (m.children?.length) {
            return {
                ...m,
                permissions: collectPermissionsFromChildren(m.children),
                children: normalizeMenu(m.children),
            };
        }
        return m;
    });

/* ================= COMPONENT ================= */

export default function RootLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const [checked, setChecked] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const { SetIsUpdatePassOpen, setIsEditOpen } = useModal();
    const { user, clearAuth } = useAuthStore();
    const { hasAnyPermission } = usePermission();

    /* ================= MENU SAU KHI CHUẨN HOÁ ================= */

    const normalizedMenu = useMemo(
        () => normalizeMenu(menuConfig),
        []
    );

    const menuItems = useMemo(() => {
        const filterMenu = (menus) =>
            menus
                .filter(
                    m =>
                        !m.permissions ||
                        m.permissions.length === 0 ||
                        hasAnyPermission(m.permissions)
                )
                .map(m => ({
                    ...m,
                    children: m.children ? filterMenu(m.children) : undefined,
                }));

        return filterMenu(normalizedMenu);
    }, [user]);

    /* ================= CHECK URL PERMISSION ================= */

    useEffect(() => {
        if (!user) return;

        const allRoutes = [];
        const collectRoutes = (menus) => {
            menus.forEach(m => {
                if (m.key?.startsWith("/")) allRoutes.push(m);
                if (m.children) collectRoutes(m.children);
            });
        };

        collectRoutes(normalizedMenu);

        const matched = allRoutes.find(r => pathname.startsWith(r.key));

        // PUBLIC → cho qua
        if (!matched?.permissions || matched.permissions.length === 0) {
            setChecked(true);
            return;
        }

        // Không đủ quyền → chặn
        if (!hasAnyPermission(matched.permissions)) {
            clearAuth();
            router.replace("/login"); // hoặc /403
            return;
        }

        setChecked(true);
    }, [user, pathname]);

    if (!checked) return null;

    /* ================= HANDLERS ================= */

    const handleLogout = () => {
        clearAuth();
        router.replace("/login");
    };

    const userMenuItems = [
        {
            key: "profile",
            label: "Thông tin tài khoản",
            icon: <UserOutlined />,
            onClick: setIsEditOpen,
        },
        {
            key: "password",
            label: "Đổi mật khẩu",
            icon: <SafetyOutlined />,
            onClick: SetIsUpdatePassOpen,
        },
        {
            key: "logout",
            label: "Đăng xuất",
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    /* ================= RENDER ================= */

    return (
        <Layout>
            <Sider
                width={250}
                collapsible
                collapsed={collapsed}
                trigger={null}
                style={{
                    height: "100vh",
                    background: "white",
                    overflowY: "auto",
                }}
            >
                {!collapsed && (
                    <div className="font-['Times_New_Roman'] text-lg text-center p-2 text-white bg-[#1677ff]">
                        THƯƠNG MẠI ĐIỆN TỬ
                    </div>
                )}

                <Menu
                    mode="inline"
                    items={menuItems}
                    onClick={({ key }) =>
                        key.startsWith("/") && router.push(key)
                    }
                />
            </Sider>

            <Layout>
                <Header
                    className="flex justify-between items-center"
                    style={{ background: colorBgContainer, paddingLeft: 10 }}
                >
                    <Button
                        type="text"
                        icon={
                            collapsed ? (
                                <MenuUnfoldOutlined />
                            ) : (
                                <MenuFoldOutlined />
                            )
                        }
                        onClick={() => setCollapsed(!collapsed)}
                    />

                    <Dropdown
                        menu={{ items: userMenuItems }}
                        placement="bottomRight"
                    >
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Avatar
                                src={user?.avatar}
                                icon={<UserOutlined />}
                            />
                            <Typography.Text className="font-medium">
                                {user?.hoTen || "Người dùng"}
                            </Typography.Text>
                        </div>
                    </Dropdown>
                </Header>

                <Content
                    style={{
                        margin: "24px 16px",
                        padding: 24,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}

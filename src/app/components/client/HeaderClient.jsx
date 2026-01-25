'use client';

import {Button, Drawer, Dropdown, Grid, Input, Layout, theme} from "antd";
import {MenuOutlined, SearchOutlined} from "@ant-design/icons";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect, useState} from "react";

const {useBreakpoint} = Grid;

const menuItem = [
    {key: 'trang-chu', label: 'Trang chủ', url: '/'},
    {
        key: 've-chung-toi',
        label: 'Về chúng tôi',
        url: '/ve-chung-toi',
        children: [
            {key: 'cong-ty', label: 'Công ty', url: '/ve-chung-toi/cong-ty'},
            {key: 'san-pham', label: 'Sản phẩm', url: '/ve-chung-toi/san-pham'},
        ],
    },
    {key: 'san-pham', label: 'Sản phẩm', url: '/san-pham'},
    {key: 'tin-tuc', label: 'Tin tức', url: '/tin-tuc'},
    {
        key: 'media',
        label: 'Đa phương tiện',
        url: '/da-phuong-tien',
        children: [
            {key: 'bo-suu-tap', label: 'Bộ sưu tập', url: '/bo-suu-tap'},
            {key: 'catalogue', label: 'Catalogue', url: '/catalogue'},
        ]
    },
];

export default function HeaderClient() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [searchHover, setSearchHover] = useState(false);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const {
        token: {colorBgContainer, colorPrimary},
    } = theme.useToken();

    useEffect(() => {
        if (!isMobile) setOpen(false);
    }, [isMobile]);

    const isActive = (url) =>
        pathname === url || pathname.startsWith(url + '/');

    const isParentActive = (item) =>
        item.url && isActive(item.url) ||
        item.children?.some(c => isActive(c.url));

    /** ========== DESKTOP MENU ========== */
    const renderDesktopMenu = () =>
        menuItem.map(item => {
            const active = isParentActive(item);

            const buttonStyle = {
                position: 'relative',
                height: 64,
                lineHeight: '64px',
                display: 'inline-flex',
                alignItems: 'center',
                color: active ? colorPrimary : undefined,
                fontWeight: active ? 700 : 600,
            };

            const underlineStyle = {
                position: 'absolute',
                left: 0,
                bottom: 0,
                height: 2,
                width: active ? '100%' : 0,
                backgroundColor: colorPrimary,
                transition: 'width 0.3s ease',
            };

            if (item.children?.length) {
                return (
                    <Dropdown
                        key={item.key}
                        arrow
                        menu={{
                            items: item.children.map(c => ({
                                key: c.key,
                                label: (
                                    <Link
                                        href={c.url}
                                        style={{
                                            color: isActive(c.url) ? colorPrimary : undefined,
                                            fontWeight: isActive(c.url) ? 600 : 400,
                                        }}
                                    >
                                        {c.label}
                                    </Link>
                                ),
                            })),
                        }}
                    >
                        <Button type="text" style={buttonStyle}>
                            {item.label}
                            <span style={underlineStyle}/>
                        </Button>
                    </Dropdown>
                );
            }

            return (
                <Link key={item.key} href={item.url}>
                    <Button type="text" style={buttonStyle}>
                        {item.label}
                        <span style={underlineStyle}/>
                    </Button>
                </Link>
            );
        });

    return (
        <Layout.Header
            style={{
                height: 64,
                padding: '0 24px',
                background: colorBgContainer,
                boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
            }}
        >
            {/* WRAPPER */}
            <div
                style={{
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {/* LOGO – LEFT */}
                <div style={{fontWeight: 700, zIndex: 1}}>
                    LOGO
                </div>

                {/* MENU – CENTER ABSOLUTE */}
                {screens.md && (
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: 12,
                        }}
                    >
                        {renderDesktopMenu()}
                    </div>
                )}
                {
                    screens.md && (
                        <div
                            onMouseEnter={() => setSearchHover(true)}
                            onMouseLeave={() => setSearchHover(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                height: 40,
                                padding: '0 8px',
                                borderRadius: 20,
                                background: searchHover ? '#f5f5f5' : 'transparent',
                                transition: 'background 0.3s ease',
                                cursor: 'pointer',
                            }}
                        >
                            {/* ICON */}
                            <SearchOutlined style={{fontSize: 18}}/>

                            {/* INPUT */}
                            <Input
                                placeholder="Tìm kiếm..."
                                bordered={false}
                                style={{
                                    width: searchHover ? 200 : 0,
                                    opacity: searchHover ? 1 : 0,
                                    marginLeft: searchHover ? 8 : 0,
                                    transition: 'all 0.3s ease',
                                    padding: searchHover ? '4px 8px' : 0,
                                    background: 'transparent',
                                }}
                            />
                        </div>
                    )
                }


                {/* MOBILE ICON – RIGHT */}
                {isMobile && (
                    <Button
                        type="text"
                        icon={<MenuOutlined/>}
                        onClick={() => setOpen(true)}
                    />
                )}
            </div>

            {/* MOBILE DRAWER */}
            {isMobile && (
                <Drawer
                    title="Menu"
                    placement="right"
                    open={open}
                    onClose={() => setOpen(false)}
                >
                    {menuItem.map(item => (
                        <div key={item.key} style={{marginBottom: 16}}>
                            <Link href={item.url ?? '#'} onClick={() => setOpen(false)}>
                                {item.label}
                            </Link>
                        </div>
                    ))}
                </Drawer>
            )}
        </Layout.Header>
    );
}

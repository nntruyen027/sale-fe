'use client';

import {Button, Drawer, Dropdown, Grid, Input, Layout, theme} from "antd";
import {MenuOutlined, SearchOutlined} from "@ant-design/icons";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import {layChungHeader} from '@/services/public';

const {useBreakpoint} = Grid;

export default function ChungHeader1View() {
    const pathname = usePathname();

    const [open, setOpen] = useState(false);
    const [searchHover, setSearchHover] = useState(false);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [menuItem, setMenuItems] = useState([]);
    const [stickyMode, setStickyMode] = useState('none'); // none | always | scroll-up

    const lastScrollY = useRef(0);
    const [visible, setVisible] = useState(true);

    const {
        token: {colorBgContainer, colorPrimary},
    } = theme.useToken();

    /* ========== MOBILE DRAWER AUTO CLOSE ========== */
    useEffect(() => {
        if (!isMobile) setOpen(false);
    }, [isMobile]);

    /* ========== FETCH HEADER CONFIG ========== */
    useEffect(() => {
        const fetchData = async () => {
            const data = await layChungHeader();
            setMenuItems(data?.menu || []);
            setStickyMode(data?.tickyMode || 'none');
        };
        fetchData();
    }, []);

    /* ========== RESET SCROLL STATE WHEN MODE CHANGE ========== */
    useEffect(() => {
        lastScrollY.current = window.scrollY;
        setVisible(true);
    }, [stickyMode]);

    /* ========== SCROLL-UP LOGIC ========== */
    useEffect(() => {
        if (stickyMode !== 'scroll-up') return;

        const onScroll = () => {
            const current = window.scrollY;

            if (current < 50) {
                setVisible(true);
            } else if (current < lastScrollY.current) {
                setVisible(true);   // scroll lên
            } else {
                setVisible(false);  // scroll xuống
            }

            lastScrollY.current = current;
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [stickyMode]);

    /* ========== ACTIVE MENU ========== */
    const isActive = (url) =>
        pathname === url || pathname.startsWith(url + '/');

    const isParentActive = (item) =>
        (item.url && isActive(item.url)) ||
        item.children?.some(c => isActive(c.url));

    /* ========== DESKTOP MENU RENDER ========== */
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

    /* ========== HEADER WRAPPER STYLE ========== */
    const headerWrapperStyle = {
        height: 64,
        zIndex: 2000,
        transition: 'transform 0.3s ease',
    };

    if (stickyMode === 'always' || stickyMode === 'scroll-up') {
        headerWrapperStyle.position = 'fixed';
        headerWrapperStyle.top = 0;
        headerWrapperStyle.left = 0;
        headerWrapperStyle.right = 0;
    }

    if (stickyMode === 'scroll-up' && !visible) {
        headerWrapperStyle.transform = 'translateY(-100%)';
    }

    const needSpacer = stickyMode !== 'none';

    return (
        <>
            {needSpacer && <div style={{height: 64}}/>}

            <div style={headerWrapperStyle}>
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

                        {/* MENU – CENTER */}
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

                        {/* SEARCH */}
                        {screens.md && (
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
                                <SearchOutlined style={{fontSize: 18}}/>
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
                        )}

                        {/* MOBILE MENU ICON */}
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
                                    <Link
                                        href={item.url ?? '#'}
                                        onClick={() => setOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                </div>
                            ))}
                        </Drawer>
                    )}
                </Layout.Header>
            </div>
        </>
    );
}

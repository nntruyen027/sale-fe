'use client';

import {useEffect, useState} from "react";
import {Button, Select, theme, Typography} from "antd";
import {layHomeSanPhamGoiY} from "@/services/public";
import {caiDatHomeSanPhamGoiY} from "@/services/quan-tri-vien/thong-tin-he-thong";
import useApp from "antd/es/app/useApp";
import {useInView} from "@/hook/useInView";
import {useSanPhamSelect} from "@/hook/useSanPham";
import Link from "next/link";

export function HomeSanPhamGoiY1({readOnly = true}) {
    const {token} = theme.useToken();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const {message} = useApp();


    /* ================= LOAD DATA ================= */
    useEffect(() => {
        (async () => {
            try {
                const res = await layHomeSanPhamGoiY();
                setData(res || null);
            } catch {
                setData(null);
            }
        })();
    }, []);

    /* ================= UPDATE ================= */
    const updateItem = (index, object) => {
        setData(prev => {
            const clone = [...prev];
            clone[index] = object ? {...object} : null;
            return clone;
        });
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await caiDatHomeSanPhamGoiY({data, 'template': 'mau-1'});
            message.success("Lưu sản phẩm thành công");
        } catch (e) {
            message.error(e.message || "Lưu thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="px-6 md:px-20p py-10" style={{background: token.colorPrimary}}>
            <Typography.Title style={{textAlign: 'center', marginBottom: '30px', color: 'white'}}>Gợi ý sản
                phẩm</Typography.Title>
            {/* GRID */}
            <div
                className="
                   grid
                    gap-10
                    justify-center
                    [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]
                    sm:[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]
                    lg:[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]
                "
            >
                {Array.from({length: 5}).map((_, index) => {
                    const item = data?.data?.[index];
                    return (
                        <ProductCard
                            key={index}
                            item={item}
                            index={index}
                            readOnly={readOnly}
                            updateItem={updateItem}
                        />
                    );
                })}
            </div>

            {/* SAVE */}
            {!readOnly && (
                <div className="mt-12 text-center">
                    <Button
                        type="primary"
                        size="large"
                        style={{
                            backgroundColor: token.colorPrimary,
                            color: 'white',
                        }}
                        loading={loading}
                        onClick={handleSave}
                    >
                        Lưu thay đổi
                    </Button>
                </div>
            )}
        </div>
    );
}

function ProductCard({item, index, readOnly, updateItem}) {
    const {ref, inView} = useInView({threshold: 0.25});
    const {
        dsSanPham,
        loading: sanPhamLoading,
        loadMore,
        setSearchSanPham
    } = useSanPhamSelect();

    return (
        <Link href={readOnly && item ? `/san-pham/${item?.id}` : "#"}>
            <div
                ref={ref}
                className={`
                    group
                    relative
                    w-full max-w-[320px] mx-auto
                    bg-white
                    rounded-2xl
                    overflow-hidden
                    transition-all
                    duration-700
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    ${
                    inView
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-6 scale-95"
                }
                    hover:-translate-y-4
                    hover:shadow-2xl
                `}
                style={{
                    transitionDelay: `${index * 120}ms`,
                }}
            >
                {/* SELECT (EDIT MODE) */}
                {!readOnly && (
                    <div className="p-3">
                        <Select
                            className="w-full"
                            value={item?.id}
                            showSearch
                            allowClear
                            placeholder="Chọn sản phẩm"
                            loading={sanPhamLoading}
                            filterOption={false}
                            options={dsSanPham.map(sp => ({
                                label: sp.ten,
                                value: sp.id,
                            }))}
                            onChange={(value) => {
                                if (!value) {
                                    updateItem(index, null);
                                } else {
                                    const sp = dsSanPham.find(sp => sp.id === value);
                                    updateItem(index, sp);
                                }
                            }}
                            onSearch={setSearchSanPham}
                            onPopupScroll={(e) => {
                                const target = e.target;
                                if (
                                    target.scrollTop + target.offsetHeight >=
                                    target.scrollHeight - 10
                                ) {
                                    loadMore();
                                }
                            }}
                        />
                    </div>
                )}

                {/* IMAGE */}
                <div className="relative h-[300px] overflow-hidden">
                    <img
                        src={
                            item?.hinhAnh ||
                            "https://ito-group.com/wp-content/uploads/2025/04/no-image.jpg"
                        }
                        alt={item?.ten}
                        className="
                            w-full h-full object-cover
                            transition-transform
                            duration-700
                            ease-out
                            group-hover:scale-110
                        "
                    />

                    {/* Overlay gradient khi hover */}
                    <div
                        className="
                            absolute inset-0
                            bg-gradient-to-t
                            from-black/30
                            via-black/10
                            to-transparent
                            opacity-0
                            group-hover:opacity-100
                            transition-opacity
                            duration-500
                        "
                    />
                </div>

                {/* CONTENT */}
                <div className="p-4 text-left">
                    <span className="text-sm text-gray-500 block mb-1">
                        {item?.loai?.ten || "Loại sản phẩm"}
                    </span>

                    <Typography.Title
                        level={4}
                        className="!mb-1"
                    >
                        {item?.ten || "Tên sản phẩm"}
                    </Typography.Title>

                    <Typography.Text style={{
                        fontSize: '18px',
                        lineHeight: 'calc(1.75 / 1.125)',
                        fontWeight: '600',
                        color: 'oklch(66.6% 0.179 58.318)'
                    }}>
                        {(item?.gia || 0).toLocaleString("vi-VN")} ₫
                    </Typography.Text>
                </div>
            </div>
        </Link>
    );
}

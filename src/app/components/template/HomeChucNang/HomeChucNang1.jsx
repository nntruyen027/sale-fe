'use client';

import {useEffect, useState} from "react";
import {Button, Input, theme, Typography} from "antd";
import FileUploadUrl from "@/app/components/common/FileUploadUrl";
import {layHomeChucNang} from "@/services/public";
import {caiDatHomeChucNang} from "@/services/quan-tri-vien/thong-tin-he-thong";
import useApp from "antd/es/app/useApp";
import {useInView} from "@/hook/useInView";


export function HomeChucNang1({readOnly = true}) {
    const {token} = theme.useToken();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const {message} = useApp();

    /* ================= LOAD DATA ================= */
    useEffect(() => {
        (async () => {
            try {
                const res = await layHomeChucNang();
                setData(res);
            } catch {
                setData(null);
            }
        })();
    }, []);

    /* ================= UPDATE ================= */
    const updateItem = (index, key, value) => {
        const clone = [...data];
        clone[index][key] = value;
        setData(clone);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await caiDatHomeChucNang({data, 'template': 'mau-1'});
            message.success("Lưu chức năng thành công");
        } catch (e) {
            message.error(e.message || "Lưu thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="py-16 px-6 md:px-20"
            style={{background: token.colorPrimary}}
        >
            {/* GRID */}
            <div
                className="
                   grid
                    gap-10
                    justify-center
                    [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]
                    sm:[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]
                    lg:[grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]
                "
            >
                {data?.data?.map((item, index) => (
                    <FeatureCard
                        key={index}
                        item={item}
                        index={index}
                        readOnly={readOnly}
                        updateItem={updateItem}
                    />
                ))}
            </div>

            {/* SAVE */}
            {!readOnly && (
                <div className="mt-12 text-center">
                    <Button
                        type="primary"
                        size="large"
                        style={{
                            backgroundColor: 'white',
                            color: token.colorPrimary,
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

function FeatureCard({item, index, readOnly, updateItem}) {
    const {ref, inView} = useInView({threshold: 0.2});

    return (
        <div
            ref={ref}
            className={`
                w-full max-w-[320px] mx-auto
                text-center
                rounded-2xl
                p-6
                transition-all
                duration-700
                ease-out
                ${inView
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95"}
            `}
            style={{
                transitionDelay: `${index * 120}ms`,
            }}
        >
            {/* IMAGE */}
            <div className="mb-4 flex justify-center">
                {readOnly ? (
                    <img
                        src={item?.hinhAnh}
                        alt={item?.tieuDe}
                        className="w-20 h-20 object-cover rounded-full"
                    />
                ) : (
                    <FileUploadUrl
                        value={item?.hinhAnh}
                        accept="image/*"
                        allowPreview
                        onChange={url =>
                            updateItem(index, "hinhAnh", url)
                        }
                    />
                )}
            </div>

            {/* TITLE */}
            {readOnly ? (
                <Typography.Title level={3} style={{color: "white"}}>
                    {item?.tieuDe}
                </Typography.Title>
            ) : (
                <Input
                    value={item?.tieuDe}
                    onChange={e =>
                        updateItem(index, "tieuDe", e.target.value)
                    }
                    placeholder="Tiêu đề"
                />
            )}

            {/* CONTENT */}
            <div className="mt-2">
                {readOnly ? (
                    <Typography.Paragraph style={{color: "white"}}>
                        {item?.noiDung}
                    </Typography.Paragraph>
                ) : (
                    <Input.TextArea
                        rows={3}
                        value={item?.noiDung}
                        onChange={e =>
                            updateItem(index, "noiDung", e.target.value)
                        }
                        placeholder="Nội dung"
                    />
                )}
            </div>
        </div>
    );
}

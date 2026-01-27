'use client';

import {useEffect, useState} from "react";
import {Button, Input, message, theme, Typography} from "antd";
import Link from "next/link";
import {caiDatHomeAboutMe} from "@/services/quan-tri-vien/thong-tin-he-thong";
import {layHomeAboutMe} from '@/services/public';
import {useInView} from "@/hook/useInView";
import FileUploadUrl from "@/app/components/common/FileUploadUrl";


const defaultData = {
    titleSmall: "Về chúng tôi",
    titleMain1: "Cùng chúng tôi",
    titleMain2: "Trải nghiệm thú vị về Sudes Camping",
    description:
        "Chào mừng đến với Sudes Camping – Khơi nguồn trải nghiệm thiên nhiên đích thực! Chúng tôi cung cấp đầy đủ thiết bị cắm trại chất lượng cao.",
    highlight:
        "Từ lều, túi ngủ, bếp gas dã ngoại đến combo thuê trọn gói tiện lợi cho mọi hành trình.",
    buttonText: "Liên hệ",
    buttonLink: "/lien-he",
    images: {
        main: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        sub: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    },
};

export default function HomeAboutMe1({readOnly = true}) {
    const {token} = theme.useToken();
    const [data, setData] = useState(defaultData);
    const [loading, setLoading] = useState(false);


    /* =======================
       IN VIEW
    ======================= */
    const titleView = useInView();
    const leftView = useInView();
    const featureView = useInView();
    const imageView = useInView();
    const mainImageView = useInView({threshold: 0.25});
    const subImageView = useInView({threshold: 0.25});


    /* =======================
       LOAD DATA
    ======================= */
    useEffect(() => {
        (async () => {
            try {
                const res = await layHomeAboutMe();
                setData(res || defaultData);
            } catch (e) {
                message.error(e.message || "Không tải được dữ liệu");
            }
        })();
    }, []);

    const update = (key, value) => {
        setData(prev => ({...prev, [key]: value}));
    };

    const updateFeature = (index, field, value) => {
        const features = [...data.features];
        features[index][field] = value;
        setData({...data, features});
    };

    const updateImage = (key, url) => {
        setData(prev => ({
            ...prev,
            images: {...prev.images, [key]: url},
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await caiDatHomeAboutMe({...data, 'template': 'mau-1'});
            message.success("Lưu nội dung thành công");
        } catch (e) {
            message.error(e.message || "Lưu thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-6 md:px-40 pb-16 overflow-hidden">

            {/* TITLE SMALL */}
            <div
                ref={titleView.ref}
                className={`
                    transition-all duration-700 ease-out
                    ${titleView.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
                `}
            >
                <Typography.Title
                    style={{color: token.colorPrimary, textAlign: "center"}}
                >
                    {readOnly ? data.titleSmall : (
                        <Input
                            value={data.titleSmall}
                            onChange={e => update("titleSmall", e.target.value)}
                        />
                    )}
                </Typography.Title>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 mt-12 gap-14 items-center">

                {/* LEFT */}
                <div
                    ref={leftView.ref}
                    className={`
                        transition-all duration-700 delay-150 ease-out
                        ${leftView.inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}
                    `}
                >
                    {readOnly ? (
                        <>
                            <Typography.Title level={3} style={{
                                fontSize: 32,
                                color: token.colorPrimary,
                                margin: 0,
                            }}>
                                {data.titleMain1}
                            </Typography.Title>

                            <Typography.Title level={3} style={{
                                textTransform: "uppercase",
                                fontWeight: "bolder",
                                fontSize: 40,
                                margin: 0,
                            }}>
                                {data.titleMain2}
                            </Typography.Title>
                        </>
                    ) : (
                        <>
                            <Input
                                value={data.titleMain1}
                                onChange={e => update("titleMain1", e.target.value)}
                                placeholder="Tiêu đề dòng 1"
                            />
                            <Input
                                className="mt-2"
                                value={data.titleMain2}
                                onChange={e => update("titleMain2", e.target.value)}
                                placeholder="Tiêu đề chính"
                            />
                        </>
                    )}

                    {/* DESCRIPTION */}
                    <div className="mt-4">
                        {readOnly ? (
                            <Typography.Paragraph>{data.description}</Typography.Paragraph>
                        ) : (
                            <Input.TextArea
                                rows={3}
                                value={data.description}
                                onChange={e => update("description", e.target.value)}
                            />
                        )}
                    </div>

                    {/* HIGHLIGHT */}
                    <Typography.Paragraph
                        style={{background: "#FCF4E6", padding: 16, borderRadius: 16}}
                    >
                        {readOnly ? data.highlight : (
                            <Input.TextArea
                                rows={2}
                                value={data.highlight}
                                onChange={e => update("highlight", e.target.value)}
                            />
                        )}
                    </Typography.Paragraph>


                    {/* BUTTON */}
                    <div className="mt-8">
                        {readOnly ? (
                            <Link href={data.buttonLink}>
                                <Button
                                    size="large"
                                    style={{
                                        background: token.colorPrimary,
                                        color: "#fff",
                                        padding: "12px 40px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {data.buttonText}
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Input
                                    value={data.buttonText}
                                    onChange={e => update("buttonText", e.target.value)}
                                    placeholder="Text button"
                                />
                                <Input
                                    className="mt-2"
                                    value={data.buttonLink}
                                    onChange={e => update("buttonLink", e.target.value)}
                                    placeholder="Link button"
                                />
                            </>
                        )}
                    </div>
                    {/* SAVE */}
                    {!readOnly && (
                        <div className="mt-10">
                            <Button
                                type="primary"
                                loading={loading}
                                onClick={handleSave}
                            >
                                Lưu thay đổi
                            </Button>
                        </div>
                    )}
                </div>

                {/* RIGHT – IMAGES */}
                <div className="relative flex justify-center">

                    {/* MAIN IMAGE */}
                    <div
                        ref={mainImageView.ref}
                        className={`
            relative w-full aspect-square overflow-hidden rounded-3xl
            transition-all duration-700 ease-out
            ${mainImageView.inView
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-95 translate-y-6'
                        }
        `}
                    >
                        <img
                            src={data?.images?.main}
                            className="w-full h-full object-cover"
                        />

                        {!readOnly && (
                            <div className="absolute bottom-4 left-4 bg-white p-2 rounded-xl shadow">
                                <FileUploadUrl
                                    allowPreview={false}
                                    value={data?.images?.main}
                                    accept="image/*"
                                    onChange={url => updateImage("main", url)}
                                />
                            </div>
                        )}
                    </div>

                    {/* SUB IMAGE */}
                    <div
                        ref={subImageView.ref}
                        className={`
            absolute bottom-[-40px] right-[-20px]
            w-[55%] aspect-square overflow-hidden
            rounded-2xl shadow-xl bg-white p-3
            transition-all duration-700 ease-out delay-150
            ${subImageView.inView
                            ? 'opacity-100 translate-y-0 rotate-12 scale-100'
                            : 'opacity-0 translate-y-8 rotate-0 scale-90'
                        }
        `}
                    >
                        <img
                            src={data?.images?.sub}
                            className="w-full h-full object-cover rounded-2xl"
                        />

                        {!readOnly && (
                            <div className="absolute bottom-2 left-2 bg-white p-1 rounded shadow">
                                <FileUploadUrl
                                    allowPreview={false}
                                    value={data?.images?.sub}
                                    accept="image/*"
                                    onChange={url => updateImage("sub", url)}
                                />
                            </div>
                        )}
                    </div>
                </div>


            </div>
        </div>
    );
}

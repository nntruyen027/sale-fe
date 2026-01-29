'use client';

import {useEffect, useState} from "react";
import {Carousel, Spin} from "antd";
import Link from "next/link";
import {layGiaTriThamSo, layHomeBanner} from "@/services/public";
import {toBoolean} from "@/utils/parse";

const HEADER_HEIGHT = 64;

export default function HomeBanner() {
    const [isCarousel, setIsCarousel] = useState(false);
    const [loading, setLoading] = useState(true);
    const [bannerData, setBannerData] = useState([]);
    const [defaultBanner, setDefaultBanner] = useState(null);

    // 1️⃣ Load config + banner
    useEffect(() => {
        const init = async () => {
            try {
                const config = await layGiaTriThamSo('bannerHome');
                setIsCarousel(toBoolean(config));

                const banners = await layHomeBanner();
                setBannerData(banners || []);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    // 2️⃣ Xử lý default banner khi KHÔNG carousel
    useEffect(() => {
        if (!isCarousel && bannerData.length > 0) {
            setDefaultBanner(
                bannerData.find(b => b.laMacDinh) || null
            );
        } else {
            setDefaultBanner(null); // 🔥 reset state cũ
        }
    }, [isCarousel, bannerData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center"
                 style={{height: `calc(100vh - ${HEADER_HEIGHT}px)`}}>
                <Spin size="large"/>
            </div>
        );
    }

    if (isCarousel) {
        return (
            <Carousel autoplay>
                {bannerData
                    .filter(b => b.url && b.hinhAnh)
                    .map(item => (
                        <Link key={item.id} href={item.url}>
                            <div
                                style={{
                                    height: `calc(100vh - ${HEADER_HEIGHT}px)`,
                                    backgroundImage: `url(${item.hinhAnh})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            />
                        </Link>
                    ))}
            </Carousel>
        );
    }

    if (!defaultBanner) return null;

    return (
        <Link href={defaultBanner.url}>
            <div
                style={{
                    height: `calc(100vh - ${HEADER_HEIGHT}px)`,
                    backgroundImage: `url(${defaultBanner.hinhAnh})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
        </Link>
    );
}

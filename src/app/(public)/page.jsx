'use client'


import HomeBanner from "@/app/(public)/components/HomeBanner";
import LoaiSanPham from "@/app/(public)/components/LoaiSanPham";
import TinTuc from "@/app/(public)/components/TinTuc";

export default function HomaPage() {
    return (
        <div className={'p-0'}>
            <HomeBanner/>
            <LoaiSanPham/>
            <TinTuc/>
        </div>
    )
}
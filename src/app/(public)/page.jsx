'use client'


import HomeBanner from "@/app/(public)/components/HomeBanner";
import LoaiSanPham from "@/app/(public)/components/LoaiSanPham";
import TinTuc from "@/app/(public)/components/TinTuc";
import HomeAboutMe1 from "@/app/components/template/HomeAboutMe/HomeAboutMe1";
import {useEffect, useState} from "react";
import {layHomeAboutMe, layHomeChucNang, layHomeSanPhamGoiY} from "@/services/public";
import {HomeChucNang1} from "@/app/components/template/HomeChucNang/HomeChucNang1";
import {HomeSanPhamGoiY1} from "@/app/components/template/HomeSanPhamGoiY/HomeSanPhamGoiY1";


const TEMP_ABOUTME_MAP = {
    "mau-1": HomeAboutMe1,
};

const TEMP_CHUCNANG_MAP = {
    "mau-1": HomeChucNang1,
};

const TEMP_GOIY_MAP = {
    "mau-1": HomeSanPhamGoiY1,
};


export default function HomaPage() {
    const [tempAboutMeKey, setTemplateAboutMeKey] = useState("mau-1");
    const [tempChucNangKey, setTemplateChucNangKey] = useState("mau-1");
    const [tempSpGoiYKey, setTemplateSpGoiYKey] = useState("mau-1");

    const TemplateAboutMe = TEMP_ABOUTME_MAP[tempAboutMeKey];
    const TemplateChucNang = TEMP_CHUCNANG_MAP[tempChucNangKey];
    const TemplateSpGoiY = TEMP_GOIY_MAP[tempSpGoiYKey];

    useEffect(() => {
        const getTemplateKey = async () => {
            const aboutMe = await layHomeAboutMe();
            setTemplateAboutMeKey(aboutMe?.template || 'mau-1');
            const chucNang = await layHomeChucNang();
            setTemplateChucNangKey(chucNang?.template || 'mau-1');
            const spGoiY = await layHomeSanPhamGoiY();
            setTemplateSpGoiYKey(spGoiY.template || 'mau-1');
        }

        getTemplateKey();
    })

    return (
        <div className={'p-0'}>
            <HomeBanner/>
            {tempSpGoiYKey && (
                <TemplateSpGoiY readOnly/>
            )}
            {TemplateAboutMe && (
                <TemplateAboutMe readOnly/>
            )}
            {TemplateChucNang && (
                <TemplateChucNang readOnly/>
            )}
            <LoaiSanPham/>

            <TinTuc/>
        </div>
    )
}
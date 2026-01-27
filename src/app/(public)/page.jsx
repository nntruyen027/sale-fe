'use client'


import HomeBanner from "@/app/(public)/components/HomeBanner";
import LoaiSanPham from "@/app/(public)/components/LoaiSanPham";
import TinTuc from "@/app/(public)/components/TinTuc";
import HomeAboutMe1 from "@/app/components/template/HomeAboutMe/HomeAboutMe1";
import {useEffect, useState} from "react";
import {layHomeAboutMe} from "@/services/public";


const TEMPLATE_MAP = {
    "mau-1": HomeAboutMe1,
};


export default function HomaPage() {
    const [templateKey, setTemplateKey] = useState("mau-1");

    const TemplateComponent = TEMPLATE_MAP[templateKey];

    useEffect(() => {
        const getTemplateKey = async () => {
            const data = await layHomeAboutMe();
            setTemplateKey(data?.template || 'mau-1');
        }

        getTemplateKey();
    })

    return (
        <div className={'p-0'}>
            <HomeBanner/>
            <LoaiSanPham/>
            {TemplateComponent && (
                <TemplateComponent readOnly/>
            )}
            <TinTuc/>
        </div>
    )
}
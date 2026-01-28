'use client'

import {usePageInfoStore} from "@/store/page-info";
import {useEffect, useState} from "react";
import HomeAboutMe from "@/app/components/template/HomeAboutMe/HomeAboutMe";
import {Select} from "antd";
import HomeChucNang from "@/app/components/template/HomeChucNang/HomeChucNang";
import HomeSanPhamGoiY from "@/app/components/template/HomeSanPhamGoiY/HomeSanPhamGoiY";

const COMPONENT_MAP = {
    "home_gioithieu": HomeAboutMe,
    "home_chucnang": HomeChucNang,
    "home_sanphamgoiy": HomeSanPhamGoiY

};


export default function Page() {
    const setPageInfo = usePageInfoStore(state => state.setPageInfo)
    const [templateKey, setTemplateKey] = useState("home_gioithieu");

    const TemplateComponent = COMPONENT_MAP[templateKey];


    useEffect(() => {
        setPageInfo({
            title: 'Giao diện trang chủ'
        })
    }, []);
    return (<div>
        <div className="flex items-center gap-3">
            <span className="font-medium">Thành phần</span>
            <Select
                value={templateKey}
                style={{width: 160}}
                onChange={setTemplateKey}
                options={[
                    {label: "Về chúng tôi", value: "home_gioithieu"},
                    {label: "Tính năng", value: "home_chucnang"},
                    {label: "Sản phẩm gợi ý", value: 'home_sanphamgoiy'}
                ]}
            />
        </div>
        <div className={'mt-4'}>
            {TemplateComponent && (
                <TemplateComponent/>
            )}
        </div>
    </div>);
}
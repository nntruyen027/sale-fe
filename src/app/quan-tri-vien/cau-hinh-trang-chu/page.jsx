'use client'

import {usePageInfoStore} from "@/store/page-info";
import {useEffect} from "react";
import HomeAboutMe from "./components/HomeAboutMe";

export default function Page() {
    const setPageInfo = usePageInfoStore(state => state.setPageInfo)


    useEffect(() => {
        setPageInfo({
            title: 'Giao diện trang chủ'
        })
    }, []);
    return (<div>
        <HomeAboutMe/>
    </div>);
}
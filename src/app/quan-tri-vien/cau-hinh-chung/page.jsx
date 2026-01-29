'use client'

import {usePageInfoStore} from "@/store/page-info";
import {useEffect, useState} from "react";
import {Select} from "antd";
import ChungHeader from "@/app/components/template/ChungHeader/ChungHeader";
import ChungFooter from "@/app/components/template/ChungFooter/ChungFooter";

const COMPONENT_MAP = {
    "chung_header": ChungHeader,
    "chung_footer": ChungFooter,
};


export default function Page() {
    const setPageInfo = usePageInfoStore(state => state.setPageInfo)
    const [templateKey, setTemplateKey] = useState("chung_header");

    const TemplateComponent = COMPONENT_MAP[templateKey];


    useEffect(() => {
        setPageInfo({
            title: 'Giao diện chung'
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
                    {label: "Đầu trang", value: "chung_header"},
                    {label: "Chân trang", value: "chung_footer"},
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
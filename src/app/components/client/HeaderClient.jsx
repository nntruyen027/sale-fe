'use client'

import ChungHeader1View from "@/app/components/template/ChungHeader/ChungHeader1/ChungHeader1View";
import {useEffect, useState} from "react";
import {layChungHeader} from "@/services/public";

const TEMP_HEADER_MAP = {
    "mau-1": ChungHeader1View,
};

export default function HeaderClient(props) {
    const [tempHeaderKey, setTemplateHeaderKey] = useState("mau-1");
    const TemplateHeader = TEMP_HEADER_MAP[tempHeaderKey];

    useEffect(() => {
        const getTemplateKey = async () => {
            const header = await layChungHeader();
            setTemplateHeaderKey(header?.template || 'mau-1');

        }

        getTemplateKey();
    })
    return (tempHeaderKey && (
        <TemplateHeader readOnly/>
    ))
}
'use client'

import {useEffect, useState} from "react";
import {layChungFooter} from "@/services/public";
import ChungFooter1View from "@/app/components/template/ChungFooter/ChungFooter1/ChungFooter1View";

const TEMP_HEADER_MAP = {
    "mau-1": ChungFooter1View,
};

export default function FooterClient(props) {
    const [temFooterKey, setTemplatFooterKey] = useState("mau-1");
    const TemplatFooter = TEMP_HEADER_MAP[temFooterKey];

    useEffect(() => {
        const getTemplateKey = async () => {
            const header = await layChungFooter();
            setTemplatFooterKey(header?.template || 'mau-1');

        }

        getTemplateKey();
    })
    return (temFooterKey && (
        <TemplatFooter readOnly/>
    ))
}
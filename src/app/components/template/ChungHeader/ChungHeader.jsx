"use client";

import {usePermission} from "@/hook/usePermission";
import ChungHeader1View from "@/app/components/template/ChungHeader/ChungHeader1/ChungHeader1View";
import {useEffect, useState} from "react";
import {Card, Select, Switch, Tag} from "antd";
import {layChungHeader} from '@/services/public';
import ChungHeader1Edit from "@/app/components/template/ChungHeader/ChungHeader1/ChungHeader1Edit";

const TEMPLATE_MAP = {
    "mau-1": ChungHeader1View,
};

const EDIT_TEMPLATE_MAP = {
    "mau-1": ChungHeader1Edit,
};


export default function ChungHeader() {
    const {isAdmin} = usePermission();

    const [isEdit, setEdit] = useState(false);
    const [templateKey, setTemplateKey] = useState("mau-1");

    const TemplateComponent = !isEdit ? TEMPLATE_MAP[templateKey] : EDIT_TEMPLATE_MAP[templateKey];
    const readOnly = !(isAdmin && isEdit);

    useEffect(() => {
        const getTemplateKey = async () => {
            const data = await layChungHeader();
            setTemplateKey(data?.template || 'mau-1');
        }

        getTemplateKey();
    })

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <Card size="small">
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                        <span className="font-medium">Chế độ chỉnh sửa</span>
                        <Switch
                            value={isEdit}
                            disabled={!isAdmin}
                            onChange={setEdit}
                        />
                        {!isAdmin && (
                            <Tag color="default">Chỉ Admin</Tag>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="font-medium">Mẫu hiển thị</span>
                        <Select
                            value={templateKey}
                            style={{width: 160}}
                            onChange={setTemplateKey}
                            options={[
                                {label: "Mẫu 1", value: "mau-1"},
                            ]}
                        />
                    </div>
                </div>
            </Card>

            {/* Template render */}
            <Card>
                {TemplateComponent && (
                    <TemplateComponent readOnly={readOnly}/>
                )}
            </Card>
        </div>
    );
}

"use client";

import {App, ConfigProvider} from "antd";
import InnerLayout from "./InnerLayout";

export default function ClientLayout({children}) {
    return (
        <ConfigProvider
            theme={{
                token: {
                    mainColor: '#4d6648',
                    colorPrimary: '#4d6648'
                },
                components: {
                    Menu: {
                        itemHeight: 36,
                        fontSize: 14,
                        itemSelectedColor: '#4d6648',
                        itemSelectedBg: 'rgba(77,102,72,0.12)',

                        itemHoverColor: '#4d6648',             // hover chữ
                        itemHoverBg: 'rgba(77,102,72,0.08)',   // hover nền
                    },
                    Table: {
                        headerBg: "rgba(77, 102, 72, 0.1);",          // nền header
                        headerColor: "black",       // chữ header
                        headerSplitColor: "#ffffff30",
                        borderColor: "#f0f0f0",
                    },

                }
            }}
        >
            <App
                message={{
                    maxCount: 3,
                    duration: 3,
                    top: 70,
                }}
            >
                <InnerLayout>{children}</InnerLayout>
            </App>
        </ConfigProvider>

    );
}

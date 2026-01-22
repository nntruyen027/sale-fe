"use client";

import {App, ConfigProvider} from "antd";
import InnerLayout from "./InnerLayout";

export default function ClientLayout({children}) {
    return (
        <ConfigProvider
            theme={{

                components: {
                    Menu: {
                        itemHeight: 36,
                        fontSize: 14
                    },
                    Table: {
                        headerBg: "rgba(21, 101, 192, 0.1);",          // nền header
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

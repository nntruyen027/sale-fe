import "./globals.css";
import "antd/dist/reset.css";
import ClientLayout from "./ClientLayout";
import {ConfigProvider} from "antd";

export const metadata = {
    title: 'Thương mại điện tử',
    icons: {
        icon: "/favicon.png",
        shortcut: "/favicon.png",
        apple: "/favicon.png",
    }
};

export default function RootLayout({children}) {


    return (
        <html lang="en">
        <body className="h-screen w-screen p-0 m-0 overflow-x-hidden">
        <ClientLayout>
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
                        }
                    }
                }}
            >
                {children}
            </ConfigProvider>
        </ClientLayout>
        </body>
        </html>
    );
}

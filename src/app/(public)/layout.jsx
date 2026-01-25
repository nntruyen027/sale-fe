'use client'

import {Layout} from "antd";
import HeaderClient from "@/app/components/client/HeaderClient";
import FooterClient from "@/app/components/client/FooterClient";
import {Raleway} from 'next/font/google';

const raleway = Raleway({
    subsets: ['latin', 'vietnamese'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-raleway',
    display: 'swap',
});


export default function PublicLayout({children}) {
    return (
        <Layout className={raleway.className} style={{minHeight: "100vh"}}>
            <HeaderClient/>

            <Layout.Content>
                {children}
            </Layout.Content>

            <FooterClient/>

        </Layout>
    );
}

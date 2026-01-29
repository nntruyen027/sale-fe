'use client';

import {Col, Layout, Row, Typography} from "antd";
import Link from "next/link";
import {useEffect, useState} from "react";
import {layChungFooter} from "@/services/public";

const {Footer} = Layout;
const {Title} = Typography;

export default function ChungFooter1View() {
    const [footer, setFooter] = useState(null);

    useEffect(() => {
        layChungFooter().then(setFooter);
    }, []);

    if (!footer) return null;

    const renderItem = (item, idx) => {
        switch (item.type) {
            case 'link':
                return (
                    <div key={idx} style={{marginBottom: 8}}>
                        <Link href={item.url}>{item.label}</Link>
                    </div>
                );

            case 'html':
                return (
                    <div
                        key={idx}
                        style={{marginBottom: 8}}
                        dangerouslySetInnerHTML={{__html: item.content}}
                    />
                );

            default:
                return (
                    <div key={idx} style={{marginBottom: 8}}>
                        {item.content || item.label}
                    </div>
                );
        }
    };

    return (
        <Footer style={{background: footer.background || '#f5f5f5'}}>
            <Row gutter={[24, 24]}>
                {footer.columns?.map((col, idx) => (
                    <Col key={idx} xs={24} sm={12} md={6}>
                        <Title level={5}>{col.title}</Title>
                        {col.items?.map(renderItem)}
                    </Col>
                ))}
            </Row>

            {footer.copyright && (
                <div style={{textAlign: 'center', marginTop: 32}}>
                    {footer.copyright}
                </div>
            )}
        </Footer>
    );
}

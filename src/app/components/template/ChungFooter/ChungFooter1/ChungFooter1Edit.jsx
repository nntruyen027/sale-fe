'use client';

import {Button, Card, Form, Input, message, Select} from "antd";
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import {useEffect} from "react";
import {caiDatChungFooter} from "@/services/quan-tri-vien/thong-tin-he-thong";
import {layChungFooter} from "@/services/public";
import Editor from "@/app/components/common/Editor";

export default function ChungFooter1Edit() {
    const [form] = Form.useForm();

    /* ===== LOAD DATA ===== */
    useEffect(() => {
        layChungFooter().then(data => {
            form.setFieldsValue(data);
        });
    }, []);

    /* ===== SAVE ===== */
    const onFinish = async (values) => {
        try {
            await caiDatChungFooter({...values, template: 'mau-1'});
            message.success('Lưu cấu hình footer thành công');
        } catch (e) {
            message.error(e.message);
        }
    };

    return (
        <Card title="Cấu hình Footer">
            <Form form={form} layout="vertical" onFinish={onFinish}>

                <Form.Item label="Màu nền" name="background">
                    <Input placeholder="#f5f5f5"/>
                </Form.Item>

                {/* ===== COLUMNS ===== */}
                <Form.List name="columns">
                    {(columns, {add, remove}) => (
                        <>
                            {columns.map(({key, name}) => (
                                <Card
                                    key={key}
                                    title={`Cột ${name + 1}`}
                                    style={{marginBottom: 16}}
                                    extra={
                                        <MinusCircleOutlined onClick={() => remove(name)}/>
                                    }
                                >
                                    <Form.Item
                                        label="Tiêu đề cột"
                                        name={[name, 'title']}
                                    >
                                        <Input/>
                                    </Form.Item>

                                    {/* ===== ITEMS ===== */}
                                    <Form.List name={[name, 'items']}>
                                        {(items, {add, remove}) => (
                                            <>
                                                {items.map(({key, name: iName}) => (
                                                    <Card
                                                        key={key}
                                                        size="small"
                                                        style={{marginBottom: 12}}
                                                        extra={
                                                            <MinusCircleOutlined
                                                                onClick={() => remove(iName)}
                                                            />
                                                        }
                                                    >
                                                        <Form.Item
                                                            label="Loại nội dung"
                                                            name={[iName, 'type']}
                                                            initialValue="text"
                                                        >
                                                            <Select
                                                                options={[
                                                                    {value: 'text', label: 'Text'},
                                                                    {value: 'link', label: 'Link'},
                                                                    {value: 'html', label: 'Nội dung nâng cao'},
                                                                ]}
                                                            />
                                                        </Form.Item>

                                                        {/* TEXT */}
                                                        <Form.Item shouldUpdate>
                                                            {({getFieldValue}) =>
                                                                getFieldValue(['columns', name, 'items', iName, 'type']) === 'text' && (
                                                                    <Form.Item
                                                                        name={[iName, 'content']}
                                                                        label="Nội dung"
                                                                    >
                                                                        <Input/>
                                                                    </Form.Item>
                                                                )
                                                            }
                                                        </Form.Item>

                                                        {/* LINK */}
                                                        <Form.Item shouldUpdate>
                                                            {({getFieldValue}) =>
                                                                getFieldValue(['columns', name, 'items', iName, 'type']) === 'link' && (
                                                                    <>
                                                                        <Form.Item
                                                                            name={[iName, 'label']}
                                                                            label="Nhãn"
                                                                        >
                                                                            <Input/>
                                                                        </Form.Item>
                                                                        <Form.Item
                                                                            name={[iName, 'url']}
                                                                            label="Link"
                                                                        >
                                                                            <Input/>
                                                                        </Form.Item>
                                                                    </>
                                                                )
                                                            }
                                                        </Form.Item>

                                                        {/* HTML */}
                                                        <Form.Item shouldUpdate>
                                                            {({getFieldValue}) =>
                                                                getFieldValue(['columns', name, 'items', iName, 'type']) === 'html' && (
                                                                    <Form.Item
                                                                        name={[iName, 'content']}
                                                                        label="Nội dung"
                                                                    >
                                                                        <Editor/>
                                                                    </Form.Item>
                                                                )
                                                            }
                                                        </Form.Item>

                                                    </Card>
                                                ))}

                                                <Button
                                                    type="dashed"
                                                    onClick={() => add({type: 'text'})}
                                                    icon={<PlusOutlined/>}
                                                >
                                                    Thêm nội dung
                                                </Button>
                                            </>
                                        )}
                                    </Form.List>
                                </Card>
                            ))}

                            <Button
                                type="dashed"
                                block
                                icon={<PlusOutlined/>}
                                onClick={() => add({items: []})}
                            >
                                Thêm cột footer
                            </Button>
                        </>
                    )}
                </Form.List>

                <Form.Item label="Copyright" name="copyright">
                    <Input/>
                </Form.Item>

                <Button type="primary" htmlType="submit">
                    Lưu cấu hình
                </Button>
            </Form>
        </Card>
    );
}

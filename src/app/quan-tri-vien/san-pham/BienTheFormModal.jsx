"use client";

import {useEffect, useState} from "react";
import {Form, Input, Modal} from "antd";
import FileUploadUrl from "@/app/components/common/FileUploadUrl";
import {suaBienThem, taoBienThem} from "@/services/quan-tri-vien/san-pham";

export default function BienTheFormModal({
                                             open,
                                             sanPhamId,
                                             editing,
                                             onClose,
                                             onSuccess
                                         }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editing) {
            form.setFieldsValue(editing);
        } else {
            form.resetFields();
        }
    }, [editing, open]);

    const handleSubmit = async () => {
        const values = await form.validateFields();
        setLoading(true);

        try {
            if (editing) {
                await suaBienThem(sanPhamId, editing.id, values);
            } else {
                await taoBienThem(sanPhamId, values);
            }
            onSuccess();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={editing ? "Cập nhật phiên bản" : "Thêm phiên bản"}
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            destroyOnClose
            maskClosable={false}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="SKU"
                    name="sku"
                    rules={[{required: true}]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item label="Hình ảnh" name="hinhAnh">
                    <FileUploadUrl accept="image/*"/>
                </Form.Item>

                <Form.Item label="Màu sắc" name="mauSac">
                    <Input/>
                </Form.Item>

                <Form.Item label="Kích cỡ" name="kichCo">
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Giá"
                    name="gia"
                    rules={[{required: true}]}
                >
                    <Input type="number"/>
                </Form.Item>

                <Form.Item
                    label="Tồn kho"
                    name="tonKho"
                    rules={[{required: true}]}
                >
                    <Input type="number"/>
                </Form.Item>
            </Form>
        </Modal>
    );
}

'use client';

import {useEffect, useState} from "react";
import {App, Button, Form, Image, Input, InputNumber, Modal, Popconfirm, Space, Switch, Table} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import {caiDatHomeBanner} from "@/services/quan-tri-vien/thong-tin-he-thong";
import {layHomeBanner} from "@/services/public";
import FileUploadUrl from "@/app/components/common/FileUploadUrl";

export default function HomeBanner() {
    const {message} = App.useApp();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [data, setData] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);

    /* ================= LOAD ================= */
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await layHomeBanner();
        setData(res || []);
    };

    /* ================= HELPER ================= */
    const getNextThuTu = () => {
        if (!data.length) return 1;
        return Math.max(...data.map(i => i.thuTu || 0)) + 1;
    };

    /* ================= ADD ================= */
    const openAdd = () => {
        setEditingIndex(null);
        form.setFieldsValue({
            thuTu: getNextThuTu(),
            laMacDinh: true,
        });
        setOpen(true);
    };

    /* ================= EDIT ================= */
    const openEdit = (record, index) => {
        setEditingIndex(index);
        form.setFieldsValue(record);
        setOpen(true);
    };

    /* ================= DELETE ================= */
    const handleDelete = async (index) => {
        try {
            const clone = data.filter((_, i) => i !== index);
            await caiDatHomeBanner(clone);
            message.success("Đã xoá banner");
            fetchData();
        } catch (e) {
            message.error(e.message || "Xoá thất bại");
        }
    };

    const handleClose = () => {
        setOpen(false);
        setEditingIndex(null);
        form.resetFields();
    };

    /* ================= SUBMIT ================= */
    const onSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            let clone = [...data];

            // nếu là mặc định → set các thằng khác về false
            if (values.laMacDinh) {
                clone = clone.map(item => ({
                    ...item,
                    laMacDinh: false,
                }));
            }

            if (editingIndex === null) {
                // ADD
                clone.push(values);
            } else {
                // EDIT
                clone[editingIndex] = {
                    ...clone[editingIndex],
                    ...values,
                };
            }

            await caiDatHomeBanner(clone);

            message.success("Lưu banner thành công");
            setOpen(false);
            form.resetFields();
            fetchData();

        } catch (e) {
            message.error(e.message || "Lỗi hệ thống");
        } finally {
            setLoading(false);
        }
    };

    /* ================= TABLE ================= */
    const columns = [
        {
            title: "Hình ảnh",
            dataIndex: "hinhAnh",
            render: (img) => <Image width={120} src={img}/>
        },
        {title: "URL", dataIndex: "url"},
        {title: "Thứ tự", dataIndex: "thuTu"},
        {
            title: "Mặc định",
            dataIndex: "laMacDinh",
            render: v => v ? "✔" : ""
        },
        {
            title: "Thao tác",
            render: (_, record, index) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined/>}
                        onClick={() => openEdit(record, index)}
                    />
                    <Popconfirm
                        title="Xoá banner này?"
                        onConfirm={() => handleDelete(index)}
                    >
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined/>}
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <>
            <Button
                type="primary"
                icon={<PlusOutlined/>}
                onClick={openAdd}
            >
                Thêm banner
            </Button>

            <Table
                style={{marginTop: 16}}
                columns={columns}
                dataSource={data}
                rowKey="id"
                pagination={false}
            />

            <Modal
                title={editingIndex === null ? "Thêm banner" : "Chỉnh sửa banner"}
                open={open}
                onCancel={handleClose}
                onOk={onSubmit}
                confirmLoading={loading}
                destroyOnClose
            >
                <Form layout="vertical" form={form}>

                    <Form.Item
                        label="Hình ảnh"
                        name="hinhAnh"
                        rules={[{required: true}]}
                    >
                        <FileUploadUrl/>
                    </Form.Item>

                    <Form.Item label="URL" name="url">
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Thứ tự"
                        name="thuTu"
                        rules={[
                            {required: true, message: 'Vui lòng nhập thứ tự'},
                            {
                                validator: (_, value) => {
                                    const duplicate = data.some(
                                        (item, i) =>
                                            item.thuTu === value &&
                                            i !== editingIndex
                                    );
                                    return duplicate
                                        ? Promise.reject("Thứ tự đã tồn tại")
                                        : Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <InputNumber min={1} className="w-full"/>
                    </Form.Item>

                    <Form.Item
                        label="Mặc định"
                        name="laMacDinh"
                        valuePropName="checked"
                    >
                        <Switch/>
                    </Form.Item>

                    <Form.Item label="Nội dung" name="noiDung">
                        <Input.TextArea rows={3}/>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

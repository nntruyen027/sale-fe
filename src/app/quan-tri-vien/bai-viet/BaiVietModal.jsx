'use client';

import {App, Col, Form, Input, Modal, Row, Select} from "antd";
import {useEffect} from "react";
import {suaBaiViet, themBaiViet} from "@/services/quan-tri-vien/bai-viet";
import Editor from "@/app/components/common/Editor";
import {layDsChuyenMuc} from "@/services/quan-tri-vien/chuyen-muc";
import {useChuyenMucSelect} from "@/hook/useChuyenMuc";

export default function BaiVietModal({open, data, onClose, onSuccess}) {
    const {message} = App.useApp();
    const [form] = Form.useForm();

    const {
        dsChuyenMuc,
        loading: chuyenMucLoading,
        hasMore,
        setSearchChuyenMuc,
        loadMore,
    } = useChuyenMucSelect();

    useEffect(() => {
        if (data) {
            form.setFieldsValue(data);
        } else {
            form.resetFields();
        }
    }, [data]);

    const handleOk = async () => {
        const values = await form.validateFields();
        values.trangThai = 'DRAFT';

        try {
            if (data) {
                await suaBaiViet(data.id, values);
                message.success("Cập nhật bài viết thành công");
            } else {
                await themBaiViet(values);
                message.success("Thêm bài viết thành công");
            }
            onSuccess();
        } catch (e) {
            message.error(e.message);
        }
    };

    const fetchChuyenMucOptions = async ({page = 1, search = "", append = false}) => {
        if (chuyenMucLoading) return;

        setChuyenMucLoading(true);
        try {
            const res = await layDsChuyenMuc({
                page,
                limit: 10,
                search
            });

            const options = (res.data || [])
                .filter(item => item.id !== editingChuyenMuc?.id) // ❌ bỏ chính nó
                .map(item => ({
                    label: item.ten,
                    value: item.id
                }));

            setParentOptions(prev =>
                append ? [...prev, ...options] : options
            );

            setParentPage(page);
            setParentHasMore(page * 10 < (res.totalElements || 0));
        } finally {
            setChuyenMucLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            title={data ? "Sửa bài viết" : "Thêm bài viết"}
            onCancel={onClose}
            onOk={handleOk}
            okText={data ? "Cập nhật" : "Thêm"}
            cancelText="Thoát"

            /* 🔥 QUAN TRỌNG */
            width="90vw"
            style={{top: "5vh"}}
            bodyStyle={{
                height: "calc(90vh - 120px)", // trừ header + footer
                overflowY: "auto",
                paddingRight: 16
            }}
        >
            <Form layout="vertical" size={'middle'} form={form}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="tieuDe" label="Tiêu đề" rules={[{required: true}]}>
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={8}> <Form.Item name="slug" label="Slug" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item></Col>
                    <Col span={8}>
                        <Form.Item
                            name="chuyenMucId"
                            label="Chuyên mục"
                            rules={[{required: true, message: "Vui lòng chọn chuyên mục"}]}
                        >
                            <Select
                                showSearch
                                allowClear
                                placeholder="Chọn chuyên mục"
                                loading={chuyenMucLoading}
                                filterOption={false}     // 🔥 bắt buộc khi search server
                                options={dsChuyenMuc.map(cm => ({
                                    label: cm.ten,
                                    value: cm.id
                                }))}

                                /* 🔍 search */
                                onSearch={value => setSearchChuyenMuc(value)}

                                /* 📜 scroll load thêm */
                                onPopupScroll={e => {
                                    const target = e.target;
                                    if (
                                        target.scrollTop + target.offsetHeight >=
                                        target.scrollHeight - 10
                                    ) {
                                        loadMore();
                                    }
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>


                <Form.Item name="tomTat" label="Tóm tắt">
                    <Input.TextArea rows={3}/>
                </Form.Item>


                <Form.Item name="noiDung" label="Nội dung" rules={[{required: true}]}>
                    <Editor/>
                </Form.Item>
            </Form>
        </Modal>
    );
}

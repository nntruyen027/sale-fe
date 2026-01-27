'use client';

import {useEffect, useState} from "react";
import {App, Button, Col, Dropdown, Form, Image, Input, Modal, Row, Switch, Table} from "antd";
import {CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, EllipsisOutlined} from "@ant-design/icons";
import {layDsBanner, suaBanner, themBanner, xoaBanner} from "@/services/quan-tri-vien/thong-tin-he-thong";
import {usePermission} from "@/hook/usePermission";
import FileUploadUrl from "@/app/components/common/FileUploadUrl";
import {usePageInfoStore} from "@/store/page-info";
import Link from "next/link";

export default function Page() {
    const setPageInfo = usePageInfoStore(state => state.setPageInfo)

    // -----------------------------
    // STATE
    // -----------------------------
    const {message} = App.useApp();
    const {hasPermission} = usePermission();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingId, setDeletingId] = useState(null);


    const [form] = Form.useForm();


    // -----------------------------
    // FETCH TABLE DATA
    // -----------------------------
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await layDsBanner();
            setData(res || []);
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách banner");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchData();
        setPageInfo({
            title: 'Banner',
        })
    }, []);


    // -----------------------------
    // HANDLERS
    // -----------------------------
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            console.log(values);

            const payload = {
                ...values,
            };

            delete payload.parentId?.label;

            if (editingBanner) {
                await suaBanner(editingBanner.id, payload);
                message.success("Cập nhật thành công");
            } else {
                await themBanner(payload);
                message.success("Thêm banner thành công");
            }

            setModalVisible(false);
            setEditingBanner(null);
            form.resetFields();
            fetchData();

        } catch (e) {
            message.error(e.message || "Lỗi");
        }
    };

    const handleEdit = (record) => {
        setEditingBanner(record);


        form.setFieldsValue(record);

        setModalVisible(true);
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        try {
            await xoaBanner(deletingId);
            message.success("Xóa thành công");
            fetchData();


        } catch (e) {
            message.error(e.message);
        } finally {
            setDeleteModalVisible(false);
            setDeletingId(null);
        }
    };

    // -----------------------------
    // TABLE
    // -----------------------------
    const columns = [
        {
            title: "#",
            width: 80,
            align: "right",
            render: (_, __, index) =>
                index + 1
        },
        {
            title: "Hình ảnh",
            dataIndex: "hinhAnh",
            render: (text, record) =>
                text ? <Image src={text} alt={record.ten} width={60}/> : null
        },
        {
            title: "URL",
            dataIndex: "url",
            render: (url) =>
                url ? (
                    <Link href={url} target="_blank">
                        Nhấn vào đây
                    </Link>
                ) : (
                    <span>-</span>
                )
        },
        {
            title: "Thứ tự",
            dataIndex: "thuTu",
        },
        {
            title: "Mặc định",
            dataIndex: "laMacDinh",
            render: text => text ? <CheckOutlined/> : null
        },
        {
            title: "Thao tác",
            width: 100,
            render: (_, record) => {
                const items = [];

                if (hasPermission('ptype:update')) {
                    items.push({
                        key: "edit",
                        label: "Cập nhật",
                        icon: <EditOutlined/>,
                        onClick: () => handleEdit(record)
                    });
                }

                if (hasPermission('ptype:delete')) {
                    items.push({
                        key: "delete",
                        label: "Xóa",
                        danger: true,
                        icon: <DeleteOutlined/>,
                        onClick: () => handleDelete(record.id)
                    });
                }

                return (
                    <Dropdown menu={{items}} trigger={['click']}>
                        <Button type="text" icon={<EllipsisOutlined/>}/>
                    </Dropdown>
                );
            }
        }
    ];

    // -----------------------------
    // RENDER
    // -----------------------------
    return (
        <div style={{padding: 16}}>
            <div className="flex justify-between">
                <div></div>

                <Button
                    type="primary"
                    onClick={() => {
                        setEditingBanner(null);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                >
                    Thêm banner
                </Button>
            </div>

            <Table
                style={{marginTop: 16}}
                size="small"
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                onChange={() => fetchData()}
            />

            {/* ADD / EDIT MODAL */}
            <Modal
                title={editingBanner ? "Sửa banner" : "Thêm banner"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingBanner(null);
                    form.resetFields();
                }}
                okText={editingBanner ? 'Cập nhật' : 'Thêm'}
                cancelText={'Thoát'}
            >
                <Form form={form} layout="vertical">


                    <Form.Item
                        label="Đường link"
                        name="url"
                        rules={[{required: true, message: "Vui lòng nhập đường link"}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Hình ảnh" name="hinhAnh">
                                <FileUploadUrl accept={'image/*'}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Thứ tự"
                                name="thuTu"
                            >
                                <Input type={'number'}/>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Mặc định"
                                name="laMacDinh"
                            >
                                <Switch
                                    defaultValue={false}
                                    checkedChildren={<CheckOutlined/>}
                                    unCheckedChildren={<CloseOutlined/>}
                                />
                            </Form.Item>
                        </Col>

                    </Row>


                </Form>
            </Modal>

            {/* DELETE MODAL */}
            <Modal
                title="Xác nhận xóa"
                open={deleteModalVisible}
                onOk={confirmDelete}
                onCancel={() => setDeleteModalVisible(false)}
                okButtonProps={{danger: true}}
                okText={'Xóa'}
                cancelText={'Thoát'}
            >
                Bạn có chắc muốn xóa banner này không?
            </Modal>
        </div>
    );
}

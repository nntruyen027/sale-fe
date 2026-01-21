'use client';

import {useEffect, useState} from "react";
import {App, Button, Dropdown, Form, Input, Modal, Table, Tag} from "antd";
import {DeleteOutlined, EditOutlined, EllipsisOutlined, SafetyOutlined} from "@ant-design/icons";
import {
    layDsNguoiDung,
    phanVaiTro,
    suaNguoiDung,
    themNguoiDung,
    xoaNguoiDung
} from "@/services/quan-tri-vien/nguoi-dung";
import {useDebounce} from "@/hook/data";
import PhanQuyenModal from "./PhanQuyenModal";
import {usePermission} from "@/hook/usePermission";


export default function Page() {

    // -----------------------------
    // STATE
    // -----------------------------
    const {message} = App.useApp()

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});

    const [modalVisible, setModalVisible] = useState(false);
    const [modalPhanQuyenVisible, setModalPhanQuyenVisible] = useState(false);
    const [editingNguoiDung, setEditingNguoiDung] = useState(null);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingId, setDeletingId] = useState(null);


    // Search
    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 400);
    const {hasPermission} = usePermission()

    // -----------------------------
    // REF + FORM
    // -----------------------------
    const [form] = Form.useForm();

    // -----------------------------
    // FETCH DATA
    // -----------------------------
    const fetchData = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const res = await layDsNguoiDung({page, limit: pageSize, search});
            setData(res.data || []);

            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, pagination.pageSize, debouncedSearch);
    }, [debouncedSearch]);

    useEffect(() => {
        fetchData();
    }, []);


    // -----------------------------
    // HANDLERS: ADD / EDIT
    // -----------------------------
    const handleOk = async () => {
        try {
            let values = await form.validateFields();

            console.log('values', values);
            let body;
            if (!values.password) {
                body = {
                    ...values,
                    password: '',
                }
            } else {
                body = values;
            }


            if (editingNguoiDung) {
                await suaNguoiDung(editingNguoiDung.id, body);
                message.success("Cập nhật thành công");
            } else {
                await themNguoiDung(body);
                message.success("Thêm người dùng thành công");
            }

            setModalVisible(false);
            setEditingNguoiDung(null);
            form.resetFields();
            fetchData(pagination.current, pagination.pageSize, debouncedSearch);

        } catch (e) {
            message.error(e.message || "Lỗi");
        }
    };

    const handleEdit = (record) => {
        setEditingNguoiDung(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handlePhanQuyen = (record) => {
        setEditingNguoiDung(record);
        setModalPhanQuyenVisible(true);
    };

    const submitPhanQuyen = (dsMaQuyen) => {
        phanVaiTro(editingNguoiDung.id, {dsMaQuyen})
            .then(() => {
                setModalPhanQuyenVisible(false)
                message.success("Phân quyền thành công!");
            })
            .catch((e) => {
                setModalPhanQuyenVisible(false);
                message.error("Phân quyền thất bại! " + e.message);
            })
            .finally(() => {
                fetchData(pagination.current, pagination.pageSize, debouncedSearch);
            })
        ;
    }

    // -----------------------------
    // HANDLERS: DELETE
    // -----------------------------
    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        try {
            await xoaNguoiDung(deletingId);
            message.success("Xóa thành công");

            if (data.length === 1 && pagination.current > 1)
                fetchData(pagination.current - 1, pagination.pageSize, debouncedSearch);
            else
                fetchData(pagination.current, pagination.pageSize, debouncedSearch);

        } catch (e) {
            message.error(e.message);
        } finally {
            setDeleteModalVisible(false);
            setDeletingId(null);
        }
    };

    // -----------------------------

    // -----------------------------
    // TABLE COLUMNS
    // -----------------------------
    const columns = [
        {
            title: "#",
            key: "stt",
            width: 80,
            align: "right",
            render: (text, record, index) =>
                (pagination.current - 1) * pagination.pageSize + index + 1
        },
        {title: "Họ tên", dataIndex: "hoTen", key: "hoTen"},
        {title: "Tên tài khoản", dataIndex: "username", key: "username"},
        {title: "Thư điện tử", dataIndex: "email", key: "email"},
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            render: (text) => text ? <Tag color={'processing'}>Hoạt động</Tag> : <Tag color={'error'}>Khóa</Tag>
        },
        {
            title: "Thao tác",
            key: "thaoTac",
            width: 100,
            fixed: "right",
            render: (_, record) => {
                const items = []
                if (hasPermission('user:update')) {
                    items.push({
                        key: "sua",
                        label: "Cập nhật",
                        onClick: () => handleEdit(record),
                        icon: <EditOutlined/>
                    })
                    items.push({
                        key: "phan-vai-tro",
                        label: "Phân quyền",
                        onClick: () => handlePhanQuyen(record),
                        icon: <SafetyOutlined/>
                    })
                }
                if (hasPermission('user:delete')) {
                    items.push({
                        key: "xoa",
                        label: "Xóa",
                        onClick: () => handleDelete(record.id),
                        icon: <DeleteOutlined/>,
                        danger: true
                    })
                }

                
                return (
                    <Dropdown menu={{items}} trigger={['click']}>
                        <Button type="text" icon={<EllipsisOutlined/>}/>
                    </Dropdown>
                )
            }
        }
    ];


    // -----------------------------
    // RENDER
    // -----------------------------
    return (
        <div style={{padding: 16}}>

            {/* SEARCH + ACTION BUTTONS */}
            <div
                style={{
                    marginBottom: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                {/* LEFT: SEARCH */}
                <Input.Search
                    placeholder="Tìm người dùng..."
                    allowClear
                    style={{width: 300}}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                {/* RIGHT: BUTTONS */}
                <div style={{display: "flex", gap: 8}}>
                    <Button
                        hidden={!hasPermission('user:create')}
                        type="primary"
                        onClick={() => {
                            setModalVisible(true);
                            setEditingNguoiDung(null);
                            form.resetFields();
                        }}
                    >
                        Thêm người dùng
                    </Button>

                </div>
            </div>

            {/* TABLE */}
            <Table
                size={'small'}
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={pagination}
                scroll={{x: "max-content"}}
                onChange={(pag) => fetchData(pag.current, pag.pageSize, debouncedSearch)}
            />

            {/* ADD/EDIT MODAL */}
            <Modal
                title={editingNguoiDung ? "Sửa người dùng" : "Thêm người dùng"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingNguoiDung(null);
                }}
                okText={!editingNguoiDung ? 'Thêm' : 'Cập nhật'}
                cancelText={'Thoát'}
            >

                <Form form={form} layout="vertical" initialValues={{ten: ""}}>
                    <Form.Item
                        label="Họ tên"
                        name="hoTen"
                        rules={[{required: true, message: "Vui lòng nhập họ tên"}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Tên người dùng"
                        name="username"
                        rules={[{required: true, message: "Vui lòng nhập tên tài khoản"}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Thư điện tử"
                        name="email"
                        rules={[{required: true, message: "Vui lòng nhập email"}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                    >
                        <Input/>
                    </Form.Item>
                </Form>
            </Modal>

            {/* DELETE CONFIRM MODAL */}
            <Modal
                title="Xác nhận xóa"
                open={deleteModalVisible}
                onOk={confirmDelete}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setDeletingId(null);
                }}
                okButtonProps={{danger: true}}
                okText={'Xóa'}
                cancelText={'Thoát'}
            >
                Bạn có chắc muốn xóa người dùng này không?
            </Modal>

            <PhanQuyenModal
                modalVisible={modalPhanQuyenVisible}
                handleCancel={() => {
                    setModalPhanQuyenVisible(false);
                    setEditingNguoiDung(null);
                }}
                onOk={submitPhanQuyen}
                object={editingNguoiDung}

            />
        </div>
    );
}

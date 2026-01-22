'use client';

import {useEffect, useState} from "react";
import {App, Button, Dropdown, Form, Input, Modal, Table} from "antd";
import {DeleteOutlined, EditOutlined, EllipsisOutlined, SafetyOutlined} from "@ant-design/icons";
import {layDsVaiTro, phanQuyen, suaVaiTro, themVaiTro, xoaVaiTro} from "@/services/quan-tri-vien/vai-tro";
import {useDebounce} from "@/hook/data";
import PhanQuyenModal from "@/app/quan-tri-vien/vai-tro/PhanQuyenModal";
import {usePermission} from "@/hook/usePermission";
import {usePageInfoStore} from "@/store/page-info";


export default function Page() {

    // -----------------------------
    // STATE
    // -----------------------------
    const {message} = App.useApp()
    const {setPageInfo} = usePageInfoStore();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});

    const [modalVisible, setModalVisible] = useState(false);
    const [editingVaiTro, setEditingVaiTro] = useState(null);
    const [modalPhanQuyenVisible, setModalPhanQuyenVisible] = useState(false);

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
            const res = await layDsVaiTro({page, limit: pageSize, search});
            setData(res.data || []);

            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách vai trò");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, pagination.pageSize, debouncedSearch);
    }, [debouncedSearch]);

    useEffect(() => {
        setPageInfo(
            {title: 'Vai trò'}
        )
        fetchData();
    }, []);


    // -----------------------------
    // HANDLERS: ADD / EDIT
    // -----------------------------
    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            if (editingVaiTro) {
                await suaVaiTro(editingVaiTro.id, values);
                message.success("Cập nhật thành công");
            } else {
                await themVaiTro(values);
                message.success("Thêm vai trò thành công");
            }

            setModalVisible(false);
            setEditingVaiTro(null);
            form.resetFields();
            fetchData(pagination.current, pagination.pageSize, debouncedSearch);

        } catch (e) {
            message.error(e.message || "Lỗi");
        }
    };

    const handleEdit = (record) => {
        setEditingVaiTro(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };


    const handlePhanQuyen = (record) => {
        setEditingVaiTro(record);
        setModalPhanQuyenVisible(true);
    }

    const submitPhanQuyen = (dsMaQuyen) => {
        phanQuyen(editingVaiTro.id, {dsMaQuyen})
            .then(() => {
                setEditingVaiTro(null);
                message.success('Phân quyền thành công')
            })
            .catch(error => message.error('Phân quyên thất bại! ' + error.message))
            .finally(() => {
                setModalPhanQuyenVisible(false);
                fetchData(pagination.current, pagination.pageSize, debouncedSearch);
            })
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
            await xoaVaiTro(deletingId);
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
        {title: "Tên vai trò", dataIndex: "name", key: "name"},
        {title: "Mã vai trò", dataIndex: "code", key: "code"},
        {
            title: "Thao tác",
            key: "thaoTac",
            width: 100,
            fixed: "right",
            render: (_, record) => {
                const items = []

                if (hasPermission('role:update')) {
                    items.push({
                        key: "sua",
                        label: "Cập nhật",
                        onClick: () => handleEdit(record),
                        icon: <EditOutlined/>,
                    })
                    items.push({
                        key: "phan_quyen",
                        label: "Phân quyền",
                        onClick: () => handlePhanQuyen(record),
                        icon: <SafetyOutlined/>
                    })
                }
                if (hasPermission('role:delete')) {
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
                    placeholder="Tìm vai trò..."
                    allowClear
                    style={{width: 300}}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                {/* RIGHT: BUTTONS */}
                <div style={{display: "flex", gap: 8}}>
                    <Button
                        hidden={!hasPermission('role:create')}
                        type="primary"
                        onClick={() => {
                            setModalVisible(true);
                            setEditingVaiTro(null);
                            form.resetFields();
                        }}
                    >
                        Thêm vai trò
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
                title={editingVaiTro ? "Sửa vai trò" : "Thêm vai trò"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingVaiTro(null);
                }}
                okText={!editingVaiTro ? 'Thêm' : 'Cập nhật'}
                cancelText={'Thoát'}
            >

                <Form form={form} layout="vertical" initialValues={{ten: ""}}>
                    <Form.Item
                        label="Tên vai trò"
                        name="name"
                        rules={[{required: true, message: "Vui lòng nhập tên vai trò"}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Mã"
                        name="code"
                        normalize={(value) => value?.toUpperCase()}
                        rules={[{required: true, message: "Vui lòng nhập mã vai trò"}]}
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
                Bạn có chắc muốn xóa vai trò này không?
            </Modal>
            <PhanQuyenModal
                onOk={submitPhanQuyen}
                modalVisible={modalPhanQuyenVisible}
                object={editingVaiTro}
                handleCancel={() => {
                    setModalPhanQuyenVisible(false);
                    setEditingVaiTro(null);
                }}/>

        </div>
    );
}

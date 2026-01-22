'use client';

import {useEffect, useRef, useState} from "react";
import {App, Button, Dropdown, Form, Input, Modal, Select, Table} from "antd";
import {importXa, layDsXa, layFileImport, suaXa, themXa, xoaXa} from "@/services/quan-tri-vien/xa";
import {getTinh} from "@/services/auth";
import {useDebounce} from "@/hook/data";
import {DeleteOutlined, EditOutlined, EllipsisOutlined} from "@ant-design/icons";
import {usePermission} from "@/hook/usePermission";
import {usePageInfoStore} from "@/store/page-info";

export default function Page() {

    /* --------------------------------------------
     * 1. STATE
     * -------------------------------------------- */
    const {message} = App.useApp();
    const {setPageInfo} = usePageInfoStore();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});

    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const [editingXa, setEditingXa] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [importing, setImporting] = useState(false);

    const [dsTinh, setDsTinh] = useState([]);
    const [searchTinh, setSearchTinh] = useState("");
    const [tinhPagi, setTinhPagi] = useState({page: 1, limit: 20, total: 0});

    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 400);
    const {hasPermission} = usePermission()

    /* --------------------------------------------
     * 2. REFS & FORM
     * -------------------------------------------- */
    const searchTinhRef = useRef(null);
    const fileInputRef = useRef(null);
    const [form] = Form.useForm();

    /* --------------------------------------------
     * 3. TABLE COLUMNS
     * -------------------------------------------- */
    const columns = [
        {
            title: "#",
            width: 80,
            align: "right",
            render: (_, __, index) =>
                (pagination.current - 1) * pagination.pageSize + index + 1
        },
        {title: "Tên xã", dataIndex: "ten"},
        {
            title: "Tên tỉnh",
            dataIndex: "tinh",
            render: (tinh) => tinh?.ten || ""
        },
        {title: "Ghi chú", dataIndex: "ghiChu"},
        {
            title: "Thao tác",
            width: 100,
            fixed: "right",
            render: (_, record) => {
                const items = [];

                if (hasPermission('xa:update')) {
                    items.push({
                        key: "sua",
                        label: "Cập nhật",
                        onClick: () => handleEdit(record),
                        icon: <EditOutlined/>,
                    })
                }
                if (hasPermission('xa:delete')) {
                    items.push({
                        key: "xoa",
                        label: "Xóa",
                        onClick: () => handleDelete(record.id),
                        icon: <DeleteOutlined/>,
                        danger: true
                    })
                }

                return (
                    <Dropdown menu={{items}} trigger={["click"]}>
                        <Button type="text" icon={<EllipsisOutlined/>}/>
                    </Dropdown>
                );
            },
        },
    ];

    /* --------------------------------------------
     * 4. FETCH DATA
     * -------------------------------------------- */
    const fetchData = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const res = await layDsXa({page, limit: pageSize, search});
            setData(res.data || []);
            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách xã");
        } finally {
            setLoading(false);
        }
    };

    const fetchTinh = async (reset = false) => {
        const page = reset ? 1 : tinhPagi.page;
        const result = await getTinh(searchTinh, page, tinhPagi.limit);

        setDsTinh(reset ? result.dsTinh : [...dsTinh, ...result.dsTinh]);
        setTinhPagi({
            page,
            limit: tinhPagi.limit,
            total: result.total || 0,
        });
    };

    /* --------------------------------------------
     * 5. CRUD
     * -------------------------------------------- */
    const handleEdit = (record) => {
        setEditingXa(record);

        form.setFieldsValue({
            ten: record.ten,
            ghiChu: record.ghiChu,
            tinhId: record.tinh
                ? {value: record.tinh.id, label: record.tinh.ten}
                : null,
        });

        setModalVisible(true);
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            const payload = {
                ...values,
                tinhId: values.tinhId.value, // ⚠️ lấy ID
            };

            if (editingXa) {
                await suaXa(editingXa.id, payload);
                message.success("Cập nhật thành công");
            } else {
                await themXa(payload);
                message.success("Thêm xã thành công");
            }

            setModalVisible(false);
            form.resetFields();
            setEditingXa(null);
            fetchData(pagination.current, pagination.pageSize);
        } catch (e) {
            message.error(e.message || "Lỗi");
        }
    };

    /* --------------------------------------------
     * 6. IMPORT / DOWNLOAD
     * -------------------------------------------- */
    const handleDownloadTemplate = async () => {
        try {
            await layFileImport();
        } catch (e) {
            message.error(e.message);
        }
    };

    const handleImportFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setImporting(true);
            await importXa(formData);
            message.success("Import thành công");
            fetchData(pagination.current, pagination.pageSize);
        } catch (err) {
            message.error(err.message || "Lỗi import");
        } finally {
            setImporting(false);
            e.target.value = null;
        }
    };

    /* --------------------------------------------
     * 7. INFINITE SCROLL SELECT
     * -------------------------------------------- */
    const handleTinhScroll = (e) => {
        const target = e.target;
        if (
            target.scrollTop + target.offsetHeight >= target.scrollHeight - 5 &&
            dsTinh.length < tinhPagi.total
        ) {
            setTinhPagi(prev => ({...prev, page: prev.page + 1}));
        }
    };

    /* --------------------------------------------
     * 8. EFFECTS
     * -------------------------------------------- */
    useEffect(() => {
        fetchData();
        setPageInfo({title: 'Xã / Phường'})
    }, []);

    useEffect(() => {
        fetchData(1, pagination.pageSize, debouncedSearch);
    }, [debouncedSearch]);

    useEffect(() => {
        if (searchTinhRef.current) clearTimeout(searchTinhRef.current);
        searchTinhRef.current = setTimeout(() => fetchTinh(true), 300);
        return () => clearTimeout(searchTinhRef.current);
    }, [searchTinh]);

    useEffect(() => {
        if (tinhPagi.page > 1) fetchTinh(false);
    }, [tinhPagi.page]);

    /* --------------------------------------------
     * 9. UI
     * -------------------------------------------- */
    return (
        <div style={{padding: 16}}>

            {/* SEARCH + ACTION */}
            <div style={{marginBottom: 16, display: "flex", justifyContent: "space-between"}}>
                <Input.Search
                    placeholder="Tìm kiếm xã..."
                    allowClear
                    style={{width: 300}}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                <div style={{display: "flex", gap: 8}}>
                    <Button type="primary" hidden={!hasPermission('xa:create')} onClick={() => {
                        setModalVisible(true);
                        form.resetFields();
                        setEditingXa(null);
                    }}>
                        Thêm xã
                    </Button>

                    <Button onClick={handleDownloadTemplate}>Tải file mẫu</Button>

                    <Button onClick={() => fileInputRef.current.click()} loading={importing}>
                        Import file
                    </Button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept=".xlsx"
                        onChange={handleImportFile}
                    />
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
                onChange={(pag) => fetchData(pag.current, pag.pageSize)}
                scroll={{x: "max-content"}}
            />

            {/* ADD / EDIT */}
            <Modal
                title={editingXa ? "Sửa xã" : "Thêm xã"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingXa(null);
                }}
                okText={!editingXa ? 'Thêm' : 'Cập nhật'}
                cancelText={'Thoát'}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tên xã"
                        name="ten"
                        rules={[{required: true, message: "Vui lòng nhập tên xã"}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Tỉnh/Thành phố"
                        name="tinhId"
                        rules={[{required: true, message: "Vui lòng chọn tỉnh/thành phố"}]}
                    >
                        <Select
                            showSearch
                            labelInValue
                            placeholder="Chọn tỉnh/thành phố"
                            onSearch={setSearchTinh}
                            filterOption={false}
                            onPopupScroll={handleTinhScroll}
                        >
                            {dsTinh.map(t => (
                                <Select.Option key={t.id} value={t.id}>
                                    {t.ten}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Ghi chú" name="ghiChu">
                        <Input/>
                    </Form.Item>
                </Form>
            </Modal>

            {/* DELETE */}
            <Modal
                title="Xác nhận xóa"
                open={deleteModalVisible}
                onOk={async () => {
                    try {
                        await xoaXa(deletingId);
                        message.success("Xóa thành công");
                        fetchData(pagination.current, pagination.pageSize);
                    } finally {
                        setDeleteModalVisible(false);
                        setDeletingId(null);
                    }
                }}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setDeletingId(null);
                }}
                okButtonProps={{danger: true}}
                okText={'Xóa'}
                cancelText={'Thoát'}
            >
                Bạn có chắc muốn xóa xã này không?
            </Modal>
        </div>
    );
}

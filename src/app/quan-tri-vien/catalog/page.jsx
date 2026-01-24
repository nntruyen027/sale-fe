'use client';

import {useEffect, useState} from "react";
import {App, Button, Dropdown, Form, Image, Input, Modal, Table} from "antd";
import {DeleteOutlined, EditOutlined, EllipsisOutlined, EyeOutlined} from "@ant-design/icons";
import {layDsCatalog, suaCatalog, themCatalog, xoaCatalog} from "@/services/quan-tri-vien/catalog";
import {useDebounce} from "@/hook/data";
import {usePermission} from "@/hook/usePermission";
import {usePageInfoStore} from "@/store/page-info";
import FileUploadUrl from "@/app/components/common/FileUploadUrl";

export default function Page() {
    const setPageInfo = usePageInfoStore(state => state.setPageInfo)

    // -----------------------------
    // STATE
    // -----------------------------
    const {message} = App.useApp();
    const {hasPermission} = usePermission();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewSize, setPreviewSize] = useState(null);


    const [modalVisible, setModalVisible] = useState(false);
    const [editingCatalog, setEditingCatalog] = useState(null);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 400);

    const [form] = Form.useForm();


    // -----------------------------
    // FETCH TABLE DATA
    // -----------------------------
    const fetchData = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const res = await layDsCatalog({page, limit: pageSize, search});
            setData(res.data || []);
            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách catalog");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, pagination.pageSize, debouncedSearch);
    }, [debouncedSearch]);

    useEffect(() => {
        fetchData();
        setPageInfo({
            title: 'Catalog',
        })
    }, []);

    // -----------------------------
    // HANDLERS
    // -----------------------------
    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            const payload = {
                ...values,
                parentId: values.parentId?.value || null
            };

            delete payload.parentId?.label;

            if (editingCatalog) {
                await suaCatalog(editingCatalog.id, payload);
                message.success("Cập nhật thành công");
            } else {
                await themCatalog(payload);
                message.success("Thêm catalog thành công");
            }

            setModalVisible(false);
            setEditingCatalog(null);
            form.resetFields();
            fetchData(pagination.current, pagination.pageSize, debouncedSearch);

        } catch (e) {
            message.error(e.message || "Lỗi");
        }
    };

    const handleEdit = (record) => {
        setEditingCatalog(record);


        form.setFieldsValue({
            tieuDe: record.tieuDe,
            anhBia: record.anhBia,
            url: record.url,
        });

        setModalVisible(true);
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const handleView = (url) => {
        setPreviewOpen(true)
        setPreviewUrl(url)
    }

    const confirmDelete = async () => {
        try {
            await xoaCatalog(deletingId);
            message.success("Xóa thành công");

            if (data.length === 1 && pagination.current > 1)
                fetchData(pagination.current - 1, pagination.pageSize, debouncedSearch);
            else
                fetchData(pagination.current, pagination.pageSize, debouncedSearch);

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
                (pagination.current - 1) * pagination.pageSize + index + 1
        },
        {title: "Tiêu đề", dataIndex: "tieuDe"},
        {
            title: "Ảnh bìa",
            dataIndex: "anhBia",
            width: 90,
            render: (anhBia, record) => anhBia ? <Image src={anhBia} alt={record.tieuDe} width={60}/> : null
        },
        {
            title: "Ngày tạo",
            dataIndex: "ngayTao",
        },
        {
            title: "Thao tác",
            width: 100,
            render: (_, record) => {
                const items = [];

                if (hasPermission('catalog:read')) {
                    items.push({
                        key: "view",
                        label: "Xem",
                        icon: <EyeOutlined/>,
                        onClick: () => handleView(record.url)
                    })
                }

                if (hasPermission('catalog:update')) {
                    items.push({
                        key: "edit",
                        label: "Cập nhật",
                        icon: <EditOutlined/>,
                        onClick: () => handleEdit(record)
                    });
                }

                if (hasPermission('catalog:delete')) {
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
                <Input.Search
                    placeholder="Tìm catalog..."
                    allowClear
                    style={{width: 300}}
                    onChange={e => setSearchText(e.target.value)}
                />

                <Button
                    type="primary"
                    hidden={!hasPermission('catalog:create')}
                    onClick={() => {
                        setEditingCatalog(null);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                >
                    Thêm catalog
                </Button>
            </div>

            <Table
                style={{marginTop: 16}}
                size="small"
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={pagination}
                onChange={p => fetchData(p.current, p.pageSize, debouncedSearch)}
            />

            {/* ADD / EDIT MODAL */}
            <Modal
                title={editingCatalog ? "Sửa catalog" : "Thêm catalog"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingCatalog(null);
                    form.resetFields();
                }}
                okText={editingCatalog ? 'Cập nhật' : 'Thêm'}
                cancelText={'Thoát'}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tiêu đề"
                        name="tieuDe"
                        rules={[{required: true, message: "Vui lòng nhập tiêu đề"}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Ảnh bìa"
                        name="anhBia"
                    >
                        <FileUploadUrl accept={'image/*'}/>
                    </Form.Item>

                    <Form.Item
                        label="Tệp tin"
                        name="url"
                        rules={[{required: true, message: "Vui lòng nhập file"}]}
                    >
                        <Input/>
                    </Form.Item>


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
                Bạn có chắc muốn xóa catalog này không?
            </Modal>
            <Modal
                open={previewOpen}
                footer={null}
                centered
                onCancel={() => setPreviewOpen(false)}
                width="100vw"
                styles={{body: {height: "95vh", padding: 0}}}
            >
                <iframe
                    src={previewUrl}
                    style={{width: "100%", height: "100%", border: "none"}}
                />
            </Modal>


        </div>
    );
}

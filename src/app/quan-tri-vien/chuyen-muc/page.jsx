'use client';

import {useEffect, useState} from "react";
import {App, Button, Dropdown, Form, Input, Modal, Select, Table} from "antd";
import {DeleteOutlined, EditOutlined, EllipsisOutlined} from "@ant-design/icons";
import {layDsChuyenMuc, suaChuyenMuc, themChuyenMuc, xoaChuyenMuc} from "@/services/quan-tri-vien/chuyen-muc";
import {useDebounce} from "@/hook/data";
import {usePermission} from "@/hook/usePermission";
import {usePageInfoStore} from "@/store/page-info";

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

    const [modalVisible, setModalVisible] = useState(false);
    const [editingChuyenMuc, setEditingChuyenMuc] = useState(null);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 400);

    const [form] = Form.useForm();

    // -----------------------------
    // PARENT SELECT STATE
    // -----------------------------
    const [parentOptions, setParentOptions] = useState([]);
    const [parentLoading, setParentLoading] = useState(false);
    const [parentPage, setParentPage] = useState(1);
    const [parentHasMore, setParentHasMore] = useState(true);
    const [parentSearch, setParentSearch] = useState("");

    // -----------------------------
    // FETCH TABLE DATA
    // -----------------------------
    const fetchData = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const res = await layDsChuyenMuc({page, limit: pageSize, search});
            setData(res.data || []);
            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách chuyên mục");
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
            title: 'Chuyên mục',
        })
    }, []);

    // -----------------------------
    // FETCH PARENT OPTIONS
    // -----------------------------
    const fetchParentOptions = async ({page = 1, search = "", append = false}) => {
        if (parentLoading) return;

        setParentLoading(true);
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
            setParentLoading(false);
        }
    };

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

            if (editingChuyenMuc) {
                await suaChuyenMuc(editingChuyenMuc.id, payload);
                message.success("Cập nhật thành công");
            } else {
                await themChuyenMuc(payload);
                message.success("Thêm chuyên mục thành công");
            }

            setModalVisible(false);
            setEditingChuyenMuc(null);
            form.resetFields();
            fetchData(pagination.current, pagination.pageSize, debouncedSearch);

        } catch (e) {
            message.error(e.message || "Lỗi");
        }
    };

    const handleEdit = (record) => {
        setEditingChuyenMuc(record);

        // set option cha để hiển thị label
        if (record.parent) {
            setParentOptions([{
                label: record.parent.ten,
                value: record.parent.id
            }]);
        } else {
            setParentOptions([]);
        }

        form.setFieldsValue({
            ten: record.ten,
            slug: record.slug,
            parentId: record.parent
                ? {label: record.parent.ten, value: record.parent.id}
                : null
        });

        setModalVisible(true);
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        try {
            await xoaChuyenMuc(deletingId);
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
        {title: "Tên", dataIndex: "ten"},
        {
            title: "Slug",
            dataIndex: "slug",
        },
        {
            title: "Chuyên mục cha",
            dataIndex: "parent",
            render: parent => parent?.ten
        },
        {
            title: "Thao tác",
            width: 100,
            render: (_, record) => {
                const items = [];

                if (hasPermission('btype:update')) {
                    items.push({
                        key: "edit",
                        label: "Cập nhật",
                        icon: <EditOutlined/>,
                        onClick: () => handleEdit(record)
                    });
                }

                if (hasPermission('btype:delete')) {
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
                    placeholder="Tìm chuyên mục..."
                    allowClear
                    style={{width: 300}}
                    onChange={e => setSearchText(e.target.value)}
                />

                <Button
                    type="primary"
                    hidden={!hasPermission('btype:create')}
                    onClick={() => {
                        setEditingChuyenMuc(null);
                        setParentOptions([]);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                >
                    Thêm chuyên mục
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
                title={editingChuyenMuc ? "Sửa chuyên mục" : "Thêm chuyên mục"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingChuyenMuc(null);
                    form.resetFields();
                }}
                okText={editingChuyenMuc ? 'Cập nhật' : 'Thêm'}
                cancelText={'Thoát'}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tên"
                        name="ten"
                        rules={[{required: true, message: "Vui lòng nhập tên"}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Slug"
                        name="slug"
                        rules={[{required: true, message: "Vui lòng nhập slug"}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item label="Chuyên mục cha" name="parentId">
                        <Select
                            showSearch
                            allowClear
                            labelInValue
                            placeholder="Chọn chuyên mục cha"
                            loading={parentLoading}
                            options={parentOptions}
                            filterOption={false}
                            onSearch={(value) => {
                                setParentSearch(value);
                                fetchParentOptions({page: 1, search: value});
                            }}
                            onDropdownVisibleChange={(open) => {
                                if (open && parentOptions.length === 0) {
                                    fetchParentOptions({page: 1});
                                }
                            }}
                            onPopupScroll={(e) => {
                                const target = e.target;
                                if (
                                    target.scrollTop + target.offsetHeight >=
                                    target.scrollHeight - 10 &&
                                    parentHasMore
                                ) {
                                    fetchParentOptions({
                                        page: parentPage + 1,
                                        search: parentSearch,
                                        append: true
                                    });
                                }
                            }}
                        />
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
                Bạn có chắc muốn xóa chuyên mục này không?
            </Modal>
        </div>
    );
}

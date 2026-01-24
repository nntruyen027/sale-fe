'use client';

import {useEffect, useState} from "react";
import {App, Button, Dropdown, Form, Image, Input, Modal, Select, Table} from "antd";
import {BlockOutlined, DeleteOutlined, EditOutlined, EllipsisOutlined} from "@ant-design/icons";
import {layDsSanPham, suaSanPham, themSanPham, xoaSanPham} from "@/services/quan-tri-vien/san-pham";
import {useDebounce} from "@/hook/data";
import {usePermission} from "@/hook/usePermission";
import FileUploadUrl from "@/app/components/common/FileUploadUrl";
import {usePageInfoStore} from "@/store/page-info";
import {useLoaiSpSelect} from "@/hook/useLoaiSp";
import BienTheManager from "@/app/quan-tri-vien/san-pham/BienTheManager";

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
    const [editingSanPham, setEditingSanPham] = useState(null);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 400);

    const [variantOpen, setVariantOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);


    const [form] = Form.useForm();
    const {
        dsLoaiSp,
        loading: loaiLoading,
        hasMore,
        setSearchLoaiSp,
        loadMore,
    } = useLoaiSpSelect();


    // -----------------------------
    // FETCH TABLE DATA
    // -----------------------------
    const fetchData = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const res = await layDsSanPham({page, limit: pageSize, search});
            setData(res.data || []);
            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách sản phẩm");
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
            title: 'Sản phẩm',
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

            if (editingSanPham) {
                await suaSanPham(editingSanPham.id, payload);
                message.success("Cập nhật thành công");
            } else {
                await themSanPham(payload);
                message.success("Thêm sản phẩm thành công");
            }

            setModalVisible(false);
            setEditingSanPham(null);
            form.resetFields();
            fetchData(pagination.current, pagination.pageSize, debouncedSearch);

        } catch (e) {
            message.error(e.message || "Lỗi");
        }
    };

    const handleEdit = (record) => {
        setEditingSanPham(record);

        record.loaiId = record.loai.id;

        form.setFieldsValue(record);

        setModalVisible(true);
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const reloadSanPhamVaBienThe = async () => {
        const res = await layDsSanPham({
            page: pagination.current,
            limit: pagination.pageSize,
            search: debouncedSearch,
        });

        setData(res.data);

        // 👉 tìm lại sản phẩm đang mở modal
        if (currentProduct) {
            const spMoi = res.data.find(sp => sp.id === currentProduct?.id);
            if (spMoi) {
                setCurrentProduct(spMoi); // ✅ đổi reference
            }
        }
    };


    const confirmDelete = async () => {
        try {
            await xoaSanPham(deletingId);
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
            title: "Hình ảnh",
            dataIndex: "hinhAnh",
            render: (text, record) =>
                text ? <Image src={text} alt={record.ten} width={60}/> : null
        },
        {
            title: "Loại",
            dataIndex: "loai",
            render: loai => loai?.ten
        },
        {
            title: "Mô tả",
            dataIndex: "moTa",
            render: (moTa) => {
                if (!moTa) return null;

                const words = moTa.trim().split(/\s+/);

                if (words.length <= 20) return moTa;

                return words.slice(0, 20).join(" ") + " ...";
            }
        }
        ,
        {
            title: "Thao tác",
            width: 100,
            render: (_, record) => {
                const items = [];

                if (hasPermission('product:update')) {
                    items.push({
                        key: "edit",
                        label: "Cập nhật",
                        icon: <EditOutlined/>,
                        onClick: () => handleEdit(record)
                    });
                }

                if (hasPermission('product:update')) {
                    items.push({
                            key: "phien-ban",
                            label: "Phiên bản",
                            icon: <BlockOutlined/>,
                            onClick: () => {
                                setCurrentProduct(record);
                                setVariantOpen(true);
                            }
                        }
                    )
                }

                if (hasPermission('product:delete')) {
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
                    placeholder="Tìm sản phẩm..."
                    allowClear
                    style={{width: 300}}
                    onChange={e => setSearchText(e.target.value)}
                />

                <Button
                    type="primary"
                    hidden={!hasPermission('product:create')}
                    onClick={() => {
                        setEditingSanPham(null);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                >
                    Thêm sản phẩm
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
                title={editingSanPham ? "Sửa sản phẩm" : "Thêm sản phẩm"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingSanPham(null);
                    form.resetFields();
                }}
                okText={editingSanPham ? 'Cập nhật' : 'Thêm'}
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

                    <Form.Item label="Hình ảnh" name="hinhAnh">
                        <FileUploadUrl accept={'image/*'}/>
                    </Form.Item>
                    <Form.Item label={'Loại sản phẩm'} name={'loaiId'}>
                        <Select
                            showSearch
                            allowClear
                            placeholder="Chọn loại sản phẩm"
                            loading={loaiLoading}
                            filterOption={false}
                            options={dsLoaiSp.map(item => ({
                                label: item.ten,
                                value: item.id,
                            }))}
                            onSearch={setSearchLoaiSp}
                            onPopupScroll={(e) => {
                                const target = e.target;
                                if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 10) {
                                    loadMore();
                                }
                            }}
                        />
                    </Form.Item>
                    <Form.Item label={'Mô tả'} name={'moTa'}>
                        <Input.TextArea/>
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
                Bạn có chắc muốn xóa sản phẩm này không?
            </Modal>

            <BienTheManager
                sanPhamId={currentProduct?.id}
                open={variantOpen}
                onClose={() => {
                    setVariantOpen(false);
                    setCurrentProduct(null);
                }}
                onReload={reloadSanPhamVaBienThe}
            />

        </div>
    );
}

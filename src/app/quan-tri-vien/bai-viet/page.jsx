'use client';

import {useEffect, useState} from "react";
import {App, Button, Dropdown, Input, Modal, Table, Tag} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    EllipsisOutlined,
    GlobalOutlined,
    LockOutlined,
    SendOutlined
} from "@ant-design/icons";
import {useDebounce} from "@/hook/data";
import {usePermission} from "@/hook/usePermission";
import {usePageInfoStore} from "@/store/page-info";

import {layDsBaiViet, suaBaiViet, xoaBaiViet} from "@/services/quan-tri-vien/bai-viet";

import BaiVietModal from "./BaiVietModal";

const STATUS_CONFIG = {
    PUBLIC: {
        label: 'Khóa',
        icon: <LockOutlined/>,
    },
    DRAFT: {
        label: 'Công khai',
        icon: <SendOutlined/>,
    },
    DEFAULT: {
        label: 'Công khai',
        icon: <GlobalOutlined/>,
    },
};

export default function Page() {
    const setPageInfo = usePageInfoStore(state => state.setPageInfo);
    const {message} = App.useApp();
    const {hasPermission} = usePermission();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 400);

    const [modalOpen, setModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editing, setEditing] = useState(null);

    const fetchData = async (page = 1, size = 10, search = "") => {
        setLoading(true);
        try {
            const res = await layDsBaiViet({
                page,
                size,
                search
            });

            setData(res.data || []);
            setPagination({
                current: res.page,
                pageSize: res.size,
                total: res.totalElements
            });
        } catch (e) {
            message.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, pagination.pageSize, debouncedSearch);
    }, [debouncedSearch]);

    useEffect(() => {
        fetchData();
        setPageInfo({title: "Bài viết"});
    }, []);

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        try {
            await xoaBaiViet(deletingId);
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

    const confirmChangeStatus = async () => {
        try {
            if (editing.trangThai === 'PUBLIC')
                editing.trangThai = 'HIDDEN';
            else
                editing.trangThai = 'PUBLIC';

            await suaBaiViet(editing.id, editing);
            message.success("Chuyển trạng thái thành công");

            fetchData(pagination.current, pagination.pageSize, debouncedSearch);

        } finally {
            setStatusModalOpen(false);
            setEditing(null);
        }
    };

    const columns = [
        {
            title: "#",
            width: 60,
            align: "right",
            render: (_, __, index) =>
                (pagination.current - 1) * pagination.pageSize + index + 1
        },
        {title: "Tiêu đề", dataIndex: "tieuDe"},
        {
            title: "Chuyên mục",
            dataIndex: "chuyenMuc",
            render: cm => cm?.ten
        },
        {
            title: "Trạng thái",
            dataIndex: "trangThai",
            render: st => <Tag color={st === 'PUBLIC' ? 'green' : 'default'}>{st}</Tag>
        },
        {title: "Lượt xem", dataIndex: "luotXem", width: 100},
        {
            title: "Thao tác",
            width: 100,
            render: (_, record) => {
                const items = [];

                if (hasPermission('blog:update')) {
                    items.push({
                        key: 'edit',
                        label: 'Sửa',
                        icon: <EditOutlined/>,
                        onClick: () => {
                            setEditing(record);
                            setModalOpen(true);
                        }
                    });
                }

                if (hasPermission('blog:update')) {
                    const config = STATUS_CONFIG[record.trangThai] || STATUS_CONFIG.DEFAULT;

                    items.push({
                        key: 'change-status',
                        label: config.label,
                        icon: config.icon,
                        onClick: () => {
                            setEditing(record);
                            setStatusModalOpen(true);
                        },
                    });
                }

                if (hasPermission('blog:delete')) {
                    items.push({
                        key: 'delete',
                        label: 'Xóa',
                        danger: true,
                        icon: <DeleteOutlined/>,
                        onClick: () => handleDelete(record.id)
                    });
                }


                return (
                    <Dropdown menu={{items}}>
                        <Button type="text" icon={<EllipsisOutlined/>}/>
                    </Dropdown>
                );
            }
        }
    ];

    return (
        <div style={{padding: 16}}>
            <div className="flex justify-between">
                <Input.Search
                    placeholder="Tìm bài viết..."
                    allowClear
                    style={{width: 300}}
                    onChange={e => setSearchText(e.target.value)}
                />

                <Button
                    type="primary"
                    hidden={!hasPermission('blog:create')}
                    onClick={() => {
                        setEditing(null);
                        setModalOpen(true);
                    }}
                >
                    Thêm bài viết
                </Button>
            </div>

            <Table
                style={{marginTop: 16}}
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data}
                pagination={pagination}
                onChange={p => fetchData(p.current, p.pageSize, debouncedSearch)}
            />

            <BaiVietModal
                open={modalOpen}
                data={editing}
                onClose={() => setModalOpen(false)}
                onSuccess={() => {
                    setModalOpen(false);
                    fetchData(pagination.current, pagination.pageSize, debouncedSearch);
                }}
            />

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
                Bạn có chắc muốn xóa bài viết này không?
            </Modal>

            <Modal
                title={`Xác nhận ${editing?.trangThai === 'Công khai' ? 'công khai' : 'khóa'} bài viết`}
                open={statusModalOpen}
                onOk={confirmChangeStatus}
                onCancel={() => setStatusModalOpen(false)}
                okText={editing?.trangThai === 'Công khai' ? 'Công khai' : 'Khóa'}
                cancelText={'Thoát'}
            >
                {`Bạn có chắc muốn ${editing?.trangThai === 'công khai' ? 'công khai' : 'khóa'} bài viết này không?`}
            </Modal>
        </div>
    );
}

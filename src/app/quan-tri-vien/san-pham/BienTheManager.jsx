"use client";

import {useEffect, useState} from "react";
import {Button, Modal, Popconfirm, Table} from "antd";
import {laySanPham, xoaBienThem} from "@/services/quan-tri-vien/san-pham";
import {DeleteOutlined, EditOutlined} from '@ant-design/icons'
import BienTheFormModal from "./BienTheFormModal";

export default function BienTheManager({sanPhamId, open, onClose, onReload}) {
    const [sanPham, setSanPham] = useState(null);
    const [dsBienThe, setDsBienThe] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    /* ================= LOAD PRODUCT ================= */
    const loadSanPham = async () => {
        if (!sanPhamId) return;

        setLoading(true);
        try {
            const sp = await laySanPham(sanPhamId);
            setSanPham(sp);
            setDsBienThe(sp?.bienThe || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) loadSanPham();
    }, [open, sanPhamId]);

    /* ================= TABLE ================= */
    const columns = [
        {title: "SKU", dataIndex: "sku"},
        {
            title: "Hình ảnh",
            dataIndex: "hinhAnh",
            render: img => img ? <img src={img} width={40}/> : null
        },
        {title: "Màu", dataIndex: "mauSac"},
        {title: "Size", dataIndex: "kichCo"},
        {title: "Giá", dataIndex: "gia"},
        {title: "Tồn kho", dataIndex: "tonKho"},
        {
            title: "Thao tác",
            width: 120,
            align: "center",
            render: (_, record) => (
                <>
                    <Button
                        type="link"
                        onClick={() => {
                            setEditing(record);
                            setFormOpen(true);
                        }}
                    >
                        <EditOutlined/>
                    </Button>

                    <Popconfirm
                        title="Xóa phiên bản?"
                        onConfirm={async () => {
                            await xoaBienThem(sanPhamId, record.id);
                            await loadSanPham(); // 🔥 reload tại chỗ
                        }}
                    >
                        <Button danger type="link">
                            <DeleteOutlined/>
                        </Button>
                    </Popconfirm>
                </>
            )
        }
    ];

    return (
        <>
            {/* MODAL CHA */}
            <Modal
                title={`Phiên bản - ${sanPham?.ten || ""}`}
                open={open}
                onCancel={onClose}
                width={900}
                onOk={() => {
                    setEditing(null);
                    setFormOpen(true);
                }}
                okText={'Thêm biên bản'}
                cancelText={'Thoát'}

            >
                <Table
                    rowKey="id"
                    size="small"
                    loading={loading}
                    columns={columns}
                    dataSource={dsBienThe}
                    pagination={false}
                />
            </Modal>

            {/* MODAL CON */}
            <BienTheFormModal
                open={formOpen}
                sanPhamId={sanPhamId}
                editing={editing}
                onClose={() => {
                    setFormOpen(false);
                    setEditing(null);
                }}
                onSuccess={async () => {
                    setFormOpen(false);
                    setEditing(null);
                    onReload()
                    await loadSanPham(); // 🔥 reload lại biến thể
                }}
            />
        </>
    );
}

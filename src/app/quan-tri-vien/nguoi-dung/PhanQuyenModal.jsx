"use client";

import {Input, Modal, Table} from "antd";
import {useEffect, useState} from "react";
import {layDsVaiTro} from "@/services/quan-tri-vien/vai-tro";
import {useDebounce} from "@/hook/data";

export default function PhanVaiTroModal({
                                            modalVisible,
                                            onOk,
                                            handleCancel,
                                            object // người dùng
                                        }) {

    /* ================= STATE ================= */
    const [dsVaiTro, setDsVaiTro] = useState([]);
    const [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    /* ================= FETCH ================= */
    const fetchVaiTro = async (page = 1, pageSize = 10, keyword = "") => {
        setLoading(true);
        try {
            const res = await layDsVaiTro({
                page,
                limit: pageSize,
                search: keyword,
            });

            setDsVaiTro(res.data || []);
            setPagination({
                current: res.page,
                pageSize: res.size,
                total: res.totalElements || 0,
            });
        } finally {
            setLoading(false);
        }
    };

    /* ================= EFFECT ================= */

    // 🔥 Mở modal → load dữ liệu + tick sẵn quyền đã có
    useEffect(() => {
        if (modalVisible) {
            setSearch("");
            fetchVaiTro(1, pagination.pageSize, "");

            if (object?.roles) {
                setSelectedRowKeys(object.roles); // phải là array code
            }
        } else {
            // ✅ chỉ reset khi ĐÓNG modal
            setSelectedRowKeys([]);
        }
    }, [modalVisible]);

    // 🔹 search
    useEffect(() => {
        if (modalVisible) {
            fetchVaiTro(1, pagination.pageSize, debouncedSearch);
        }
    }, [debouncedSearch]);

    /* ================= TABLE ================= */

    const columns = [
        {title: "ID", dataIndex: "id", width: 60},
        {title: "Vai trò", dataIndex: "name"},
        {title: "Mã", dataIndex: "code"},
    ];

    return (
        <Modal
            title={`Phân quyền - ${object?.hoTen || ""}`}
            open={modalVisible}
            onOk={() => onOk(selectedRowKeys)}
            onCancel={handleCancel}
            width={420}
            destroyOnClose={false} // ⚠️ giữ state
        >
            <Input.Search
                placeholder="Tìm quyền..."
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{marginBottom: 12}}
            />

            <Table
                size="small"
                rowKey="code"
                columns={columns}
                dataSource={dsVaiTro}
                loading={loading}
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                    preserveSelectedRowKeys: true, // ⭐ QUAN TRỌNG
                }}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: (page, pageSize) =>
                        fetchVaiTro(page, pageSize, debouncedSearch),
                }}
            />
        </Modal>
    );
}

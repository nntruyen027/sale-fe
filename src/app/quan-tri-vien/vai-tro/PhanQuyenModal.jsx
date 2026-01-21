"use client";

import {Input, Modal, Table} from "antd";
import {useEffect, useState} from "react";
import {layDsQuyen} from "@/services/quan-tri-vien/quyen";
import {useDebounce} from "@/hook/data";

export default function PhanQuyenModal({
                                           modalVisible,
                                           onOk,
                                           handleCancel,
                                           object // vai trò
                                       }) {

    /* ================= STATE ================= */
    const [dsQuyen, setDsQuyen] = useState([]);
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
    const fetchQuyen = async (page = 1, pageSize = 10, keyword = "") => {
        setLoading(true);
        try {
            const res = await layDsQuyen({
                page,
                limit: pageSize,
                search: keyword,
            });

            setDsQuyen(res.data || []);
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

    // 🔥 Mở modal → load quyền + tick sẵn
    useEffect(() => {
        if (modalVisible) {
            setSearch("");
            fetchQuyen(1, pagination.pageSize, "");

            if (object?.permissions) {
                setSelectedRowKeys(object.permissions); // array code
            }
        } else {
            // ✅ chỉ reset khi đóng modal
            setSelectedRowKeys([]);
        }
    }, [modalVisible]);

    // 🔹 search
    useEffect(() => {
        if (modalVisible) {
            fetchQuyen(1, pagination.pageSize, debouncedSearch);
        }
    }, [debouncedSearch]);

    /* ================= TABLE ================= */

    const columns = [
        {title: "ID", dataIndex: "id", width: 60},
        {title: "Mã quyền", dataIndex: "code"},
    ];

    return (
        <Modal
            title={`Phân quyền - ${object?.name || ""}`}
            open={modalVisible}
            onOk={() => onOk(selectedRowKeys)}
            onCancel={handleCancel}
            width={420}
            destroyOnClose={false} // ⭐ không phá state
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
                dataSource={dsQuyen}
                loading={loading}
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                    preserveSelectedRowKeys: true, // ⭐ FIX MẤT CHECKBOX
                }}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: (page, pageSize) =>
                        fetchQuyen(page, pageSize, debouncedSearch),
                }}
            />
        </Modal>
    );
}

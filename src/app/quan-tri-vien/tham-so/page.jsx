'use client';

import {useEffect, useState} from "react";
import {App, Button, DatePicker, Dropdown, Form, Input, Modal, Select, Switch, Table, Tag} from "antd";
import {DeleteOutlined, EditOutlined, EllipsisOutlined} from "@ant-design/icons";
import {layDsThamSo, suaThamSo, themThamSo, xoaThamSo} from "@/services/quan-tri-vien/tham-so";
import {useDebounce} from "@/hook/data";
import {usePermission} from "@/hook/usePermission";
import dayjs from "dayjs";
import {usePageInfoStore} from "@/store/page-info";

const DATA_TYPES = [
    "STRING",
    "NUMBER",
    "LOCAL_DATE",
    "LOCAL_DATETIME",
    "BOOLEAN",
    "OBJECT",
    "ARRAY",
];

export default function Page() {

    // -----------------------------
    // STATE
    // -----------------------------
    const {message} = App.useApp();
    const {setPageInfo} = usePageInfoStore();
    const {hasPermission} = usePermission();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [editingThamSo, setEditingThamSo] = useState(null);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 400);

    const [form] = Form.useForm();

    // -----------------------------
    // FETCH DATA
    // -----------------------------
    const fetchData = async (page = 1, pageSize = 10, search = "") => {
        setLoading(true);
        try {
            const res = await layDsThamSo({page, limit: pageSize, search});
            setData(res.data || []);
            setPagination({
                current: res.page || page,
                pageSize: res.size || pageSize,
                total: res.totalElements || 0,
            });
        } catch (e) {
            message.error(e.message || "Lỗi khi tải danh sách tham số");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, pagination.pageSize, debouncedSearch);
    }, [debouncedSearch]);

    useEffect(() => {
        setPageInfo(
            {
                title: 'Tham số'
            }
        )
        fetchData();
    }, []);

    // -----------------------------
    // HANDLERS
    // -----------------------------
    const handleOk = async () => {
        try {
            const values = await form.validateFields();


            // parse JSON
            if (values.kieuDuLieu === "OBJECT" || values.kieuDuLieu === "ARRAY") {
                values.giaTri = JSON.parse(values.giaTri);
            }

            if (editingThamSo) {
                await suaThamSo(editingThamSo.id, values);
                message.success("Cập nhật thành công");
            } else {
                await themThamSo(values);
                message.success("Thêm tham số thành công");
            }

            setModalVisible(false);
            setEditingThamSo(null);
            form.resetFields();
            fetchData(pagination.current, pagination.pageSize, debouncedSearch);

        } catch (e) {
            message.error(e.message || "Lỗi");
        }
    };

    const handleEdit = (record) => {
        setEditingThamSo(record);

        form.setFieldsValue({
            ...record,
            giaTri:
                record.kieuDuLieu === "LOCAL_DATE" ||
                record.kieuDuLieu === "LOCAL_DATETIME"
                    ? dayjs(record.giaTri)
                    : (typeof record.giaTri === "object"
                        ? JSON.stringify(record.giaTri, null, 2)
                        : record.giaTri),
        });

        setModalVisible(true);
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        try {
            await xoaThamSo(deletingId);
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
    // HELPERS
    // -----------------------------
    const renderGiaTriInput = (kieu) => {
        switch (kieu) {
            case "STRING":
                return <Input/>;
            case "NUMBER":
                return <Input type="number"/>;
            case "LOCAL_DATE":
                return <DatePicker style={{width: "100%"}}/>;
            case "LOCAL_DATETIME":
                return <DatePicker showTime style={{width: "100%"}}/>;
            case "BOOLEAN":
                return <Switch checkedChildren="TRUE" unCheckedChildren="FALSE"/>;
            case "OBJECT":
            case "ARRAY":
                return <Input.TextArea rows={4} placeholder="Nhập JSON hợp lệ"/>;
            default:
                return <Input/>;
        }
    };

    const validateGiaTri = (_, value) => {
        const kieu = form.getFieldValue("kieuDuLieu");

        if (value === undefined || value === null || value === "") {
            return Promise.reject("Vui lòng nhập giá trị");
        }

        if (kieu === "NUMBER" && isNaN(Number(value))) {
            return Promise.reject("Phải là số");
        }

        if (kieu === "OBJECT" || kieu === "ARRAY") {
            try {
                const parsed = JSON.parse(value);
                if (kieu === "ARRAY" && !Array.isArray(parsed))
                    return Promise.reject("Phải là JSON Array");
                if (kieu === "OBJECT" && Array.isArray(parsed))
                    return Promise.reject("Phải là JSON Object");
            } catch {
                return Promise.reject("JSON không hợp lệ");
            }
        }

        return Promise.resolve();
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
        {title: "Khóa", dataIndex: "khoa", width: 200},
        {title: "Kiểu dữ liệu", dataIndex: "kieuDuLieu", width: 200},
        {title: "Giá trị", dataIndex: "giaTri"},
        {
            title: "Trạng thái",
            dataIndex: "isEnable",
            render: (v) =>
                v ? <Tag color="processing">Hoạt động</Tag> : <Tag color="error">Khóa</Tag>
        },
        {
            title: "Thao tác",
            width: 100,
            render: (_, record) => {
                const items = [];

                if (hasPermission('param:update')) {
                    items.push({
                        key: "edit",
                        label: "Cập nhật",
                        icon: <EditOutlined/>,
                        onClick: () => handleEdit(record)
                    });
                }

                if (hasPermission('param:delete')) {
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
            <div className={'flex justify-between'}>
                <Input.Search
                    placeholder="Tìm tham số..."
                    allowClear
                    style={{width: 300, marginBottom: 16}}
                    onChange={e => setSearchText(e.target.value)}
                />

                <Button
                    type="primary"
                    hidden={!hasPermission('param:create')}
                    onClick={() => {
                        setEditingThamSo(null);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                >
                    Thêm tham số
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
                title={editingThamSo ? "Sửa tham số" : "Thêm tham số"}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingThamSo(null);
                    form.resetFields();
                }}
                okText={editingThamSo ? 'Cập nhật' : 'Thêm'}
                cancelText={'Thoát'}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onValuesChange={(changed) => {
                        if (changed.kieuDuLieu) {
                            form.setFieldValue("giaTri", null);
                        }
                    }}
                >
                    <Form.Item
                        label="Khóa"
                        name="khoa"
                        rules={[{required: true}]}
                    >
                        <Input disabled={!!editingThamSo}/>
                    </Form.Item>

                    <Form.Item
                        label="Kiểu dữ liệu"
                        name="kieuDuLieu"
                        rules={[{required: true}]}
                    >
                        <Select options={DATA_TYPES.map(t => ({label: t, value: t}))}/>
                    </Form.Item>

                    <Form.Item
                        noStyle
                        shouldUpdate={(p, c) => p.kieuDuLieu !== c.kieuDuLieu}
                    >
                        {({getFieldValue}) => {
                            const kieu = getFieldValue("kieuDuLieu");
                            if (!kieu) return null;

                            return (
                                <Form.Item
                                    label="Giá trị"
                                    name="giaTri"
                                    rules={[{validator: validateGiaTri}]}
                                    valuePropName={kieu === "BOOLEAN" ? "checked" : "value"}
                                >
                                    {renderGiaTriInput(kieu)}
                                </Form.Item>
                            );
                        }}
                    </Form.Item>

                    <Form.Item
                        name="isEnable"
                        label="Trạng thái"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa"/>
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
                Bạn có chắc muốn xóa tham số này không?
            </Modal>
        </div>
    );
}

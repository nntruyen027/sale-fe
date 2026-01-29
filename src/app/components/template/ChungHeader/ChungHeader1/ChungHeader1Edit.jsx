'use client';

import {Button, Divider, Input, message, Modal, Radio, Space, Tree, Typography} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined,} from '@ant-design/icons';
import {useEffect, useState} from 'react';
import {v4 as uuid} from 'uuid';
import {layChungHeader} from '@/services/public';
import {caiDatChungHeader} from '@/services/quan-tri-vien/thong-tin-he-thong';

const {Text} = Typography;

/* ================= MENU EDITOR ================= */
export default function ChungHeader1Edit() {

    /* ===== DATA ===== */
    const [menu, setMenu] = useState([]);

    /* ===== MODAL ===== */
    const [openModal, setOpenModal] = useState(false);
    const [editingNode, setEditingNode] = useState(null);
    const [stickyMode, setStickyMode] = useState('none');

    // { key } | { parentKey } | null

    const [form, setForm] = useState({label: '', url: ''});

    /* ================= LOAD MENU ================= */
    useEffect(() => {
        (async () => {
            try {
                const res = await layChungHeader();
                setMenu(res?.menu || []);
                setStickyMode(res.tickyMode || 'none');
            } catch {
                setMenu([]);
            }
        })();
    }, []);

    /* ================= HELPERS ================= */
    const resetForm = () => {
        setForm({label: '', url: ''});
    };

    const saveMenuToApi = async (newMenu, newSticky) => {
        try {
            await caiDatChungHeader({menu: newMenu, 'template': 'mau-1', 'tickyMode': newSticky});
            setMenu(newMenu);
            setStickyMode(newSticky);
            message.success('Lưu menu thành công');
        } catch (e) {
            message.error(e?.message || 'Lưu menu thất bại');
        }
    };

    /* ================= CRUD ================= */
    const addMenu = (parentKey = null) => {
        setEditingNode(parentKey ? {parentKey} : null);
        setForm({label: '', url: ''});
        setOpenModal(true);
    };

    const editMenu = (node) => {
        setEditingNode({key: node.key});
        setForm({
            label: node.label,
            url: node.url || '',
        });
        setOpenModal(true);
    };

    const deleteMenu = (key) => {
        Modal.confirm({
            title: 'Xoá menu?',
            content: 'Không thể hoàn tác',
            onOk: async () => {
                const remove = (list) =>
                    list
                        .filter(i => i.key !== key)
                        .map(i => ({
                            ...i,
                            children: i.children ? remove(i.children) : [],
                        }));

                await saveMenuToApi(remove(menu));
            },
        });
    };

    const submitMenu = async () => {
        if (!form.label) {
            return message.warning('Nhập tên menu');
        }

        const update = (list) =>
            list.map(item => {
                // ===== SỬA =====
                if (item.key === editingNode?.key) {
                    return {
                        ...item,
                        label: form.label,
                        url: form.url || undefined,
                    };
                }

                // ===== THÊM MENU CON =====
                if (item.key === editingNode?.parentKey) {
                    return {
                        ...item,
                        children: [
                            ...(item.children || []),
                            {
                                key: uuid(),
                                label: form.label,
                                url: form.url || undefined,
                                children: [],
                            },
                        ],
                    };
                }

                return {
                    ...item,
                    children: item.children ? update(item.children) : [],
                };
            });

        let newMenu = [];

        // ===== THÊM MENU GỐC =====
        if (!editingNode) {
            newMenu = [
                ...menu,
                {
                    key: uuid(),
                    label: form.label,
                    url: form.url || undefined,
                    children: [],
                },
            ];
        } else {
            newMenu = update(menu);
        }

        await saveMenuToApi(newMenu);
        setOpenModal(false);
        setEditingNode(null);
        resetForm();
    };

    /* ================= DRAG ================= */
    const onDrop = async (info) => {
        const loop = (list, key, cb) => {
            for (let i = 0; i < list.length; i++) {
                if (list[i].key === key) return cb(list[i], i, list);
                if (list[i].children) loop(list[i].children, key, cb);
            }
        };

        const data = [...menu];
        let dragItem;

        loop(data, info.dragNode.key, (item, index, arr) => {
            arr.splice(index, 1);
            dragItem = item;
        });

        if (!info.dropToGap) {
            loop(data, info.node.key, item => {
                item.children = item.children || [];
                item.children.push(dragItem);
            });
        } else {
            let arr = [];
            let index = 0;
            loop(data, info.node.key, (item, i, a) => {
                arr = a;
                index = i;
            });
            arr.splice(
                info.dropPosition < 0 ? index : index + 1,
                0,
                dragItem
            );
        }

        await saveMenuToApi(data);
    };

    /* ================= TREE ================= */
    const mapTree = (list) =>
        list.map(i => ({
            key: i.key,
            title: (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: 8,
                        borderRadius: 6,
                        background: '#fafafa',
                    }}
                >
                    <div>
                        <Text strong>{i.label}</Text>
                        {i.url && (
                            <Text
                                type="secondary"
                                style={{marginLeft: 8}}
                            >
                                {i.url}
                            </Text>
                        )}
                    </div>

                    <Space>
                        <EditOutlined
                            onClick={(e) => {
                                e.stopPropagation();
                                editMenu(i);
                            }}
                        />
                        <PlusOutlined
                            onClick={(e) => {
                                e.stopPropagation();
                                addMenu(i.key);
                            }}
                        />
                        <DeleteOutlined
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteMenu(i.key);
                            }}
                        />
                    </Space>
                </div>
            ),
            children: i.children ? mapTree(i.children) : [],
        }));

    /* ================= RENDER ================= */
    return (
        <>
            <Typography.Title level={5}>Chế độ neo menu</Typography.Title>

            <Radio.Group
                value={stickyMode}
                onChange={e => saveMenuToApi(menu, e.target.value)}
            >
                <Space direction="vertical">
                    <Radio value="none">Không neo</Radio>
                    <Radio value="always">Neo cứng (luôn hiển thị)</Radio>
                    <Radio value="scroll-up">Hiện khi scroll lên</Radio>
                </Space>
            </Radio.Group>

            <Divider/>
            <Button
                icon={<PlusOutlined/>}
                type="dashed"
                block
                onClick={() => addMenu()}
            >
                Thêm menu gốc
            </Button>

            <Tree
                draggable
                selectable={false}
                blockNode
                onDrop={onDrop}
                treeData={mapTree(menu)}
                style={{marginTop: 16}}
            />

            <Modal
                title={editingNode?.key ? 'Sửa menu' : 'Thêm menu'}
                open={openModal}
                onOk={submitMenu}
                onCancel={() => {
                    setOpenModal(false);
                    setEditingNode(null);
                    resetForm();
                }}
            >
                <Input
                    placeholder="Tên menu"
                    value={form.label}
                    onChange={e =>
                        setForm({...form, label: e.target.value})
                    }
                />
                <Input
                    placeholder="URL"
                    style={{marginTop: 8}}
                    value={form.url}
                    onChange={e =>
                        setForm({...form, url: e.target.value})
                    }
                />
            </Modal>
        </>
    );
}

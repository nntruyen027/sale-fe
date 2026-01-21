import api from "@/services/api";

const BASE_PATH = "/quan-tri/nguoi-dung";

export async function layDsNguoiDung({ search, page, limit }) {
    const res = await api.get(BASE_PATH, {
        params: { search, page, limit },
    });
    return res.data;
}

export async function themNguoiDung(nguoiDung) {
    const res = await api.post(BASE_PATH, nguoiDung);
    return res.data;
}

export async function suaNguoiDung(id, nguoiDung) {
    const res = await api.put(`${BASE_PATH}/${id}`, nguoiDung);
    return res.data;
}

export async function xoaNguoiDung(id) {
    await api.delete(`${BASE_PATH}/${id}`);
}

export async function phanVaiTro(id,dsVaiTro) {
    await api.put(`${BASE_PATH}/${id}/quyen`, dsVaiTro);
}




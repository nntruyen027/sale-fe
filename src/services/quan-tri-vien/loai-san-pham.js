import api from "@/services/api";

const BASE_PATH = "/quan-tri/loai-san-pham";

export async function layDsLoaiSanPham({search, page, limit}) {
    try {
        const res = await api.get(BASE_PATH, {
            params: {search, page, limit},
        });
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function themLoaiSanPham(loaiSp) {
    try {
        const res = await api.post(BASE_PATH, loaiSp);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function suaLoaiSanPham(id, loaiSp) {

    try {
        const res = await api.put(`${BASE_PATH}/${id}`, loaiSp);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function xoaLoaiSanPham(id) {
    try {
        await api.delete(`${BASE_PATH}/${id}`);
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

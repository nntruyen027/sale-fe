import api from "@/services/api";

const BASE_PATH = "/quan-tri/chuyen-muc";

export async function layDsChuyenMuc({search, page, limit}) {
    try {
        const res = await api.get(BASE_PATH, {
            params: {search, page, limit},
        });
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function themChuyenMuc(chuyenMuc) {
    try {
        const res = await api.post(BASE_PATH, chuyenMuc);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function suaChuyenMuc(id, chuyenMuc) {

    try {
        const res = await api.put(`${BASE_PATH}/${id}`, chuyenMuc);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function xoaChuyenMuc(id) {
    try {
        await api.delete(`${BASE_PATH}/${id}`);
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

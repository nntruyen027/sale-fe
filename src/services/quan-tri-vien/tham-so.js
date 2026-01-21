import api from "@/services/api";

const BASE_PATH = "/quan-tri/tham-so";

export async function layDsThamSo({search, page, limit}) {
    try {
        const res = await api.get(BASE_PATH, {
            params: {search, page, limit},
        });
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function themThamSo(thamSo) {
    try {
        const res = await api.post(BASE_PATH, thamSo);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function suaThamSo(id, thamSo) {

    try {
        const res = await api.put(`${BASE_PATH}/${id}`, thamSo);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function xoaThamSo(id) {
    try {
        await api.delete(`${BASE_PATH}/${id}`);
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

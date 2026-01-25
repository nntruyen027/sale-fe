import api from "@/services/api";

const BASE_PATH = "/quan-tri/he-thong/banner";

export async function layDsBanner() {
    try {
        const res = await api.get(BASE_PATH);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function themBanner(banner) {
    try {
        const res = await api.post(BASE_PATH, banner);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function suaBanner(id, banner) {

    try {
        const res = await api.put(`${BASE_PATH}/${id}`, banner);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function xoaBanner(id) {
    try {
        await api.delete(`${BASE_PATH}/${id}`);
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

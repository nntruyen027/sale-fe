import api from "@/services/api";

const BASE_PATH = "/quan-tri/he-thong";

export async function layDsBanner() {
    try {
        const res = await api.get(BASE_PATH + '/banner');
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function themBanner(banner) {
    try {
        const res = await api.post(BASE_PATH + '/banner', banner);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function suaBanner(id, banner) {

    try {
        const res = await api.put(`${BASE_PATH}/banner/${id}`, banner);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function xoaBanner(id) {
    try {
        await api.delete(`${BASE_PATH}/banner/${id}`);
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function caiDatHomeAboutMe(body) {
    try {
        const res = await api.post(`${BASE_PATH}/home_gioithieu`, body);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function layHomeAboutMe(body) {
    try {
        const res = await api.get(`${BASE_PATH}/home_gioithieu`);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}
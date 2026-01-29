import api from "@/services/api";

const BASE_PATH = "/quan-tri/he-thong";

export async function caiDatHomeAboutMe(body) {
    try {
        const res = await api.post(`${BASE_PATH}/home_gioithieu`, body);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function caiDatHomeChucNang(body) {
    try {
        const res = await api.post(`${BASE_PATH}/home_chucnang`, body);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function caiDatHomeSanPhamGoiY(body) {
    try {
        const res = await api.post(`${BASE_PATH}/home_sanphamgoiy`, body);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function caiDatHomeBanner(body) {
    try {
        const res = await api.post(`${BASE_PATH}/home_banner`, body);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}


export async function caiDatChungHeader(body) {
    try {
        const res = await api.post(`${BASE_PATH}/chung_header`, body);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function caiDatChungFooter(body) {
    try {
        const res = await api.post(`${BASE_PATH}/chung_footer`, body);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}
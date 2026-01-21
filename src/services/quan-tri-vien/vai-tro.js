import api from "@/services/api";

const BASE_PATH = "/quan-tri/vai-tro";

export async function layDsVaiTro({ search, page, limit }) {
    try {
        const res = await api.get(BASE_PATH, {
            params: { search, page, limit },
        });
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function themVaiTro(vaiTro) {
    try {
        const res = await api.post(BASE_PATH, vaiTro);
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function suaVaiTro(id, vaiTro) {
    try {
        const res = await api.put(`${BASE_PATH}/${id}`, vaiTro);
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function xoaVaiTro(id) {

    try {
        await api.delete(`${BASE_PATH}/${id}`);
    }
    catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function phanQuyen(id,dsMaquyen) {


    try {
        await api.put(`${BASE_PATH}/${id}/quyen`, dsMaquyen);
    }
    catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}




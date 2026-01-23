import api from "@/services/api";

const BASE_PATH = "/quan-tri/catalog";

export async function layDsCatalog({search, page, limit}) {
    try {
        const res = await api.get(BASE_PATH, {
            params: {search, page, limit},
        });
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function themCatalog(catalog) {
    try {
        const res = await api.post(BASE_PATH, catalog);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function suaCatalog(id, catalog) {

    try {
        const res = await api.put(`${BASE_PATH}/${id}`, catalog);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function xoaCatalog(id) {
    try {
        await api.delete(`${BASE_PATH}/${id}`);
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

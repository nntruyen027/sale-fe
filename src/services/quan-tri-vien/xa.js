import api from "@/services/api";


const BASE_PATH = "/quan-tri/xa";

export async function layDsXa({ search, tinhId, page, limit }) {
    const res = await api.get(BASE_PATH, {
        params: { search, tinhId, page, limit },
    });
    return res.data;
}

export async function themXa(xa) {
    const res = await api.post(BASE_PATH, xa);
    return res.data;
}

export async function suaXa(id, xa) {
    const res = await api.put(`${BASE_PATH}/${id}`, xa);
    return res.data;
}

export async function xoaXa(id) {
    await api.delete(`${BASE_PATH}/${id}`);
}

export async function layFileImport () {
    const res = await api.get(`${BASE_PATH}/importer/template`, {
        responseType: "blob",
    });
    return res.data;
}

export async function importXa(formData) {
    const res = await api.post(`${BASE_PATH}/importer`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

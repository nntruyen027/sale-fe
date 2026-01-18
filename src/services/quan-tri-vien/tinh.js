import api from "@/services/api";

const BASE_PATH = "/quan-tri/tinh";

export async function layDsTinh({ search, page, limit }) {
    const res = await api.get(BASE_PATH, {
        params: { search, page, limit },
    });
    return res.data;
}

export async function themTinh(tinh) {
    const res = await api.post(BASE_PATH, tinh);
    return res.data;
}

export async function suaTinh(id, tinh) {
    const res = await api.put(`${BASE_PATH}/${id}`, tinh);
    return res.data;
}

export async function xoaTinh(id) {
    await api.delete(`${BASE_PATH}/${id}`);
}

export async function layFileImport() {
    const res = await api.get(`${BASE_PATH}/importer/template`, {
        responseType: "blob",
    });
    return res.data;
}

export async function importTinh(formData) {
    const res = await api.post(`${BASE_PATH}/importer`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

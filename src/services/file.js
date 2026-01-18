"use client";
import api from "@/lib/api.client";

const BASE_PATH = "/files";

export async function getAllFiles(page, size) {
    const res = await api.get(BASE_PATH, {
        params: { page, size },
    });
    return res.data;
}

export async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(`${BASE_PATH}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

export async function deleteFile(id) {
    await api.delete(`${BASE_PATH}/${id}`);
}

export function getPublicFileUrl(fileName) {
    return `https://saleapi.tmqcreator.top${BASE_PATH}/public/${fileName}`;
}

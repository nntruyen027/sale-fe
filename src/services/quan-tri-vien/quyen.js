import api from "@/services/api";

const BASE_PATH = "/quan-tri/quyen";

export async function layDsQuyen({ search, page, limit }) {
    const res = await api.get(BASE_PATH, {
        params: { search, page, limit },
    });
    return res.data;
}

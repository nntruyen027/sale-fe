import api from "@/services/api";

const BASE_PATH = "/quan-tri/san-pham";

export async function layDsSanPham({search, page, limit}) {
    try {
        const res = await api.get(BASE_PATH, {
            params: {search, page, limit},
        });
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function laySanPham(id) {
    if (!id) throw new Error("Thiếu id sản phẩm");

    try {
        const res = await api.get(`${BASE_PATH}/${id}`);
        return res.data;
    } catch (e) {
        throw new Error(
            e?.response?.data?.message || "Lỗi khi lấy sản phẩm"
        );
    }
}


export async function themSanPham(sanPham) {
    try {
        const res = await api.post(BASE_PATH, sanPham);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function suaSanPham(id, sanPham) {

    try {
        const res = await api.put(`${BASE_PATH}/${id}`, sanPham);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function xoaSanPham(id) {
    try {
        await api.delete(`${BASE_PATH}/${id}`);
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function taoBienThem(spId, bienThe) {
    try {
        await api.post(`${BASE_PATH}/${spId}/bien-the`, bienThe);
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function suaBienThem(spId, idBienThe, bienThe) {
    try {
        await api.put(`${BASE_PATH}/${spId}/bien-the/${idBienThe}`, bienThe);
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function xoaBienThem(spId, idBienThe) {
    try {
        await api.delete(`${BASE_PATH}/${spId}/bien-the/${idBienThe}`);
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}


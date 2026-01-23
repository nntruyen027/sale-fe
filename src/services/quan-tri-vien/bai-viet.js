import api from "@/services/api";

const BASE_PATH = "/quan-tri/bai-viet";

/* ===============================
 * DANH SÁCH
 * =============================== */

/**
 * Lấy danh sách bài viết (admin)
 */
export async function layDsBaiViet({
                                       chuyenMucId,
                                       trangThai,
                                       search,
                                       page,
                                       size
                                   }) {
    try {
        const res = await api.get(BASE_PATH, {
            params: {
                chuyenMucId,
                trangThai,
                search,
                page,
                size
            }
        });
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

/**
 * Lấy danh sách bài viết theo hashtag
 */
export async function layDsBaiVietTheoHashtag(slug, page = 1, size = 10) {
    try {
        const res = await api.get(`${BASE_PATH}/hashtag/${slug}`, {
            params: {page, size}
        });
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

/* ===============================
 * CHI TIẾT
 * =============================== */

/**
 * Lấy chi tiết bài viết theo ID
 */
export async function layBaiViet(id) {
    try {
        const res = await api.get(`${BASE_PATH}/${id}`);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

/**
 * Lấy chi tiết bài viết theo slug
 */
export async function layBaiVietTheoSlug(slug) {
    try {
        const res = await api.get(`${BASE_PATH}/slug/${slug}`);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

/* ===============================
 * BÀI VIẾT LIÊN QUAN
 * =============================== */

/**
 * Lấy danh sách bài viết liên quan
 */
export async function layBaiVietLienQuan(id) {
    try {
        const res = await api.get(`${BASE_PATH}/${id}/lien-quan`);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

/* ===============================
 * CRUD
 * =============================== */

/**
 * Thêm mới bài viết
 */
export async function themBaiViet(baiViet) {
    try {
        const res = await api.post(BASE_PATH, baiViet);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

/**
 * Cập nhật bài viết
 */
export async function suaBaiViet(id, baiViet) {
    try {
        const res = await api.put(`${BASE_PATH}/${id}`, baiViet);
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

/**
 * Xoá bài viết
 */
export async function xoaBaiViet(id) {
    try {
        await api.delete(`${BASE_PATH}/${id}`);
    } catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

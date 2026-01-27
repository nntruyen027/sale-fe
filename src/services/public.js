import api from "@/services/api";


const BASE_PATH = "/cong-khai";

export async function getTinh({search, page, limit}) {
    try {
        const res = await api.get(BASE_PATH + '/tinh', {
            params: {search, page, limit},
        });
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}

export async function getXa({search, tinhId, page, limit}) {
    try {
        const res = await api.get(BASE_PATH + '/tinh/' + tinhId + '/xa', {
            params: {search, page, limit, tinhId},
        });
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}


export async function layDsLoaiSanPham({search, page, limit}) {
    try {
        const res = await api.get(BASE_PATH + '/loai-san-pham', {
            params: {search, page, size: limit},
        });
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function layDsBaiViet({search, page, limit}) {
    try {
        const res = await api.get(BASE_PATH + '/bai-viet', {
            params: {search, page, size: limit},
        });
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }

}


export async function layGiaTriThamSo(khoa) {
    try {
        const res = await api.get(BASE_PATH + '/tham-so/' + khoa)
        return res.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message)
    }
}

export async function layDsBanner() {
    try {
        const res = await api.get(BASE_PATH + '/banner');
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
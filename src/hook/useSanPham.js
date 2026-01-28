'use client';

import {useEffect, useRef, useState} from "react";
import {layDsSanPham} from "@/services/public";
import {useDebounce} from "@/hook/data";

export function useSanPhamSelect({defaultLimit = 20} = {}) {

    /* ===================== STATE ===================== */
    const [dsSanPham, setDsSanPham] = useState([]);
    const [searchSanPham, setSearchSanPham] = useState("");
    const debouncedSanPham = useDebounce(searchSanPham, 300);

    const [pagi, setPagi] = useState({
        page: 1,
        limit: defaultLimit,
        total: 0,
    });

    const [loading, setLoading] = useState(false);
    const cacheRef = useRef({});

    const hasMore = dsSanPham.length < pagi.total;

    /* ===================== FETCH ===================== */
    const fetchSanPham = async ({reset = false} = {}) => {
        if (loading) return;

        const page = reset ? 1 : pagi.page;
        const cacheKey = `${debouncedSanPham}_${page}_${pagi.limit}`;

        // lấy từ cache
        if (cacheRef.current[cacheKey]) {
            setDsSanPham(prev =>
                reset
                    ? cacheRef.current[cacheKey]
                    : [...prev, ...cacheRef.current[cacheKey]]
            );
            return;
        }

        setLoading(true);
        try {
            const res = await layDsSanPham({
                page,
                size: pagi.limit,
                search: debouncedSanPham,
            });

            const list = res?.data || [];

            cacheRef.current[cacheKey] = list;

            setDsSanPham(prev => reset ? list : [...prev, ...list]);
            setPagi(p => ({
                ...p,
                page,
                total: res?.totalElements || 0,
            }));
        } finally {
            setLoading(false);
        }
    };

    /* ===================== EFFECT ===================== */

    // 🔥 FETCH LẦN ĐẦU KHI MOUNT (QUAN TRỌNG)
    useEffect(() => {
        fetchSanPham({reset: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 🔍 SEARCH
    useEffect(() => {
        cacheRef.current = {};
        setDsSanPham([]);
        setPagi(p => ({...p, page: 1}));
        fetchSanPham({reset: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSanPham]);

    // ➕ LOAD MORE
    useEffect(() => {
        if (pagi.page > 1) {
            fetchSanPham();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagi.page]);

    /* ===================== API ===================== */
    return {
        dsSanPham,
        loading,
        hasMore,
        setSearchSanPham,
        loadMore: () => {
            if (hasMore && !loading) {
                setPagi(p => ({...p, page: p.page + 1}));
            }
        },
    };
}

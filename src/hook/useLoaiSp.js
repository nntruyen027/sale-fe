'use client';

import {useEffect, useRef, useState} from "react";
import {layDsLoaiSanPham} from "@/services/quan-tri-vien/loai-san-pham";
import {useDebounce} from "@/hook/data";

export function useLoaiSpSelect() {

    /* ===================== STATE ===================== */
    const [dsLoaiSp, setDsLoaiSp] = useState([]);
    const [searchLoaiSp, setSearchLoaiSp] = useState("");
    const debouncedLoaiSp = useDebounce(searchLoaiSp, 300);

    const [pagi, setPagi] = useState({
        page: 1,
        limit: 20,
        total: 0,
    });

    const [loading, setLoading] = useState(false);
    const cacheRef = useRef({});

    const hasMore = dsLoaiSp.length < pagi.total;

    /* ===================== FETCH ===================== */
    const fetchLoaiSp = async ({reset = false} = {}) => {
        if (loading) return;

        const page = reset ? 1 : pagi.page;
        const key = `${debouncedLoaiSp}_${page}`;

        if (cacheRef.current[key]) {
            setDsLoaiSp(prev =>
                reset
                    ? cacheRef.current[key]
                    : [...prev, ...cacheRef.current[key]]
            );
            return;
        }

        setLoading(true);
        try {
            const res = await layDsLoaiSanPham({
                page,
                limit: pagi.limit,
                search: debouncedLoaiSp,
            });

            const list = res.data || [];

            cacheRef.current[key] = list;

            setDsLoaiSp(prev => reset ? list : [...prev, ...list]);
            setPagi(p => ({
                ...p,
                page,
                total: res.totalElements || 0,
            }));
        } finally {
            setLoading(false);
        }
    };

    /* ===================== EFFECT ===================== */

    // search
    useEffect(() => {
        cacheRef.current = {};        // 🔥 reset cache
        setDsLoaiSp([]);
        setPagi(p => ({...p, page: 1}));
        fetchLoaiSp({reset: true});
    }, [debouncedLoaiSp]);

    // scroll
    useEffect(() => {
        if (pagi.page > 1) fetchLoaiSp();
    }, [pagi.page]);

    return {
        dsLoaiSp,
        loading,
        hasMore,
        setSearchLoaiSp,
        loadMore: () => {
            if (hasMore && !loading) {
                setPagi(p => ({...p, page: p.page + 1}));
            }
        },
    };
}

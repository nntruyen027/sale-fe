'use client';

import {useEffect, useRef, useState} from "react";
import {layDsChuyenMuc} from "@/services/quan-tri-vien/chuyen-muc";
import {useDebounce} from "@/hook/data";

export function useChuyenMucSelect() {

    /* ===================== STATE ===================== */
    const [dsChuyenMuc, setDsChuyenMuc] = useState([]);
    const [searchChuyenMuc, setSearchChuyenMuc] = useState("");
    const debouncedChuyenMuc = useDebounce(searchChuyenMuc, 300);

    const [pagi, setPagi] = useState({
        page: 1,
        limit: 20,
        total: 0,
    });

    const [loading, setLoading] = useState(false);
    const cacheRef = useRef({});

    const hasMore = dsChuyenMuc.length < pagi.total;

    /* ===================== FETCH ===================== */
    const fetchChuyenMuc = async ({reset = false} = {}) => {
        if (loading) return;

        const page = reset ? 1 : pagi.page;
        const key = `${debouncedChuyenMuc}_${page}`;

        if (cacheRef.current[key]) {
            setDsChuyenMuc(prev =>
                reset
                    ? cacheRef.current[key]
                    : [...prev, ...cacheRef.current[key]]
            );
            return;
        }

        setLoading(true);
        try {
            const res = await layDsChuyenMuc({
                page,
                limit: pagi.limit,
                search: debouncedChuyenMuc,
            });

            const list = res.data || [];

            cacheRef.current[key] = list;

            setDsChuyenMuc(prev => reset ? list : [...prev, ...list]);
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
        setDsChuyenMuc([]);
        setPagi(p => ({...p, page: 1}));
        fetchChuyenMuc({reset: true});
    }, [debouncedChuyenMuc]);

    // scroll
    useEffect(() => {
        if (pagi.page > 1) fetchChuyenMuc();
    }, [pagi.page]);

    return {
        dsChuyenMuc,
        loading,
        hasMore,
        setSearchChuyenMuc,
        loadMore: () => {
            if (hasMore && !loading) {
                setPagi(p => ({...p, page: p.page + 1}));
            }
        },
    };
}

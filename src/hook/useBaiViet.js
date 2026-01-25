'use client';

import {useEffect, useRef, useState} from "react";
import {layDsBaiViet} from "@/services/public";
import {useDebounce} from "@/hook/data";

export function useBaiVietSelect({defaultLimit = 20} = {}) {

    /* ===================== STATE ===================== */
    const [dsBaiViet, setDsBaiViet] = useState([]);
    const [searchBaiViet, setSearchBaiViet] = useState("");
    const debouncedBaiViet = useDebounce(searchBaiViet, 300);

    const [pagi, setPagi] = useState({
        page: 1,
        limit: defaultLimit,
        total: 0,
    });

    const [loading, setLoading] = useState(false);
    const cacheRef = useRef({});

    const hasMore = dsBaiViet.length < pagi.total;

    /* ===================== FETCH ===================== */
    const fetchBaiViet = async ({reset = false} = {}) => {
        if (loading) return;

        const page = reset ? 1 : pagi.page;
        const cacheKey = `${debouncedBaiViet}_${page}_${pagi.limit}`;

        // lấy từ cache
        if (cacheRef.current[cacheKey]) {
            setDsBaiViet(prev =>
                reset
                    ? cacheRef.current[cacheKey]
                    : [...prev, ...cacheRef.current[cacheKey]]
            );
            return;
        }

        setLoading(true);
        try {
            const res = await layDsBaiViet({
                page,
                limit: pagi.limit,
                search: debouncedBaiViet,
            });

            const list = res?.data || [];

            cacheRef.current[cacheKey] = list;

            setDsBaiViet(prev => reset ? list : [...prev, ...list]);
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
        fetchBaiViet({reset: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 🔍 SEARCH
    useEffect(() => {
        cacheRef.current = {};
        setDsBaiViet([]);
        setPagi(p => ({...p, page: 1}));
        fetchBaiViet({reset: true});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedBaiViet]);

    // ➕ LOAD MORE
    useEffect(() => {
        if (pagi.page > 1) {
            fetchBaiViet();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagi.page]);

    /* ===================== API ===================== */
    return {
        dsBaiViet,
        loading,
        hasMore,
        setSearchBaiViet,
        loadMore: () => {
            if (hasMore && !loading) {
                setPagi(p => ({...p, page: p.page + 1}));
            }
        },
    };
}

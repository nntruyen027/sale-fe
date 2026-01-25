'use client';

import {useEffect, useRef, useState} from "react";
import {getTinh, getXa} from "@/services/public";
import {useDebounce} from "@/hook/data";

export function useTinhXaSelect() {

    /* ===================== TỈNH ===================== */
    const [dsTinh, setDsTinh] = useState([]);
    const [searchTinh, setSearchTinh] = useState("");
    const debouncedTinh = useDebounce(searchTinh, 300);

    const [tinhPagi, setTinhPagi] = useState({
        page: 1,
        limit: 20,
        total: 0
    });

    const tinhCache = useRef({});

    const fetchTinh = async (reset = false) => {
        const page = reset ? 1 : tinhPagi.page;
        const key = `${debouncedTinh}_${page}`;

        if (tinhCache.current[key]) {
            setDsTinh(prev =>
                reset ? tinhCache.current[key] : [...prev, ...tinhCache.current[key]]
            );
            return;
        }

        const res = await getTinh(debouncedTinh, page, tinhPagi.limit);

        tinhCache.current[key] = res.dsTinh || [];
        setDsTinh(prev => reset ? res.dsTinh : [...prev, ...res.dsTinh]);
        setTinhPagi(prev => ({
            ...prev,
            page,
            total: res.total || 0
        }))
    };

    /* ===================== XÃ ===================== */
    const [tinhId, setTinhId] = useState(null);
    const [dsXa, setDsXa] = useState([]);
    const [searchXa, setSearchXa] = useState("");
    const debouncedXa = useDebounce(searchXa, 300);

    const [xaPagi, setXaPagi] = useState({
        page: 1,
        limit: 20,
        total: 0
    });

    const xaCache = useRef({});

    const fetchXa = async (reset = false) => {
        if (!tinhId) return;

        const page = reset ? 1 : xaPagi.page;
        const key = `${tinhId}_${debouncedXa}_${page}`;

        if (xaCache.current[key]) {
            setDsXa(prev =>
                reset ? xaCache.current[key] : [...prev, ...xaCache.current[key]]
            );
            return;
        }

        const res = await getXa(debouncedXa, tinhId, page, xaPagi.limit);

        xaCache.current[key] = res.dsXa || [];
        setDsXa(prev => reset ? res.dsXa : [...prev, ...res.dsXa]);
        setXaPagi(prev => ({
            ...prev,
            page,
            total: res.total || 0
        }));
    };

    /* ===================== EFFECT ===================== */

    // 🔹 tìm tỉnh (debounce)
    useEffect(() => {
        setDsTinh([]);
        setTinhPagi(p => ({...p, page: 1}));
        fetchTinh(true);
    }, [debouncedTinh]);

    // 🔹 scroll tỉnh
    useEffect(() => {
        if (tinhPagi.page > 1) fetchTinh();
    }, [tinhPagi.page]);

    // 🔹 đổi tỉnh OR tìm xã
    useEffect(() => {
        if (!tinhId) return;

        setDsXa([]);
        setXaPagi(p => ({...p, page: 1}));
        fetchXa(true);
    }, [tinhId, debouncedXa]);

    // 🔹 scroll xã
    useEffect(() => {
        if (xaPagi.page > 1) fetchXa();
    }, [xaPagi.page]);

    return {
        dsTinh,
        setSearchTinh,
        tinhPagi,
        setTinhPagi,

        tinhId,
        setTinhId,

        dsXa,
        setSearchXa,
        xaPagi,
        setXaPagi
    };
}

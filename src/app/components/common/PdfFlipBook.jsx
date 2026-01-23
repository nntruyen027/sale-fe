'use client';

import {useEffect, useRef, useState} from "react";
import {PageFlip} from "page-flip";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Định nghĩa khổ giấy (mm)
 */
const PAPER_SIZES = {
    A4: {w: 210, h: 297},
    A5: {w: 148, h: 210},
    A3: {w: 297, h: 420},
    LETTER: {w: 216, h: 279},
    CATALOG_LANDSCAPE: {w: 297, h: 210},
};

export default function PdfFlipBook({
                                        pdfUrl,
                                        paperType = "A4" // ✅ mặc định A4
                                    }) {
    const containerRef = useRef(null);
    const bookRef = useRef(null);
    const pageFlipRef = useRef(null);

    const [pages, setPages] = useState([]);
    const [ready, setReady] = useState(false);

    /**
     * Đợi modal render xong để có kích thước thật
     */
    useEffect(() => {
        const t = setTimeout(() => {
            if (containerRef.current?.clientWidth) {
                setReady(true);
            }
        }, 300);
        return () => clearTimeout(t);
    }, []);

    /**
     * Load PDF → render canvas → image
     */
    useEffect(() => {
        if (!ready || !pdfUrl) return;

        async function loadPdf() {
            const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
            const images = [];

            const paper = PAPER_SIZES[paperType] || PAPER_SIZES.A4;
            const paperRatio = paper.w / paper.h;

            const maxW = containerRef.current.clientWidth;
            const maxH = containerRef.current.clientHeight;

            // 👉 scale sao cho KHÔNG vượt màn hình
            let pageW = maxW;
            let pageH = pageW / paperRatio;

            if (pageH > maxH) {
                pageH = maxH;
                pageW = pageH * paperRatio;
            }

            // 👉 không cho quá nhỏ (>= 50% màn hình)
            pageW = Math.max(pageW, maxW * 0.5);
            pageH = Math.max(pageH, maxH * 0.5);

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const baseViewport = page.getViewport({scale: 1});

                const scale = pageW / baseViewport.width;
                const viewport = page.getViewport({scale});

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvasContext: ctx,
                    viewport,
                }).promise;

                images.push(canvas.toDataURL("image/png"));
            }

            setPages(images);
        }

        loadPdf();
    }, [ready, pdfUrl, paperType]);

    /**
     * Init PageFlip
     */
    useEffect(() => {
        if (!pages.length) return;

        const container = containerRef.current;

        // clear cũ
        if (pageFlipRef.current) {
            pageFlipRef.current.destroy();
            pageFlipRef.current = null;
            bookRef.current.innerHTML = "";
        }

        pageFlipRef.current = new PageFlip(bookRef.current, {
            width: container.clientWidth,
            height: container.clientHeight,
            size: "stretch",
            showCover: true,
            maxShadowOpacity: 0.4,
            mobileScrollSupport: true,
            useMouseEvents: true,
        });

        pageFlipRef.current.loadFromImages(pages);

        return () => {
            pageFlipRef.current?.destroy();
        };
    }, [pages]);

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f5f5f5",
            }}
        >
            <div ref={bookRef}/>
        </div>
    );
}

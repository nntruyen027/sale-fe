'use client';

import {useEffect, useState} from 'react';
import {getPdfPreview} from '@/utils/pdfPreview';

export default function PdfPreview({url}) {
    const [img, setImg] = useState(null);

    useEffect(() => {
        if (!url) return;
        getPdfPreview(url).then(setImg);
    }, [url]);

    if (!img) {
        return <div style={{width: 60, height: 80}}>...</div>;
    }

    return (
        <img
            src={img}
            alt="PDF preview"
            style={{
                width: 60,
                height: 'auto',
                cursor: 'pointer',
                border: '1px solid #ddd',
            }}
            onClick={() => window.open(url, '_blank')}
        />
    );
}

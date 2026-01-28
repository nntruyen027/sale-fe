'use client';

import {Col, Row, Spin, theme, Typography} from "antd";
import {useLoaiSpSelect} from "@/hook/useLoaiSp";
import {useInView} from "@/hook/useInView";


export default function LoaiSanPham() {
    const {token} = theme.useToken();

    const {
        dsLoaiSp,
        hasMore,
        loading,
        loadMore
    } = useLoaiSpSelect({defaultLimit: 6});

    return (
        <div className="px-0 py-10 sm:px-40">
            <Typography.Title style={{color: token.mainColor}}>
                Nhóm sản phẩm
            </Typography.Title>

            <Spin spinning={loading && dsLoaiSp.length === 0}>
                <Row
                    gutter={[16, 16]}
                >
                    {dsLoaiSp.map((loai, index) => (
                        <Col key={loai.id} xs={24}
                             sm={12}
                             md={8}>
                            <LoaiComponent loai={loai} index={index}/>
                        </Col>
                    ))}
                </Row>
            </Spin>

            {/* LOAD MORE */}
            {hasMore && (
                <div className="flex justify-center mt-8">
                    <div
                        onClick={loadMore}
                        className="
                            relative
                            px-6 py-2
                            cursor-pointer
                            font-medium
                            overflow-hidden
                            group
                            border rounded-md
                            select-none
                        "
                        style={{
                            color: token.mainColor,
                            borderColor: token.mainColor,
                        }}
                    >
                        {/* background chạy */}
                        <span
                            className="
                                absolute inset-0
                                -translate-x-full
                                group-hover:translate-x-0
                                transition-transform duration-500 ease-out
                            "
                            style={{backgroundColor: token.mainColor}}
                        />

                        {/* text */}
                        <span
                            className="
                                relative z-10
                                group-hover:text-white
                                transition-colors duration-300
                            "
                        >
                            Xem thêm
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

function LoaiComponent({loai, index}) {
    const {ref, inView} = useInView({threshold: 0.25});

    // mỗi item 1 hướng khác
    const direction =
        index % 4 === 0
            ? "-translate-x-20"
            : index % 4 === 1
                ? "translate-x-20"
                : index % 4 === 2
                    ? "-translate-y-20"
                    : "translate-y-20";

    return (
        <div
            ref={ref}

            className={`
                relative
                h-[260px]
                overflow-hidden
                group
                cursor-pointer
                transition-all
                duration-700
                ease-[cubic-bezier(.22,1,.36,1)]
                ${inView
                ? "opacity-100 translate-x-0 translate-y-0"
                : `opacity-0 ${direction}`
            }
            `}
            style={{
                backgroundImage: `url(${loai.hinhAnh})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transitionDelay: `${index * 120}ms`,
                threshold: 0.15,
                rootMargin: "0px 0px -80px 0px"

            }}
        >
            {/* Overlay */}
            <div
                className="
                    absolute inset-0
                    bg-black/60
                    translate-y-full
                    group-hover:translate-y-0
                    transition-transform duration-500 ease-out
                "
            />

            {/* Text */}
            <div
                className="
                    absolute inset-0
                    flex items-center justify-center
                    translate-y-full
                    group-hover:translate-y-0
                    transition-transform duration-500 ease-out
                "
            >
                <h2 className="text-white text-2xl font-bold tracking-wide">
                    {loai.ten}
                </h2>
            </div>
        </div>
    );
}

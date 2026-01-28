'use client';

import {Col, Row, Spin, theme, Typography} from "antd";
import {useBaiVietSelect} from "@/hook/useBaiViet";
import dayjs from "dayjs";
import {useInView} from "@/hook/useInView";


export default function TinTuc() {
    const {token} = theme.useToken();

    const {
        dsBaiViet,
        hasMore,
        loading,
        loadMore
    } = useBaiVietSelect({defaultLimit: 3});

    return (
        <div className={`px-0 py-10 sm:px-40 `}>
            <Typography.Title style={{color: token.colorPrimary, textAlign: 'center',}}>
                Tin tức
            </Typography.Title>

            <Spin spinning={loading && dsBaiViet.length === 0}>
                <Row
                    gutter={[16, 16]}
                >
                    {dsBaiViet.map((tinTuc, index) => (
                        <Col key={tinTuc.id} xs={24}
                             sm={12}
                             md={8}>
                            <TinTucComponent tinTuc={tinTuc} index={index}/>
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

function TinTucComponent({tinTuc, index}) {
    const {token} = theme.useToken();
    const {ref, inView} = useInView({threshold: 0.25});

    return (
        <div
            ref={ref}
            className={`
                group
                bg-white
                rounded-xl
                shadow-lg
                overflow-hidden
                transition-all
                duration-700
                ease-[cubic-bezier(0.22,1,0.36,1)]
                ${
                inView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
            }
                hover:-translate-y-2
                hover:shadow-2xl
            `}
            style={{
                transitionDelay: `${index * 120}ms`,
            }}
        >
            {/* IMAGE */}
            <div className="relative h-[420px] overflow-hidden">
                <div
                    className="
                        absolute inset-0
                        bg-center bg-cover
                        transition-transform
                        duration-700
                        ease-out
                        group-hover:scale-110
                    "
                    style={{
                        backgroundImage: `url(${tinTuc.hinhAnh})`,
                    }}
                />

                {/* Overlay gradient */}
                <div
                    className="
                        absolute inset-0

                        bg-gradient-to-t
                        from-black/40
                        via-black/10
                        to-transparent
                        opacity-60
                        group-hover:opacity-80
                        transition-opacity
                        duration-500
                    "
                />
            </div>

            {/* CONTENT */}
            <div
                style={{background: token.mainColor}}
                className="relative"
            >
                <Row gutter={0}>
                    {/* DATE */}
                    <Col
                        span={6}
                        className="bg-white px-3 py-2"
                        style={{
                            clipPath:
                                "polygon(0 0, 100% 0, 85% 100%, 0% 100%)",
                        }}
                    >
                        <Typography.Text className="text-sm text-gray-600">
                            {dayjs(tinTuc.ngayTao).format("DD/MM/YYYY")}
                        </Typography.Text>
                    </Col>

                    {/* TITLE */}
                    <Col span={18} className="px-3 py-2">
                        <Typography.Text
                            style={{
                                color: 'white'
                            }}
                            className="
                                block
                                text-right
                                text-base
                                font-semibold

                                line-clamp-2
                            "
                        >
                            {tinTuc.tieuDe}
                        </Typography.Text>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

'use client';

import {Col, Row, Spin, theme, Typography} from "antd";
import {useBaiVietSelect} from "@/hook/useBaiViet";
import dayjs from "dayjs";


export default function TinTuc() {
    const {token} = theme.useToken();

    const {
        dsBaiViet,
        hasMore,
        loading,
        loadMore
    } = useBaiVietSelect({defaultLimit: 3});

    return (
        <div className={`px-0 py-10 sm:px-40`} style={{
            backgroundColor: token.mainColor
        }}>
            <Typography.Title style={{color: 'white', textAlign: 'center'}}>
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
                            color: 'white',
                            borderColor: 'white',
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
                            style={{backgroundColor: 'white'}}
                        />

                        {/* text */}
                        <span
                            className={
                                ` relative z-10
                            group-hover:text-[${token.mainColor}]
                            transition-colors duration-300`
                            }


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


    return (
        <div className={''}>
            <div
                className={`
                relative
                h-[600px]
                overflow-hidden
                group
                cursor-pointer
            `}
                style={{
                    backgroundImage: `url(${tinTuc.hinhAnh})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >


            </div>
            <div className={'p-3 bg-white'}>
                <Row>
                    <Col span={8}>
                        <Typography.Text>
                            {dayjs(tinTuc.ngayTao).format('DD/MM/YYYY HH:mm')}
                        </Typography.Text>
                    </Col>
                    <Col span={16}>
                        <Typography.Text>
                            {tinTuc.tieuDe}
                        </Typography.Text>
                    </Col>
                </Row>
            </div>


        </div>

    );
}

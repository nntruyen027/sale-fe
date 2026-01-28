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
                        className={"relative px-6 py-2 cursor-pointer font-medium overflow-hidden group border rounded-md select-none transition-colors duration-300"}
                        style={{
                            color: 'white',                // chữ ban đầu
                            borderColor: 'white',
                        }}
                    >

                        <span
                            className={"relative z-10 inline-block transition-transform duration-300 group-hover:scale-130"}
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


    return (
        <div className="group">
            {/* IMAGE */}
            <div className="relative h-[600px] overflow-hidden cursor-pointer shadow-md
        hover:shadow-xl
        transition-shadow duration-300">
                {/* layer hình */}
                <div
                    className="
                absolute inset-0
                transition-transform duration-700 ease-out
                group-hover:scale-120
            "
                    style={{
                        backgroundImage: `url(${tinTuc.hinhAnh})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
            </div>

            {/* CONTENT */}
            <div style={{
                background: token.mainColor,
            }}>
                <Row style={{margin: 0}} gutter={[16, 16]}>
                    <Col
                        span={8}
                        style={{
                            padding: '7px',
                            background: '#fff',
                            color: 'white',
                            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)',
                            textAlign: 'center',
                        }}
                    >
                        <Typography.Text style={{color: 'black'}}>
                            {dayjs(tinTuc.ngayTao).format('DD/MM/YYYY HH:mm')}
                        </Typography.Text>
                    </Col>

                    <Col span={16} style={{
                        backgroundColor: token.mainColor,
                        padding: '7px',
                    }}>

                        <Typography.Text style={{
                            display: 'block',
                            textAlign: 'right',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: 'white',

                        }}>
                            {tinTuc.tieuDe}
                        </Typography.Text>
                    </Col>
                </Row>
            </div>
        </div>


    );
}

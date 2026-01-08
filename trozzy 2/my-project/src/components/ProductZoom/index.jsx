import React, { useState, useRef } from 'react';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

// Install Swiper Navigation module
SwiperCore.use([Navigation]);

const ProductZoom = ({ product, selectedColorVariant }) => {
    const [SlideIndex, setSlideIndex] = useState(0);
    const zoomSliderBig = useRef();
    const zoomSliderSml = useRef();

    // Get images from color variant or fallback to product images
    const getVariantImages = () => {
        if (selectedColorVariant?.images?.length > 0) {
            return selectedColorVariant.images;
        }
        return [
            ...(product?.image ? [product.image] : []),
            ...((product?.galleryImages ?? []).filter(Boolean)),
        ];
    };

    const images = getVariantImages();

    const fallbackImages = [
        'https://serviceapi.spicezgold.com/download/1742452035507_rtrt1.jpg',
        'https://serviceapi.spicezgold.com/download/1742452035508_rtrt4.jpg',
        'https://serviceapi.spicezgold.com/download/1742452035508_rtrt.jpg',
        'https://serviceapi.spicezgold.com/download/1742452035509_rtrt2.jpg',
    ];

    const finalImages = images.length > 0 ? images : fallbackImages;

    const goto = (index) => {
        setSlideIndex(index);
        zoomSliderBig.current?.swiper?.slideTo(index);
        zoomSliderSml.current?.swiper?.slideTo(index);
    }

    return (
        <>
            <div className='flex gap-3'>
                {/* Thumbnail Slider */}
                <div className='slider w-[15%]'>
                    <Swiper
                        ref={zoomSliderSml} // ✅ moved here
                        direction="vertical"
                        slidesPerView={5}
                        spaceBetween={0}
                        navigation={true}
                        modules={[Navigation]}
                        className="zoomContainerSliderThumbs h-[500px] overflow-hidden"
                    >
                        {finalImages.map((src, idx) => (
                            <SwiperSlide key={src + idx}>
                                <div
                                    className={`item rounded-md overflow-hidden cursor-pointer group  ${SlideIndex === idx ? 'opacity-1' : 'opacity-30'}`}
                                    onClick={() => goto(idx)}
                                >
                                    <img
                                        src={src}
                                        alt={product?.name ?? 'Product image'}
                                        className='w-full transition-all ease-in duration-300 group-hover:scale-105'
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Main Zoom Image */}
                <div className='zoomContainer w-[85%] h-[500px] overflow-hidden rounded-md'>
                    <Swiper
                        ref={zoomSliderBig}
                        slidesPerView={1}
                        spaceBetween={0}
                        navigation={false}
                    >
                        {finalImages.map((src, idx) => (
                            <SwiperSlide key={src + idx}>
                                <InnerImageZoom
                                    zoomType='hover'
                                    zoomScale={1.5}
                                    src={src}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </>
    )
}

export default ProductZoom;

'use client';

import React from 'react';
import LightGallery from 'lightgallery/react';

// import styles
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

// import plugins if needed
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

interface Photo {
    id: string;
    url: string;
    url_optimized?: string;
    title?: string;
}

interface LightGalleryViewProps {
    images: Photo[];
    onClose?: () => void;
}

export default function LightGalleryView({ images, onClose }: LightGalleryViewProps) {
    return (
        <div className="lightGallery-container">
            <LightGallery
                onInit={(detail) => {
                    if (detail) {
                        detail.instance.openGallery(0);
                    }
                }}
                onAfterClose={onClose}
                speed={500}
                plugins={[lgThumbnail, lgZoom]}
                mode="lg-fade"
                counter={true}
                download={false}
                share={false}
                thumbnail={true}
                mobileSettings={{
                    controls: true,
                    showCloseIcon: true,
                    download: false,
                    swipeThreshold: 50,
                }}
            >
                {images.map((img) => (
                    <a
                        key={img.id}
                        href={img.url}
                        data-lg-size="1600-2400"
                        className="gallery-item"
                        data-src={img.url}
                        data-thumb={img.url_optimized || img.url}
                        data-sub-html={img.title || ''}
                    >
                        <img
                            alt={img.title || ''}
                            src={img.url_optimized || img.url}
                            className="hidden"
                        />
                    </a>
                ))}
            </LightGallery>
        </div>
    );
}

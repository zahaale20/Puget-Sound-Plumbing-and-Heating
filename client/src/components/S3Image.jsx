import React, { useState, useEffect } from 'react';
import { getSignedUrl } from '../api/imageService';

const S3Image = ({ imageKey, alt = "", className = "" }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            if (!imageKey) return;
            const url = await getSignedUrl(imageKey);
            if (isMounted) {
                setImageUrl(url);
                setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, [imageKey]);

    if (loading) return <div className={`animate-pulse bg-gray-200 ${className}`} />;

    return imageUrl ? (
        <img src={imageUrl} alt={alt} className={className} loading="lazy" />
    ) : (
        <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
            <span className="text-xs text-gray-400">Image Missing</span>
        </div>
    );
};

export default S3Image;
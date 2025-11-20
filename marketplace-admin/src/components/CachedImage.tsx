import React, { useState, useEffect } from 'react';
import './CachedImage.css';

interface CachedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

// 메모리 캐시
const imageCache = new Map<string, string>();

const CachedImage: React.FC<CachedImageProps> = ({
  src,
  alt,
  className = '',
  fallback = '📷'
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // 캐시에서 먼저 확인
    if (imageCache.has(src)) {
      setImageSrc(imageCache.get(src)!);
      setIsLoading(false);
      return;
    }

    // 이미지 프리로드
    const img = new Image();
    img.src = src;

    img.onload = () => {
      imageCache.set(src, src);
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (error) {
    return (
      <div className={`cached-image-error ${className}`}>
        <span className="cached-image-fallback">{fallback}</span>
      </div>
    );
  }

  if (isLoading || !imageSrc) {
    return (
      <div className={`cached-image-skeleton ${className}`}>
        <div className="skeleton-shimmer"></div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};

export default CachedImage;
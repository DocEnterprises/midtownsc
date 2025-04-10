import React from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className = '' }) => {
  return (
    <div className={`relative w-[120px] h-[120px] ${className}`}>
      <img
        src={src}
        alt={alt}
        className="object-cover w-full h-full rounded-lg"
        loading="lazy"
      />
    </div>
  );
};

export default ProductImage;
import React, { useState } from 'react';
import './ProductGallery.css';

export const ProductGallery = ({ images, name }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  // Hover zoom lens logic
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${images[activeIdx]})`,
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="product-gallery">
      {/* Thumbnail Strip */}
      <div className="thumbnail-strip">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`thumb-btn ${idx === activeIdx ? 'active' : ''}`}
            aria-label={`View image ${idx + 1}`}
          >
            <img src={img} alt={`${name} detail ${idx + 1}`} className="thumb-img" />
          </button>
        ))}
      </div>

      {/* Main Showcase Panel */}
      <div className="main-showcase">
        <div
          className="main-img-container"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={images[activeIdx]}
            alt={name}
            className="main-gallery-img"
          />
          {/* Zoom magnifying lens */}
          <div className="zoom-lens" style={zoomStyle}></div>
        </div>
      </div>
    </div>
  );
};
export default ProductGallery;

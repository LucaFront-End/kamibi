import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';
import './TestimonialsSection.css';

export const TestimonialsSection = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      quote: t('home.testimonials.t1.quote'),
      author: t('home.testimonials.t1.author'),
      location: t('home.testimonials.t1.location'),
      image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=600&auto=format&fit=crop",
      alt: "Quiet ocean shore representing water ceremony"
    },
    {
      quote: t('home.testimonials.t2.quote'),
      author: t('home.testimonials.t2.author'),
      location: t('home.testimonials.t2.location'),
      image: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop",
      alt: "Peaceful woodland paths representing earth ceremony"
    },
  ];

  // Auto scroll testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="testimonials-section section-padding">
      <div className="container testimonials-split-container">
        {/* Left Side: Testimonial details */}
        <div className="testimonials-info-col">
          <ScrollReveal direction="up" className="text-label testimonials-tag">
            {t('home.testimonials.title')}
          </ScrollReveal>

          <div className="quote-icon-decor">&ldquo;</div>

          <div className="testimonials-carousel-wrapper">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="testimonial-active-card"
              >
                <p className="testimonial-quote">
                  {testimonials[activeIndex].quote}
                </p>
                
                <div className="testimonial-meta">
                  <span className="testimonial-author">{testimonials[activeIndex].author}</span>
                  <span className="testimonial-location">{testimonials[activeIndex].location}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel indicators */}
          <div className="testimonials-dots">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`dot-btn ${idx === activeIndex ? 'active' : ''}`}
                aria-label={`Show review ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Image transition panel */}
        <div className="testimonials-image-col">
          <div className="testimonial-img-wrapper">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={testimonials[activeIndex].image}
                alt={testimonials[activeIndex].alt}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="testimonial-editorial-img"
              />
            </AnimatePresence>
            <div className="testimonial-img-frame"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default TestimonialsSection;

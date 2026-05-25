import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';
import './ReviewsSection.css';

export const ReviewsSection = () => {
  const { t } = useTranslation();
  const [reviewsList, setReviewsList] = useState([
    {
      id: 1,
      name: "Marcus G.",
      stars: 5,
      comment: "A beautiful, respectful way to say goodbye. The Terra Urn dissolved cleanly and gave our family a moment of true connection.",
      date: "May 12, 2026"
    },
    {
      id: 2,
      name: "Elena R.",
      stars: 5,
      comment: "We used the matching sharing set to send portions to relatives across the country. Highly recommend.",
      date: "April 28, 2026"
    }
  ]);

  const [formName, setFormName] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formStars, setFormStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formComment) return;

    const newReview = {
      id: Date.now(),
      name: formName,
      stars: formStars,
      comment: formComment,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setReviewsList([newReview, ...reviewsList]);
    setFormName("");
    setFormComment("");
    setFormStars(5);
    setShowForm(false);
  };

  const renderStars = (count, size = 16, interactive = false) => {
    return (
      <div className="stars-wrapper">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = interactive
            ? star <= (hoverStars || formStars)
            : star <= count;
          
          return (
            <svg
              key={star}
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={filled ? "var(--color-gold)" : "none"}
              stroke="var(--color-gold)"
              strokeWidth="1.5"
              className={interactive ? "interactive-star" : ""}
              onMouseEnter={() => interactive && setHoverStars(star)}
              onMouseLeave={() => interactive && setHoverStars(0)}
              onClick={() => interactive && setFormStars(star)}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          );
        })}
      </div>
    );
  };

  return (
    <div className="reviews-section">
      {/* Header */}
      <div className="reviews-header">
        <div>
          <h3 className="heading-section reviews-sec-title">{t('product.reviewsSec.title')}</h3>
          <div className="rating-summary-row">
            {renderStars(5, 20)}
            <span className="summary-count">({reviewsList.length} {t('product.reviews')})</span>
          </div>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="write-review-toggle-btn text-label">
          {showForm ? "Cancel" : t('product.reviewsSec.write')}
        </button>
      </div>

      <div className="divider-line"></div>

      {/* Review creator form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="write-review-form"
          >
            <div className="form-group-row">
              <div className="form-group">
                <label className="text-label form-label">{t('product.reviewsSec.name')}</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="text-label form-label">{t('product.reviewsSec.stars')}</label>
                {renderStars(formStars, 24, true)}
              </div>
            </div>

            <div className="form-group">
              <label className="text-label form-label">{t('product.reviewsSec.comment')}</label>
              <textarea
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                className="form-textarea"
                rows="4"
                required
              />
            </div>

            <button type="submit" className="submit-review-btn">
              {t('product.reviewsSec.submit')}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      <div className="reviews-list">
        <AnimatePresence initial={false}>
          {reviewsList.map((review, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={review.id}
              className="review-row"
            >
              <div className="review-row-header">
                <div>
                  <h4 className="reviewer-name">{review.name}</h4>
                  {renderStars(review.stars, 14)}
                </div>
                <span className="review-date">{review.date}</span>
              </div>
              <p className="reviewer-comment">{review.comment}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default ReviewsSection;

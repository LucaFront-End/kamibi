import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../components/layout/PageTransition';
import { MagneticButton } from '../components/ui/MagneticButton';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import './ContactPage.css';

export const ContactPage = () => {
  const { t, locale } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    { q: t('contact.faq.q1'), a: t('contact.faq.a1') },
    { q: t('contact.faq.q2'), a: t('contact.faq.a2') },
    { q: t('contact.faq.q3'), a: t('contact.faq.a3') }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setIsSubmitting(true);

    // Simulate Wix Forms or custom mail dispatch delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <PageTransition>
      <div className="contact-page">
        {/* Cinematic Hero */}
        <section className="contact-hero">
          <div className="contact-hero-overlay"></div>
          <div className="container contact-hero-content">
            <ScrollReveal direction="up" delay={0.1}>
              <span className="text-label contact-hero-tag">
                {t('contact.hero.tag')}
              </span>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.2}>
              <h1 className="contact-hero-title">
                {t('contact.hero.title')}
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.3}>
              <p className="contact-hero-subtitle">
                {t('contact.hero.subtitle')}
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Info & Form Section */}
        <section className="contact-body">
          <div className="container contact-grid">
            {/* Left Column: Direct Channels */}
            <ScrollReveal direction="up" className="contact-info-col">
              <h2 className="contact-section-title">{t('contact.info.title')}</h2>
              
              <div className="contact-cards-container">
                {/* Phone Card */}
                <a href="tel:+16786746128" className="contact-card">
                  <div className="contact-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div className="contact-card-details">
                    <span className="text-label card-label">{t('contact.info.phone')}</span>
                    <span className="card-value">+1 678 674 6128</span>
                  </div>
                </a>

                {/* Email Card */}
                <a href="mailto:contact@kamibistore.com" className="contact-card">
                  <div className="contact-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className="contact-card-details">
                    <span className="text-label card-label">{t('contact.info.email')}</span>
                    <span className="card-value">contact@kamibistore.com</span>
                  </div>
                </a>

                {/* Location Card */}
                <div className="contact-card no-hover">
                  <div className="contact-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="contact-card-details">
                    <span className="text-label card-label">{t('contact.info.location')}</span>
                    <span className="card-value">Georgia, USA</span>
                  </div>
                </div>

                {/* Hours Card */}
                <div className="contact-card no-hover">
                  <div className="contact-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="contact-card-details">
                    <span className="text-label card-label">{t('contact.info.hours')}</span>
                    <span className="card-value">{t('contact.info.hoursValue')}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Column: Contact Form */}
            <ScrollReveal direction="up" delay={0.2} className="contact-form-col">
              <h2 className="contact-section-title">{t('contact.form.title')}</h2>
              
              <div className="contact-form-container">
                <form onSubmit={handleSubmit} className="premium-form">
                  {/* Name Input Group */}
                  <div className={`form-group ${focusedField === 'name' ? 'focused' : ''} ${formData.name ? 'has-value' : ''}`}>
                    <label htmlFor="name" className="form-label">
                      {t('contact.form.name')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField('')}
                      placeholder={t('contact.form.placeholderName')}
                      required
                      className="form-input"
                    />
                    <div className="form-border-focus"></div>
                  </div>

                  {/* Email Input Group */}
                  <div className={`form-group ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'has-value' : ''}`}>
                    <label htmlFor="email" className="form-label">
                      {t('contact.form.email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      placeholder={t('contact.form.placeholderEmail')}
                      required
                      className="form-input"
                    />
                    <div className="form-border-focus"></div>
                  </div>

                  {/* Message Input Group */}
                  <div className={`form-group textarea-group ${focusedField === 'message' ? 'focused' : ''} ${formData.message ? 'has-value' : ''}`}>
                    <label htmlFor="message" className="form-label">
                      {t('contact.form.message')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField('')}
                      placeholder={t('contact.form.placeholderMessage')}
                      required
                      rows="5"
                      className="form-textarea"
                    ></textarea>
                    <div className="form-border-focus"></div>
                  </div>

                  {/* Feedback Messages */}
                  <AnimatePresence>
                    {isSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="form-message-success"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        {t('contact.form.success')}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <div className="form-submit-container">
                    <MagneticButton>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner"></span>
                            {t('contact.form.sending')}
                          </>
                        ) : (
                          t('contact.form.submit')
                        )}
                      </button>
                    </MagneticButton>
                  </div>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* FAQs Accordion Section */}
        <section className="contact-faq">
          <div className="container small-container">
            <ScrollReveal direction="up">
              <h2 className="faq-title text-center">{t('contact.faq.title')}</h2>
            </ScrollReveal>

            <div className="faq-list">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <ScrollReveal
                    key={index}
                    direction="up"
                    delay={0.1 * index}
                    className="faq-item-wrapper"
                  >
                    <div
                      className={`faq-header ${isOpen ? 'active' : ''}`}
                      onClick={() => toggleFaq(index)}
                    >
                      <h3 className="faq-question">{faq.q}</h3>
                      <span className="faq-toggle-icon">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </span>
                    </div>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="faq-answer-container"
                        >
                          <div className="faq-answer-content">
                            <p className="faq-answer">{faq.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

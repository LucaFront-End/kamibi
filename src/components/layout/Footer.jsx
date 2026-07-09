import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { useMagnetic } from '../../hooks/useMagnetic';
import { useFormCMS } from '../../hooks/useFormCMS';
import { ScrollReveal } from '../ui/ScrollReveal';
import './Footer.css';

export const Footer = () => {
  const { t, locale } = useTranslation();
  const backToTopRef = useMagnetic(0.4);
  const { submitToCMS } = useFormCMS();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);

    fetch("https://formsubmit.co/ajax/contact@kamibistore.com", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        newsletter_subscription: "true",
        _captcha: "false",
        _template: "plain",
        _subject: locale === 'es' ? "Nueva Suscripción Newsletter - Kamibi" : "New Newsletter Subscriber - Kamibi"
      })
    })
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then(() => {
      // Capture email before resetting state
      const submittedEmail = email;

      setIsSubmitting(false);
      setIsSubmitted(true);
      setEmail('');
      setTimeout(() => setIsSubmitted(false), 5000);

      // Fire-and-forget: also save to Wix CMS
      submitToCMS({
        type: 'newsletter',
        email: submittedEmail,
        locale,
        source: 'footer',
      });
    })
    .catch(err => {
      setIsSubmitting(false);
      console.error(err);
      alert(locale === 'es' ? 'Hubo un error al suscribirte. Por favor intenta de nuevo.' : 'There was an error subscribing. Please try again.');
    });
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        {/* Top Section with Brand Logo & Headline */}
        <div className="footer-top">
          <ScrollReveal direction="up" className="footer-brand-info">
            <Link to="/" className="footer-logo">
              <img
                src="/images/kamibi-logo-dark.png"
                alt="Kamibi"
                className="footer-logo-img"
              />
            </Link>
            <p className="footer-quote">
              &ldquo;{t('home.philosophy.text1')}&rdquo;
            </p>
            <div className="footer-contact-info">
              <a href="tel:+16786746128" className="footer-contact-link">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                +1 678 674 6128
              </a>
              <span className="footer-contact-link">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Georgia, USA
              </span>
            </div>
          </ScrollReveal>

          {/* Newsletter Signup Form */}
          <ScrollReveal direction="up" delay={0.2} className="footer-newsletter">
            <h4 className="footer-title">{t('home.cta.subtitle')}</h4>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="email@example.com"
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <button type="submit" className="newsletter-submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="newsletter-spinner"></span>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </button>
            </form>
            {isSubmitted && (
              <p className="newsletter-success-msg" style={{ fontSize: '12px', color: 'var(--color-gold)', marginTop: '8px' }}>
                {locale === 'es' ? '¡Gracias por suscribirte!' : 'Thank you for subscribing!'}
              </p>
            )}
          </ScrollReveal>
        </div>

        <div className="footer-divider"></div>

        {/* Middle Section: Columns of links */}
        <div className="footer-links-grid">
          <ScrollReveal direction="up" className="footer-col">
            <span className="text-label footer-label">{t('nav.shop')}</span>
            <ul className="footer-links">
              <li>
                <Link to="/store">{t('store.filters.all')}</Link>
              </li>
              <li>
                <Link to="/store?cat=urns">{t('store.filters.urns')}</Link>
              </li>
              <li>
                <Link to="/store?cat=minis">{t('store.filters.minis')}</Link>
              </li>
              <li>
                <Link to="/store?cat=bags">{t('store.filters.bags')}</Link>
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.1} className="footer-col">
            <span className="text-label footer-label">
              {locale === 'es' ? 'Empresa' : 'Company'}
            </span>
            <ul className="footer-links">
              <li><Link to="/about">{locale === 'es' ? 'Nosotros' : 'About'}</Link></li>
              <li><Link to="/blog">{locale === 'es' ? 'Blog' : 'Blog'}</Link></li>
              <li><Link to="/contact">{locale === 'es' ? 'Contacto' : 'Contact'}</Link></li>
              <li><Link to="/zonas">{locale === 'es' ? 'Zonas' : 'Locations'}</Link></li>
              <li><Link to="/mi-cuenta">{locale === 'es' ? 'Mi cuenta' : 'My account'}</Link></li>
            </ul>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.25} className="footer-col">
            <span className="text-label footer-label">Legal</span>
            <ul className="footer-links">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#tsa">TSA Compliance Guide</a></li>
              <li><a href="#shipping">Shipping &amp; Returns</a></li>
            </ul>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.3} className="footer-col">
            <span className="text-label footer-label">Social</span>
            <ul className="footer-links">
              <li><a href="#instagram">Instagram</a></li>
              <li><a href="#facebook">Facebook</a></li>
              <li><a href="#pinterest">Pinterest</a></li>
            </ul>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.4} className="footer-col footer-back-top-col">
            <button
              ref={backToTopRef}
              onClick={handleBackToTop}
              className="back-to-top"
              aria-label="Back to top"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </ScrollReveal>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            &copy; {new Date().getFullYear()} KAMIBI Store. All rights reserved.
          </p>
          <div className="compliance-badges">
            <span className="badge">100% Organic</span>
            <span className="badge">TSA Friendly</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

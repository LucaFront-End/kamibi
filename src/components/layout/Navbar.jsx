import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useMembers } from '../../context/MembersContext';
import { useMagnetic } from '../../hooks/useMagnetic';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

export const Navbar = () => {
  const { t, locale, toggleLanguage } = useTranslation();
  const { getItemCount, setIsCartOpen } = useCart();
  const { isLoggedIn, memberName, memberEmail } = useMembers();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Scroll detection to toggle navigation background styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Magnetic elements
  const logoRef = useMagnetic(0.2);
  const cartRef = useMagnetic(0.3);
  const langRef = useMagnetic(0.3);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.shop'), path: '/store' },
    { name: locale === 'es' ? 'Blog' : 'Blog', path: '/blog' },
    { name: locale === 'es' ? 'Nosotros' : 'About', path: '/about' },
    { name: locale === 'es' ? 'Contacto' : 'Contact', path: '/contact' },
  ];

  const isTransparentDark = (location.pathname === '/' || location.pathname === '/about' || location.pathname === '/contact') && !isScrolled;

  return (
    <>
      <header className={`navbar ${isScrolled ? 'scrolled' : ''} ${isTransparentDark ? 'transparent-dark-bg' : ''}`}>
        <div className="navbar-container">
          {/* Left Navigation Links */}
          <nav className="nav-menu desktop-only">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="nav-underline"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Centered Brand Logo */}
          <div className="navbar-logo-wrapper">
            <Link to="/" ref={logoRef} className="navbar-logo">
              <img
                src="/images/kamibi-logo-dark.png"
                alt="Kamibi"
                className="navbar-logo-img"
              />
            </Link>
          </div>

          {/* Right Action Items (Language, Cart, Mobile Menu Button) */}
          <div className="navbar-actions">
            {/* Language Switcher */}
            <button
              ref={langRef}
              onClick={toggleLanguage}
              className="lang-switcher desktop-only"
              aria-label="Toggle language"
            >
              <span className={locale === 'en' ? 'active-lang' : ''}>EN</span>
              <span className="lang-divider">/</span>
              <span className={locale === 'es' ? 'active-lang' : ''}>ES</span>
            </button>

            {/* Cart Icon Toggle */}
            <button
              ref={cartRef}
              onClick={() => setIsCartOpen(true)}
              className="cart-toggle"
              aria-label="Open cart"
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
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <AnimatePresence>
                {getItemCount() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="cart-badge"
                  >
                    {getItemCount()}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* User Account Icon */}
            <button
              onClick={() => navigate('/mi-cuenta')}
              className="user-toggle desktop-only"
              aria-label="Account"
            >
              {isLoggedIn && memberName ? (
                <span className="user-avatar-initial">
                  {memberName[0].toUpperCase()}
                </span>
              ) : (
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
              aria-label="Toggle mobile menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mobile-overlay-menu"
          >
            <nav className="mobile-nav-links">
              {[...navLinks,
                { name: locale === 'es' ? 'Mi cuenta' : 'My account', path: '/mi-cuenta' }
              ].map((link, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx, duration: 0.5 }}
                  key={link.path}
                >
                  <Link
                    to={link.path}
                    className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mobile-lang-wrapper"
              >
                <button onClick={toggleLanguage} className="mobile-lang-btn">
                  {locale === 'en' ? 'Español (ES)' : 'English (EN)'}
                </button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

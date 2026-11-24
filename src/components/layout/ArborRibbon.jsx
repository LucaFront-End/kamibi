import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../context/LanguageContext';
import { ArborDayTribute, ArborTreeSeal } from '../product/ArborDayTribute';
import './ArborRibbon.css';

export const ArborRibbon = () => {
  const { locale } = useTranslation();
  const isEs = locale === 'es';
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Close modal with Escape key
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleRibbonClick = () => {
    const productArborSection = document.getElementById('arbor-day-tribute');
    if (productArborSection) {
      productArborSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="arbor-ribbon" role="region" aria-label="Arbor Day Foundation partnership">
        <button
          type="button"
          onClick={handleRibbonClick}
          className="arbor-ribbon-btn"
        >
          <span className="arbor-ribbon-icon">
            <ArborTreeSeal size={16} />
          </span>

          <span className="arbor-ribbon-copy arbor-ribbon-copy--desktop">
            {isEs ? (
              <>
                Con cada urna biodegradable que compras, plantamos un árbol con{' '}
                <strong>Arbor Day Foundation</strong> · Incluye greeting card conmemorativa
              </>
            ) : (
              <>
                With every biodegradable urn purchased, we plant a tree with the{' '}
                <strong>Arbor Day Foundation</strong> · Memorial greeting card included
              </>
            )}
          </span>

          <span className="arbor-ribbon-copy arbor-ribbon-copy--mobile">
            {isEs ? (
              <>
                1 Urna = 1 Árbol plantado con <strong>Arbor Day Foundation</strong>
              </>
            ) : (
              <>
                1 Urn = 1 Tree planted with <strong>Arbor Day Foundation</strong>
              </>
            )}
          </span>

          <span className="arbor-ribbon-cta arbor-ribbon-cta--desktop">
            {isEs ? 'Ver tarjeta' : 'See card'} <span aria-hidden="true">→</span>
          </span>
          <span className="arbor-ribbon-cta arbor-ribbon-cta--mobile">
            {isEs ? 'Ver' : 'See'} <span aria-hidden="true">→</span>
          </span>
        </button>
      </div>

      {/* Greeting Card Detail Modal (for pages without inline #arbor-day-tribute section) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="arbor-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="arbor-modal-dialog"
              role="dialog"
              aria-modal="true"
              aria-label={
                isEs
                  ? 'Alianza Arbor Day Foundation y Greeting Card'
                  : 'Arbor Day Foundation Partnership & Greeting Card'
              }
              initial={{ opacity: 0, scale: 0.95, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 18 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="arbor-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label={isEs ? 'Cerrar' : 'Close'}
              >
                ✕
              </button>
              <ArborDayTribute variant="modal" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ArborRibbon;

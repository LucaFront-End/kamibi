import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../context/LanguageContext';
import './ArborDayTribute.css';

/**
 * Minimalist round tree emblem inspired by the Arbor Day Foundation seal.
 */
export const ArborTreeSeal = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`arbor-tree-seal ${className}`.trim()}
    aria-hidden="true"
  >
    <circle cx="16" cy="16" r="14.25" stroke="currentColor" strokeWidth="1.6" />
    {/* Crown / Canopy */}
    <path
      d="M16 6.2C12.7 6.2 10.6 8.3 10.6 10.8C9.1 11.4 8.2 12.9 8.2 14.5C8.2 16.9 10.2 18.7 12.6 18.7H19.4C21.8 18.7 23.8 16.9 23.8 14.5C23.8 12.9 22.9 11.4 21.4 10.8C21.4 8.3 19.3 6.2 16 6.2Z"
      fill="currentColor"
      fillOpacity="0.16"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinejoin="round"
    />
    {/* Trunk & roots */}
    <path
      d="M16 14.2V25.2M16 17.5L13.3 15.2M16 16.5L18.7 14.3M11.8 25.5H20.2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CARD_SIDES = ['front', 'inside', 'back'];

/**
 * Shared Arbor Day Foundation tribute & interactive Give-A-Tree® Greeting Card showcase.
 * Supports `variant="section"` (ProductPage) and `variant="modal"` (site-wide ArborRibbon).
 */
export const ArborDayTribute = ({ variant = 'section' }) => {
  const { locale } = useTranslation();
  const isEs = locale === 'es';
  const [activeSide, setActiveSide] = useState('front');

  const cycleSide = () => {
    setActiveSide((prev) => {
      const nextIdx = (CARD_SIDES.indexOf(prev) + 1) % CARD_SIDES.length;
      return CARD_SIDES[nextIdx];
    });
  };

  const features = isEs
    ? [
        {
          title: '1 Urna Biodegradable = 1 Árbol Plantado',
          desc: 'Reforestación certificada en bosques de América en alianza con Arbor Day Foundation.',
        },
        {
          title: 'Recibes una Greeting Card Oficial',
          desc: 'Cada pedido incluye esta tarjeta conmemorativa impresa que confirma el árbol plantado en honor a tu familiar.',
        },
        {
          title: 'Un Santuario Vivo para el Futuro',
          desc: 'Contribuye a restaurar hábitats y bosques naturales como un legado de vida permanente.',
        },
      ]
    : [
        {
          title: '1 Biodegradable Urn = 1 Tree Planted',
          desc: "Certified reforestation across America's forests in partnership with the Arbor Day Foundation.",
        },
        {
          title: 'Official Greeting Card Included',
          desc: 'Every order arrives with this printed memorial greeting card honoring your loved one.',
        },
        {
          title: 'A Living Sanctuary',
          desc: 'Helps restore forests and wildlife habitats as an enduring tribute of peace and renewal.',
        },
      ];

  const sideTabs = isEs
    ? [
        { id: 'front', label: 'Portada' },
        { id: 'inside', label: 'Interior' },
        { id: 'back', label: 'Reverso' },
      ]
    : [
        { id: 'front', label: 'Front' },
        { id: 'inside', label: 'Inside' },
        { id: 'back', label: 'Back' },
      ];

  const nextHint = isEs
    ? 'Haz clic en la tarjeta para ver portada, interior y reverso'
    : 'Click the card to inspect front cover, inside message & back seal';

  return (
    <div className={`arbor-tribute arbor-tribute--${variant}`}>
      {/* Left Column: Editorial Narrative */}
      <div className="arbor-narrative">
        <div className="arbor-eyebrow-pill">
          <ArborTreeSeal size={18} />
          <span>ARBOR DAY FOUNDATION · GIVE-A-TREE®</span>
        </div>

        <h2 className="heading-section arbor-heading">
          {isEs
            ? 'Un árbol vivo en honor a tu ser querido'
            : 'A living tree planted in their honor'}
        </h2>

        <p className="text-body arbor-lead">
          {isEs
            ? 'Con cada urna biodegradable Kamibi que adquieres, plantamos un árbol en uno de los bosques de América en alianza con la organización Arbor Day Foundation. Además, junto con tu pedido recibirás una tarjeta conmemorativa oficial (Greeting Card) donde se menciona que en honor a tu familiar se ha plantado un árbol.'
            : "With every Kamibi biodegradable urn you purchase, we plant a tree in one of America's forests in partnership with the Arbor Day Foundation. Your order also includes an official Give-A-Tree® Greeting Card letting your family know that a tree is being planted in honor of your loved one."}
        </p>

        <ul className="arbor-feature-list">
          {features.map((feat, idx) => (
            <li key={idx} className="arbor-feature-item">
              <span className="arbor-feature-dot" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <div>
                <strong className="arbor-feature-title">{feat.title}</strong>
                <p className="arbor-feature-desc">{feat.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="arbor-partner-footer">
          <a
            href="https://www.arborday.org/giveatree"
            target="_blank"
            rel="noopener noreferrer"
            className="arbor-partner-link"
          >
            arborday.org/giveatree <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      {/* Right Column: Interactive 3-Side Greeting Card Preview */}
      <div className="arbor-card-column">
        <div className="arbor-paper-stage">
          <div
            className="arbor-card-interactive-area"
            onClick={cycleSide}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                cycleSide();
              }
            }}
            aria-label={nextHint}
            title={nextHint}
          >
            <AnimatePresence mode="wait">
              {activeSide === 'front' && (
                <motion.div
                  key="front"
                  initial={{ opacity: 0, rotateY: -8, scale: 0.97 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: 8, scale: 0.97 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="arbor-card-sheet arbor-card-sheet--front"
                >
                  <img
                    src="/images/arbor-greeting-card-cover.png"
                    alt={
                      isEs
                        ? 'Portada de la tarjeta conmemorativa Give-A-Tree de Arbor Day Foundation'
                        : 'Arbor Day Foundation Give-A-Tree Greeting Card front cover'
                    }
                    className="arbor-card-cover-img"
                  />
                  <div className="arbor-cover-quote-overlay">
                    <p className="arbor-cover-quote">
                      &ldquo;There is something infinitely healing in the repeated refrains of nature.&rdquo;
                    </p>
                    <span className="arbor-cover-author">RACHEL CARSON</span>
                  </div>
                </motion.div>
              )}

              {activeSide === 'inside' && (
                <motion.div
                  key="inside"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="arbor-card-inside-wrap"
                >
                  <div className="arbor-card-bifold">
                    <div className="arbor-bifold-leaf arbor-bifold-leaf--left" aria-hidden="true" />
                    <div className="arbor-bifold-crease" aria-hidden="true" />
                    <div className="arbor-bifold-leaf arbor-bifold-leaf--right">
                      <p className="arbor-inside-message">
                        In your honor,
                        <br />
                        a tree is being planted in
                        <br />
                        one of America&apos;s forests.
                      </p>
                    </div>
                  </div>
                  {isEs && (
                    <p className="arbor-inside-translation">
                      &laquo;En tu honor, se está plantando un árbol en uno de los bosques de América.&raquo;
                    </p>
                  )}
                </motion.div>
              )}

              {activeSide === 'back' && (
                <motion.div
                  key="back"
                  initial={{ opacity: 0, rotateY: 8, scale: 0.97 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: -8, scale: 0.97 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="arbor-card-sheet arbor-card-sheet--back"
                >
                  <div className="arbor-back-content">
                    <h3 className="arbor-back-heading">
                      This gift will make a lasting difference.
                    </h3>
                    <p>
                      Your tree is being planted in one of America&apos;s forests, home to such noble
                      creatures as grizzly bears, wolves, bald eagles, and hundreds of other species.
                    </p>
                    <p>
                      Yet grand as they are, America&apos;s forests are in desperate need of
                      replanting because of unprecedented fires, insects, disease, and deforestation.
                    </p>
                    <p>
                      You have been honored with this Give-A-Tree<sup>&reg;</sup> card so that our
                      forests can be restored to their full grandeur... making them once again a
                      place of inspiration and a sanctuary for wild things of rare beauty and grace.
                    </p>
                    <p className="arbor-back-visit">
                      Visit <strong>arborday.org/giveatree</strong> to learn more.
                    </p>
                  </div>

                  <div className="arbor-back-seal-lockup">
                    <ArborTreeSeal size={34} />
                    <div className="arbor-back-org-name">
                      <span>Arbor Day</span>
                      <span>Foundation<sup className="arbor-tm">&trade;</sup></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Selector pills */}
        <div className="arbor-side-pills" role="tablist" aria-label={isEs ? 'Vistas de la tarjeta' : 'Card views'}>
          {sideTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeSide === tab.id}
              onClick={() => setActiveSide(tab.id)}
              className={`arbor-side-pill ${activeSide === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="arbor-card-caption">
          {isEs
            ? 'Greeting Card física oficial incluida con cada urna biodegradable · Toca la tarjeta para girar'
            : 'Official physical Greeting Card included with every biodegradable urn · Click card to view sides'}
        </p>
      </div>
    </div>
  );
};

export default ArborDayTribute;

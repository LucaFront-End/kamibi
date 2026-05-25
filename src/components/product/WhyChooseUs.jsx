import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { ScrollReveal } from '../ui/ScrollReveal';
import './WhyChooseUs.css';

export const WhyChooseUs = () => {
  const { t } = useTranslation();

  const rows = [
    {
      label: t('product.whyUs.table.f1'),
      kamibi: t('product.whyUs.table.f1_k'),
      traditional: t('product.whyUs.table.f1_t')
    },
    {
      label: t('product.whyUs.table.f2'),
      kamibi: t('product.whyUs.table.f2_k'),
      traditional: t('product.whyUs.table.f2_t')
    },
    {
      label: t('product.whyUs.table.f3'),
      kamibi: t('product.whyUs.table.f3_k'),
      traditional: t('product.whyUs.table.f3_t')
    },
    {
      label: t('product.whyUs.table.f4'),
      kamibi: t('product.whyUs.table.f4_k'),
      traditional: t('product.whyUs.table.f4_t')
    }
  ];

  return (
    <div className="why-choose-us">
      <ScrollReveal direction="up" className="why-header text-center">
        <h3 className="heading-section why-title">{t('product.whyUs.title')}</h3>
        <div className="divider-line-center"></div>
      </ScrollReveal>

      {/* Comparison table */}
      <ScrollReveal direction="up" delay={0.2} className="why-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>{t('product.whyUs.table.feature')}</th>
              <th className="kamibi-column">KAMIBI</th>
              <th>{t('product.whyUs.table.traditional')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="row-feature-label">{row.label}</td>
                <td className="row-kamibi-val">
                  <div className="kamibi-val-content">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="check-icon"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{row.kamibi}</span>
                  </div>
                </td>
                <td className="row-traditional-val">
                  <span>{row.traditional}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollReveal>
    </div>
  );
};
export default WhyChooseUs;

import React from 'react';
import { motion } from 'framer-motion';

export const SplitText = ({ children, className = '' }) => {
  if (typeof children !== 'string') return <span className={className}>{children}</span>;

  const words = children.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const wordVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo
      },
    },
  };

  return (
    <motion.span
      className={`split-text-container ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      style={{ display: 'inline-block' }}
    >
      {words.map((word, wordIndex) => (
        <span
          key={wordIndex}
          style={{
            display: 'inline-block',
            marginRight: '0.25em',
            overflow: 'hidden',
            verticalAlign: 'bottom',
            paddingBottom: '0.2em',
            marginBottom: '-0.2em'
          }}
        >
          <motion.span
            variants={wordVariants}
            style={{ display: 'inline-block' }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
};

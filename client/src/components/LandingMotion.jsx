import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-accent origin-left z-[60] pointer-events-none" style={{ scaleX }} />;
}

export function ParallaxKicker({ children }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 24, reduce ? 0 : -24]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);
  return <motion.div ref={ref} style={{ y, opacity }}>{children}</motion.div>;
}

export function Stagger({ children, delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', stiffness: 120, damping: 18, delay }}
    >
      {children}
    </motion.div>
  );
}

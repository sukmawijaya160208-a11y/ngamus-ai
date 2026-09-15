import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

export function TiltCard({ children, className = '', tiltAmount = 15 }) {
  const cardRef = useRef(null);
  const reduce = useReducedMotion();
  const [tiltValues, setTiltValues] = useState({ rotateX: 0, rotateY: 0 });

  useEffect(() => {
    if (reduce) return;

    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -tiltAmount;
      const rotateY = ((x - centerX) / centerX) * tiltAmount;
      setTiltValues({ rotateX, rotateY });
    };

    const handleMouseLeave = () => {
      setTiltValues({ rotateX: 0, rotateY: 0 });
    };

    const card = cardRef.current;
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [reduce, tiltAmount]);

  return (
    <motion.div
      ref={cardRef}
      className={className}
      style={{
        transform: `perspective(1000px) rotateX(${tiltValues.rotateX}deg) rotateY(${tiltValues.rotateY}deg)`,
        transition: 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxSection({ children, speed = 0.5, className = '' }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [100 * speed, -100 * speed]
  );

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

export function ScaleOnScroll({ children, className = '' }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduce ? [1, 1, 1] : [0.8, 1, 0.8]
  );

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.3, 1, 1, 0.3]
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ scale, opacity }}
    >
      {children}
    </motion.div>
  );
}

export function RotateOnScroll({ children, className = '', maxRotation = 10 }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [-maxRotation, maxRotation]
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotate }}
    >
      {children}
    </motion.div>
  );
}

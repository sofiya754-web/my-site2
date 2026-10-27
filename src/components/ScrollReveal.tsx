import React, { useLayoutEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollRevealProps {
  children: string;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom',
}) => {
  const containerRef = useRef<HTMLHeadingElement | null>(null);

  // Split into words while retaining natural whitespace and avoiding orphaned empty elements
  const splitText = useMemo(() => {
    const words = children.trim().split(/\s+/);
    return words.map((word, index) => (
      <span key={index} className="word">
        {word}
        {index < words.length - 1 ? ' ' : ''}
      </span>
    ));
  }, [children]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Use gsap.context for atomic cleanup and strict React 19 safety
    const ctx = gsap.context(() => {
      const scroller = scrollContainerRef?.current || undefined;

      // 1. Rotation animation
      gsap.fromTo(
        el,
        {
          rotation: baseRotation,
          transformOrigin: '0% 50%',
        },
        {
          rotation: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom',
            end: rotationEnd,
            scrub: true,
          },
        }
      );

      const words = el.querySelectorAll<HTMLElement>('.word');

      // 2. Opacity animation
      gsap.fromTo(
        words,
        {
          opacity: baseOpacity,
        },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom-=20%',
            end: wordAnimationEnd,
            scrub: true,
          },
        }
      );

      // 3. Blur animation
      if (enableBlur) {
        gsap.fromTo(
          words,
          {
            filter: `blur(${blurStrength}px)`,
          },
          {
            filter: 'blur(0px)',
            ease: 'none',
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: 'top bottom-=20%',
              end: wordAnimationEnd,
              scrub: true,
            },
          }
        );
      }
    }, containerRef);

    // Refresh ScrollTrigger after web fonts load so positions are 100% accurate
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => {
      ctx.revert();
    };
  }, [
    baseOpacity,
    baseRotation,
    blurStrength,
    enableBlur,
    rotationEnd,
    wordAnimationEnd,
    scrollContainerRef,
  ]);

  return (
    <h2 ref={containerRef} className={`scroll-reveal ${containerClassName}`.trim()}>
      <p className={`scroll-reveal-text ${textClassName}`.trim()}>{splitText}</p>
    </h2>
  );
};

export default ScrollReveal;

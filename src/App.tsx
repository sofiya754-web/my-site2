import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from './components/ScrollReveal';
import { FractureLogo, AtelierIcon } from './components/Icons';

const LOCAL_VIDEO_URL = '/fracture_bg.mp4';
const FALLBACK_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260521_064421_279656fd-e76f-40a0-8fed-7456d4f7715a.mp4';

/**
 * Reveal: Viewport-triggered fade-in with ease-out-expo cubic bezier
 */
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * NavItem: Hover-animated navigation link with vertical text fly animation
 * Typography: Roboto Mono Medium (weight 500), ~13.5px, letter-spacing 0, uppercase
 */
function NavItem({ label, href = '#' }: { label: string; href?: string }) {
  const [cycle, setCycle] = useState(0);

  const handleInteraction = () => {
    setCycle((prev) => prev + 1);
  };

  return (
    <a
      href={href}
      onMouseEnter={handleInteraction}
      onMouseLeave={handleInteraction}
      className="relative overflow-hidden group flex items-center justify-center py-1 cursor-pointer font-mono font-medium text-[13.5px] tracking-normal uppercase"
    >
      {cycle === 0 ? (
        <span className="text-white/64 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
          {label}
        </span>
      ) : (
        <>
          <span key={`out-${cycle}`} className="animate-fly-out-up text-white whitespace-nowrap">
            {label}
          </span>
          <span
            key={`in-${cycle}`}
            className="absolute animate-fly-in-up text-white whitespace-nowrap"
          >
            {label}
          </span>
        </>
      )}
    </a>
  );
}

export default function App() {
  const [arrowCycle, setArrowCycle] = useState(0);
  const [footerArrowCycle, setFooterArrowCycle] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const screen3Ref = useRef<HTMLDivElement | null>(null);

  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 500, 800], [0, 0, -150]);

  // Effect 1: Video Ready State Detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();

    const handleCanPlay = () => {
      video.pause();
      setIsLoaded(true);
    };

    if (video.readyState >= 2) {
      setIsLoaded(true);
    }

    video.addEventListener('canplaythrough', handleCanPlay);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleCanPlay);
    video.addEventListener('loadedmetadata', handleCanPlay);

    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlay);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleCanPlay);
      clearTimeout(timer);
    };
  }, []);

  // Effect 2: 60FPS Scroll-Playback Engine
  useEffect(() => {
    if (!isLoaded) return;
    const video = videoRef.current;
    if (!video) return;

    video.pause();

    let targetTime = 0;
    let rafId: number;

    const calculateTargetTime = () => {
      if (!screen3Ref.current) return;
      const duration = video.duration || 11.0;

      const rect = screen3Ref.current.getBoundingClientRect();
      const absoluteTop = window.scrollY + rect.top;
      const stopScroll = Math.max(1, absoluteTop - window.innerHeight * 0.2);

      const maxScrollY = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const effectiveStop = Math.min(stopScroll, maxScrollY);

      let scrollFraction = Math.max(0, Math.min(1, window.scrollY / effectiveStop));

      if (window.scrollY >= maxScrollY - 10) {
        scrollFraction = 1;
      }

      targetTime = scrollFraction * duration;
    };

    const tick = () => {
      if (video && video.duration) {
        const duration = video.duration;
        const current = video.currentTime;
        const diff = targetTime - current;

        if (diff > 0.04) {
          if (diff > 1.5 && !video.seeking) {
            video.currentTime = targetTime - 0.25;
          } else {
            const rate = Math.min(3.5, Math.max(0.75, diff * 2.2));
            if (Math.abs(video.playbackRate - rate) > 0.1) {
              video.playbackRate = rate;
            }

            if (video.paused) {
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise.catch(() => {});
              }
            }
          }
        } else if (diff < -0.05) {
          if (!video.paused) {
            video.pause();
          }
          if (!video.seeking) {
            const step = Math.max(targetTime, current + diff * 0.35);
            video.currentTime = Math.max(0, Math.min(duration - 0.01, step));
          }
        } else {
          if (!video.paused) {
            video.pause();
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', calculateTargetTime, { passive: true });
    calculateTargetTime();
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', calculateTargetTime);
      cancelAnimationFrame(rafId);
      if (video && !video.paused) {
        video.pause();
      }
    };
  }, [isLoaded]);

  const handleHeroArrowInteraction = () => {
    setArrowCycle((c) => c + 1);
  };

  const handleFooterArrowInteraction = () => {
    setFooterArrowCycle((c) => c + 1);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans overflow-x-hidden">
      {/* SECTION 0: LOADING SCREEN */}
      {!isLoaded && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          <div className="text-[12px] font-mono font-medium tracking-normal mb-4 text-white/50 uppercase">
            FRACTURE / ГЛАВА 01: АВАРИЯ
          </div>
          <div className="w-64 h-[1px] bg-white/10 mt-8 overflow-hidden">
            <div className="h-full bg-white w-1/3 animate-pulse" />
          </div>
        </div>
      )}

      {/* 1. FIXED VIDEO BACKGROUND */}
      <div
        ref={videoContainerRef}
        className="fixed inset-0 z-0 bg-black overflow-hidden pointer-events-none"
      >
        <video
          ref={videoRef}
          src={LOCAL_VIDEO_URL}
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== FALLBACK_VIDEO_URL) {
              target.src = FALLBACK_VIDEO_URL;
              target.load();
            }
          }}
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          preload="auto"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45 pointer-events-none" />
      </div>

      {/* 2. FIXED HEADER */}
      <motion.header
        style={{ y: headerY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 mx-auto z-20 w-[90%] flex items-center justify-between pointer-events-auto py-4 md:py-6 lg:py-8"
      >
        {/* Left: Wordmark - Inter Bold 700, ~40-44px desktop */}
        <a href="#hero" className="flex items-center text-white focus:outline-none">
          <FractureLogo className="text-[clamp(26px,2.8vw,42px)]" />
        </a>

        {/* Right: Navigation bar */}
        <div className="hidden lg:flex items-stretch bg-[#1A1A1A]/40 backdrop-blur-[80px] border border-white/10">
          <nav className="flex items-center justify-between px-7 font-mono font-medium text-[13.5px] tracking-normal gap-8">
            <NavItem label="СИЛУЭТЫ" href="#hero" />
            <NavItem label="КАТАСТРОФА" href="#narrative" />
            <NavItem label="АТЕЛЬЕ" href="#workshop" />
            <NavItem label="МЕТАЛЛУРГИЯ" href="#jewelry" />
            <NavItem label="АРХИВ" href="#archive" />
          </nav>
          <button
            type="button"
            onClick={() => scrollToSection('archive')}
            className="bg-white text-black px-6 py-5 font-mono font-medium text-[13.5px] leading-none tracking-normal uppercase hover:bg-gray-200 transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap"
          >
            ЗАКАЗАТЬ ЛУКБУК
          </button>
        </div>

        {/* Mobile quick CTA button */}
        <button
          type="button"
          onClick={() => scrollToSection('archive')}
          className="lg:hidden bg-white text-black px-4 py-2 font-mono font-medium text-[13px] tracking-normal uppercase hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
        >
          САЛОН
        </button>
      </motion.header>

      {/* 3. SCROLLABLE CONTENT */}
      <div className="relative z-10 w-full">
        {/* SECTION 1: HERO (Screen 1)
            Notice: pt-28 sm:pt-32 md:pt-40 lg:pt-44 provides ample header clearance on all devices,
            preventing ANY overlap with the fixed header. min-h-screen ensures robust responsiveness.
        */}
        <section
          id="hero"
          className="w-[90%] mx-auto min-h-screen flex flex-col justify-between pt-28 sm:pt-32 md:pt-40 lg:pt-44 pb-12 md:pb-16"
        >
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-12 md:grid-rows-[1fr_auto] gap-y-10 md:gap-y-12 items-end">
            {/* 1. Introductory Paragraph (Desktop: top-right in row 1; Mobile: order-2 below headline)
                NO negative top offset! Starts cleanly below the navigation bar.
            */}
            <div className="order-2 md:order-none md:row-start-1 md:col-start-6 lg:col-start-7 md:col-span-7 lg:col-span-6 md:self-start md:justify-self-end w-full">
              <Reveal delay={0.3}>
                <p className="font-sans font-normal text-[clamp(1.125rem,1.8vw,28px)] text-white/64 leading-[1.25] tracking-[-0.025em] text-left md:text-right max-w-[620px] md:ml-auto">
                  Концептуальное исследование независимого модного дома,
                  развернувшееся посреди таинственной автокатастрофы и подиума в заброшенной
                  мастерской. Мы заменяем стерильные каталоги напряжением нуарного артхауса.{' '}
                  <strong className="font-semibold text-white block mt-2 sm:mt-1">
                    Где разбитый хром рождает бунтарскую, бескомпромиссную роскошь.
                  </strong>
                </p>
              </Reveal>
            </div>

            {/* 2. Hero Headline (Desktop: bottom-left in row 2; Mobile: order-1 with full top header clearance)
                Cleanly arranged across 2 lines without crowding the button or colliding with the header.
            */}
            <div className="order-1 md:order-none md:row-start-2 md:col-start-1 md:col-span-8 md:self-end w-full">
              <Reveal delay={0.2}>
                <h1 className="font-sans font-normal text-[clamp(2.5rem,6.4vw,100px)] leading-[1.03] tracking-[-0.04em] text-white text-left max-w-[900px]">
                  Скульптурный металл /
                  <br className="hidden sm:inline" />
                  {' '}Анатомия столкновения
                </h1>
              </Reveal>
            </div>

            {/* 3. CTA Button (Desktop: bottom-right in row 2; Mobile: order-3 at bottom)
                Assigned to col-start-9 md:col-span-4 so it NEVER overlaps with the headline.
            */}
            <div className="order-3 md:order-none md:row-start-2 md:col-start-9 md:col-span-4 md:self-end md:justify-self-end flex items-end justify-start md:justify-end">
              <Reveal delay={0.4}>
                <div
                  onMouseEnter={handleHeroArrowInteraction}
                  onMouseLeave={handleHeroArrowInteraction}
                  onClick={() => scrollToSection('workshop')}
                  className="flex items-stretch gap-1 group cursor-pointer max-w-full"
                >
                  {/* Text part */}
                  <div className="px-5 sm:px-8 py-3.5 sm:py-5 bg-white/8 backdrop-blur-[80px] group-hover:bg-white transition-colors duration-300 flex items-center">
                    <span className="font-mono font-medium text-[12.5px] sm:text-[13.5px] tracking-normal text-white/90 group-hover:text-black transition-colors duration-300 uppercase whitespace-nowrap">
                      СМОТРЕТЬ ЛУКБУК
                    </span>
                  </div>

                  {/* Arrow part */}
                  <div className="px-4 sm:px-6 bg-white/8 backdrop-blur-[80px] group-hover:bg-white transition-colors duration-300 flex items-center justify-center relative overflow-hidden min-w-[50px] sm:min-w-[68px] shrink-0">
                    {arrowCycle === 0 ? (
                      <ArrowRight className="w-5 h-5 text-white/90 group-hover:text-black transition-colors duration-300" />
                    ) : (
                      <>
                        <span
                          key={`arrow-out-${arrowCycle}`}
                          className="animate-fly-out text-black flex items-center"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </span>
                        <span
                          key={`arrow-in-${arrowCycle}`}
                          className="absolute animate-fly-in text-black flex items-center"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* SECTION 1.5: SPACER */}
        <div id="narrative" className="h-[120px] md:h-[200px] w-full" />

        {/* SECTION 2: SCROLL-REVEAL TEXT + 3-COLUMN GRID */}
        <section
          id="workshop"
          className="w-[90%] mx-auto min-h-screen flex flex-col justify-center py-8 md:py-12 lg:py-16"
        >
          <div className="max-w-[1260px] w-full">
            <ScrollReveal
              baseOpacity={0.1}
              enableBlur={true}
              baseRotation={3}
              blurStrength={4}
              textClassName="font-sans font-normal text-[clamp(2rem,4.1vw,3.75rem)] leading-[1.1] tracking-[-0.035em] text-white w-full"
            >
              Искореженный кузов, превращенный в подиум. Где промышленный лом встречается с ручным кашемиром, жженой кожей и монументальным литым металлом.
            </ScrollReveal>

            {/* 3-Column Grid below */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
              {/* Col 1 */}
              <div className="md:col-span-4">
                <Reveal delay={0.1}>
                  <div className="flex items-center gap-4">
                    <AtelierIcon className="w-[71px] h-[43px] text-white flex-shrink-0" />
                    <FractureLogo className="text-[20px] md:text-[24px]" />
                  </div>
                  <p className="mt-6 text-[12px] font-mono font-medium tracking-normal text-white/60 uppercase leading-relaxed">
                    БУНТАРСКАЯ РОСКОШЬ / ГЛАВА 01: СТОЛКНОВЕНИЕ
                  </p>
                </Reveal>
              </div>

              {/* Col 2 */}
              <div className="md:col-span-4">
                <Reveal delay={0.2}>
                  <h3 className="font-sans font-medium text-[clamp(1.15rem,1.5vw,1.4rem)] leading-[1.25] tracking-[-0.02em] text-white mb-3">
                    Скульптурные силуэты / Обугленные драпировки
                  </h3>
                  <p className="font-sans font-normal text-[15px] text-white/75 leading-[1.55]">
                    Плотная японская шерсть, обожженная телячья кожа и
                    углеродное волокно. Каждый силуэт воплощает энергию резкого
                    торможения через острые лацканы и скульптурную броню.
                  </p>
                </Reveal>
              </div>

              {/* Col 3 */}
              <div className="md:col-span-4">
                <Reveal delay={0.3}>
                  <h3 className="font-sans font-medium text-[clamp(1.15rem,1.5vw,1.4rem)] leading-[1.25] tracking-[-0.02em] text-white mb-3">
                    Массивная металлургия / Грубые украшения
                  </h3>
                  <p className="font-sans font-normal text-[15px] text-white/75 leading-[1.55]">
                    Кованый хирургический титан, состаренная латунь и
                    полированная автомобильная сталь. Монументальные чокеры и
                    кольца-кастеты, ловящие блики под натриевыми лампами.
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2.5: SPACER */}
        <div id="jewelry" className="h-[120px] md:h-[200px] w-full" />

        {/* SECTION 3: FOOTER */}
        <footer
          id="archive"
          ref={screen3Ref}
          style={{ width: '90%', margin: '0 auto', paddingBottom: '96px', minHeight: '85vh' }}
        >
          <div
            style={{
              backgroundColor: 'rgba(26, 26, 26, 0.6)',
              backdropFilter: 'blur(80px)',
              WebkitBackdropFilter: 'blur(80px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: 'clamp(20px, 4vw, 64px)',
              overflow: 'hidden',
            }}
          >
            {/* CTA Section */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '32px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: 'clamp(36px, 4vw, 80px)',
              }}
            >
              <h2
                className="font-sans font-normal tracking-[-0.03em] text-white"
                style={{
                  fontSize: 'clamp(1.75rem, 4.5vw, 3.5rem)',
                  lineHeight: 1.05,
                  margin: 0,
                  maxWidth: '750px',
                }}
              >
                Обломки как искусство /
                <br />
                Обрести нарратив
              </h2>

              {/* Footer CTA Button */}
              <div
                onMouseEnter={handleFooterArrowInteraction}
                onMouseLeave={handleFooterArrowInteraction}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full sm:w-auto flex items-stretch gap-1 group cursor-pointer max-w-full"
              >
                <div
                  className="flex-1 sm:flex-initial px-4 sm:px-8 py-3.5 sm:py-5 bg-white group-hover:bg-neutral-200 transition-colors duration-300 flex items-center justify-center sm:justify-start"
                >
                  <span className="font-mono font-medium text-[11.5px] sm:text-[13.5px] tracking-normal text-black uppercase whitespace-nowrap">
                    ЗАПИСЬ В ЧАСТНЫЙ САЛОН
                  </span>
                </div>
                <div
                  className="px-3.5 sm:px-6 min-w-[46px] sm:min-w-[68px] bg-white group-hover:bg-neutral-200 transition-colors duration-300 flex items-center justify-center relative overflow-hidden shrink-0"
                >
                  {footerArrowCycle === 0 ? (
                    <ArrowRight className="w-5 h-5 text-black" />
                  ) : (
                    <>
                      <span
                        key={`f-out-${footerArrowCycle}`}
                        className="animate-fly-out text-black flex items-center"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </span>
                      <span
                        key={`f-in-${footerArrowCycle}`}
                        className="absolute animate-fly-in text-black flex items-center"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Links Grid */}
            <div
              style={{
                paddingTop: 'clamp(40px, 4vw, 64px)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 'clamp(28px, 3vw, 48px)',
              }}
            >
              {/* Col 1: Brand */}
              <div>
                <FractureLogo className="text-[28px] md:text-[34px] mb-4" />
                <p
                  className="font-sans font-normal text-white/50"
                  style={{
                    fontSize: '13.5px',
                    maxWidth: '250px',
                    lineHeight: '1.6',
                    margin: 0,
                  }}
                >
                  Независимое ателье, бросающее вызов традиционным онлайн-магазинам
                  через эстетику нуара, монументальные декорации и авторские
                  скульптурные аксессуары.
                </p>
              </div>

              {/* Col 2: Atelier */}
              <div>
                <div className="font-mono font-medium text-[12px] tracking-normal text-white/40 mb-4 uppercase">
                  АТЕЛЬЕ
                </div>
                <ul className="space-y-3 p-0 m-0 list-none">
                  {['Лукбук', 'Нарратив', 'Сценография', 'Частный салон'].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="font-sans font-normal text-[14px] text-white/60 hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3: Artifacts */}
              <div>
                <div className="font-mono font-medium text-[12px] tracking-normal text-white/40 mb-4 uppercase">
                  АРТЕФАКТЫ
                </div>
                <ul className="space-y-3 p-0 m-0 list-none">
                  {[
                    'Скульптурная одежда',
                    'Кованый титан',
                    'Обожженная кожа',
                    'Индивидуальный пошив',
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="font-sans font-normal text-[14px] text-white/60 hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 4: Connect */}
              <div>
                <div className="font-mono font-medium text-[12px] tracking-normal text-white/40 mb-4 uppercase">
                  СВЯЗЬ
                </div>
                <ul className="space-y-3 p-0 m-0 list-none">
                  {[
                    'Парижский салон',
                    'Пресс-досье',
                    'Реестр клиентов',
                    'Запросы кураторам',
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="font-sans font-normal text-[14px] text-white/60 hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Copyright Bar */}
            <div
              className="mt-12 sm:mt-14 pt-6 sm:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 w-full"
            >
              <div className="font-mono text-[11px] sm:text-[12px] tracking-normal text-white/40 uppercase whitespace-nowrap">
                2026 FRACTURE ATELIER. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] sm:text-[12px] tracking-normal text-white/40 uppercase">
                <a href="#" className="hover:text-white/70 transition-colors whitespace-nowrap">
                  ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ
                </a>
                <span className="hidden sm:inline text-white/20">|</span>
                <a href="#" className="hover:text-white/70 transition-colors whitespace-nowrap">
                  ПРАВИЛА САЛОНА
                </a>
                <span className="hidden sm:inline text-white/20">|</span>
                <a href="#" className="hover:text-white/70 transition-colors whitespace-nowrap">
                  ДОСТУП К АРХИВУ
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

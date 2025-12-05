'use client';

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface DotData {
  x: number;
  y: number;
  scale: number;
  color: string;
}

interface SwirlData {
  viewBox: { width: number; height: number };
  dots: DotData[];
}

type FitMode = 'contain' | 'cover' | 'fill';
type Alignment = 'start' | 'center' | 'end';

interface HalftoneSwirlProps {
  className?: string;
  /** Mouse effect radius in pixels */
  effectRadius?: number;
  /** Effect strength (0-1) */
  effectStrength?: number;
  /** Animation smoothing (higher = smoother but slower) */
  smoothing?: number;
  /** How to fit the artwork: contain (default), cover, or fill */
  fit?: FitMode;
  /** Horizontal alignment: start, center (default), end */
  alignX?: Alignment;
  /** Vertical alignment: start, center (default), end */
  alignY?: Alignment;
}

// Parse hex color to number
function hexToNumber(hex: string): number {
  // Remove # and alpha if present (e.g., #435A5EFF -> 435A5E)
  const clean = hex.replace('#', '').slice(0, 6);
  return parseInt(clean, 16);
}

export function HalftoneSwirl({
  className = '',
  effectRadius = 150,
  effectStrength = 0.4,
  smoothing = 0.1,
  fit = 'contain',
  alignX = 'center',
  alignY = 'center',
}: HalftoneSwirlProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const particlesRef = useRef<PIXI.Sprite[]>([]);
  const originalPositionsRef = useRef<{ x: number; y: number; scale: number }[]>([]);
  const baseDotsRef = useRef<DotData[]>([]);
  const viewBoxRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const rafRef = useRef<number>(0);
  const configRef = useRef({ effectRadius, effectStrength, smoothing, fit, alignX, alignY });

  // Update config ref when props change
  useEffect(() => {
    configRef.current = { effectRadius, effectStrength, smoothing, fit, alignX, alignY };
  }, [effectRadius, effectStrength, smoothing, fit, alignX, alignY]);

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;
    let resizeObserver: ResizeObserver | null = null;

    // Calculate positions based on container size and fit/alignment settings
    function calculatePositions() {
      const container = containerRef.current;
      const particles = particlesRef.current;
      const baseDots = baseDotsRef.current;
      const viewBox = viewBoxRef.current;
      const config = configRef.current;

      if (!container || !particles.length || !viewBox.width) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const scaleX = containerWidth / viewBox.width;
      const scaleY = containerHeight / viewBox.height;
      let scale: number;

      switch (config.fit) {
        case 'cover':
          scale = Math.max(scaleX, scaleY);
          break;
        case 'fill':
          scale = 1;
          break;
        case 'contain':
        default:
          scale = Math.min(scaleX, scaleY);
          break;
      }

      const scaledWidth = config.fit === 'fill' ? containerWidth : viewBox.width * scale;
      const scaledHeight = config.fit === 'fill' ? containerHeight : viewBox.height * scale;

      let offsetX: number;
      switch (config.alignX) {
        case 'start':
          offsetX = 0;
          break;
        case 'end':
          offsetX = containerWidth - scaledWidth;
          break;
        case 'center':
        default:
          offsetX = (containerWidth - scaledWidth) / 2;
          break;
      }

      let offsetY: number;
      switch (config.alignY) {
        case 'start':
          offsetY = 0;
          break;
        case 'end':
          offsetY = containerHeight - scaledHeight;
          break;
        case 'center':
        default:
          offsetY = (containerHeight - scaledHeight) / 2;
          break;
      }

      const originals: { x: number; y: number; scale: number }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const dot = baseDots[i];

        let newX: number, newY: number, newScale: number;

        if (config.fit === 'fill') {
          newX = dot.x * scaleX + offsetX;
          newY = dot.y * scaleY + offsetY;
          newScale = dot.scale * Math.min(scaleX, scaleY);
        } else {
          newX = dot.x * scale + offsetX;
          newY = dot.y * scale + offsetY;
          newScale = dot.scale * scale;
        }

        particle.x = newX;
        particle.y = newY;
        particle.scale.set(newScale);

        originals.push({ x: newX, y: newY, scale: newScale });
      }

      originalPositionsRef.current = originals;
    }

    // Animation loop function
    function animate() {
      if (!mounted) return;

      const particles = particlesRef.current;
      const originals = originalPositionsRef.current;
      const mouse = mouseRef.current;
      const config = configRef.current;

      if (particles.length && mouse.active) {
        const radiusSq = config.effectRadius * config.effectRadius;

        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          const original = originals[i];

          // Calculate distance to mouse
          const dx = particle.x - mouse.x;
          const dy = particle.y - mouse.y;
          const distSq = dx * dx + dy * dy;

          let targetX = original.x;
          let targetY = original.y;
          let targetScale = original.scale;

          if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / config.effectRadius) * config.effectStrength;

            // Repulsion effect - push away from mouse
            const angle = Math.atan2(dy, dx);
            targetX = original.x + Math.cos(angle) * force * config.effectRadius * 0.5;
            targetY = original.y + Math.sin(angle) * force * config.effectRadius * 0.5;

            // Scale up slightly near mouse
            targetScale = original.scale * (1 + force * 0.5);
          }

          // Smooth interpolation
          particle.x += (targetX - particle.x) * config.smoothing;
          particle.y += (targetY - particle.y) * config.smoothing;
          particle.scale.set(
            particle.scale.x + (targetScale - particle.scale.x) * config.smoothing
          );
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    async function init() {
      // Load dot data
      const response = await fetch('/images/halftone_swirl_data.json');
      const data: SwirlData = await response.json();

      if (!mounted || !containerRef.current) return;

      // Store base dot data for resize calculations
      baseDotsRef.current = data.dots;
      viewBoxRef.current = data.viewBox;

      // Create Pixi application
      const app = new PIXI.Application();
      await app.init({
        resizeTo: containerRef.current,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (!mounted || !containerRef.current) {
        app.destroy();
        return;
      }

      containerRef.current.appendChild(app.canvas);
      app.canvas.style.pointerEvents = 'none';
      appRef.current = app;

      // Create a texture for the dot (circle)
      const baseRadius = 1;
      const graphics = new PIXI.Graphics();
      graphics.circle(0, 0, baseRadius);
      graphics.fill(0xffffff);
      const texture = app.renderer.generateTexture(graphics);
      graphics.destroy();

      // Create container for all particles
      const particleContainer = new PIXI.Container();
      app.stage.addChild(particleContainer);

      // Create particles (positions will be set by calculatePositions)
      const particles: PIXI.Sprite[] = [];

      for (const dot of data.dots) {
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.tint = hexToNumber(dot.color);
        particleContainer.addChild(sprite);
        particles.push(sprite);
      }

      particlesRef.current = particles;

      // Calculate initial positions
      calculatePositions();

      // Set up resize observer for responsive behavior
      resizeObserver = new ResizeObserver(() => {
        if (appRef.current && containerRef.current) {
          appRef.current.renderer.resize(
            containerRef.current.clientWidth,
            containerRef.current.clientHeight
          );
          calculatePositions();
        }
      });
      resizeObserver.observe(containerRef.current);

      // Start animation loop
      rafRef.current = requestAnimationFrame(animate);
    }

    init();

    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
      particlesRef.current = [];
      originalPositionsRef.current = [];
      baseDotsRef.current = [];
    };
  }, []);

  // Window-level mouse tracking to work even when content is layered above
  useEffect(() => {
    let wasActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if mouse is within container bounds
      const isInside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

      if (isInside) {
        mouseRef.current.x = x;
        mouseRef.current.y = y;
        mouseRef.current.active = true;
        wasActive = true;
      } else if (wasActive) {
        mouseRef.current.active = false;
        wasActive = false;
        animateReturn();
      }
    };

    const animateReturn = () => {
      const config = configRef.current;
      const particles = particlesRef.current;
      const originals = originalPositionsRef.current;
      let needsUpdate = false;

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const original = originals[i];
        if (!original) continue;

        const dx = original.x - particle.x;
        const dy = original.y - particle.y;
        const ds = original.scale - particle.scale.x;

        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 || Math.abs(ds) > 0.001) {
          particle.x += dx * config.smoothing;
          particle.y += dy * config.smoothing;
          particle.scale.set(particle.scale.x + ds * config.smoothing);
          needsUpdate = true;
        }
      }

      if (needsUpdate && !mouseRef.current.active) {
        requestAnimationFrame(animateReturn);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
    />
  );
}

export default HalftoneSwirl;

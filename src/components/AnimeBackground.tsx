import { useEffect, useRef } from 'react';

export type BackgroundTheme = 'petals' | 'sparks' | 'stars' | 'matrix' | 'none';
export type ParticleDensity = 'low' | 'medium' | 'high';

interface AnimeBackgroundProps {
  theme: BackgroundTheme;
  density: ParticleDensity;
  opacity: number; // 0.1 to 1.0
}

export function AnimeBackground({ theme, density, opacity }: AnimeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Keep refs of current values to avoid re-initializing animation loop on every prop change
  const currentTheme = useRef<BackgroundTheme>(theme);
  const currentDensity = useRef<ParticleDensity>(density);
  const currentOpacity = useRef<number>(opacity);
  const mousePos = useRef({ x: -1000, y: -1000 });
  const scrollOffset = useRef(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    currentTheme.current = theme;
  }, [theme]);

  useEffect(() => {
    currentDensity.current = density;
  }, [density]);

  useEffect(() => {
    currentOpacity.current = opacity;
  }, [opacity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mousePos.current.x = -1000;
      mousePos.current.y = -1000;
    };

    // Track scroll velocity for kinetic force
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;
      scrollOffset.current = diff * 0.8; // scaling factor
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Handle canvas resizing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };
    window.addEventListener('resize', handleResize);

    // Particle Classes and Types
    interface Petal {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      rotationX: number;
      rotationY: number;
      rotationZ: number;
      rotationSpeedX: number;
      rotationSpeedY: number;
      rotationSpeedZ: number;
      swingRange: number;
      swingSpeed: number;
      swingTime: number;
      opacity: number;
      color: string;
      isWholeFlower: boolean;
    }

    interface Spark {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      maxLife: number;
      life: number;
      color: string;
      glowColor: string;
      amplitude: number;
      frequency: number;
      time: number;
    }

    interface Star {
      x: number;
      y: number;
      size: number;
      baseOpacity: number;
      opacity: number;
      twinkleSpeed: number;
      twinkleTime: number;
      color: string;
    }

    interface ShootingStar {
      x: number;
      y: number;
      dx: number;
      dy: number;
      length: number;
      speed: number;
      life: number;
      maxLife: number;
      color: string;
    }

    interface MatrixDrop {
      x: number;
      y: number;
      speed: number;
      chars: string[];
      length: number;
      fontSize: number;
      opacity: number;
    }

    let petals: Petal[] = [];
    let sparks: Spark[] = [];
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let matrixDrops: MatrixDrop[] = [];

    // Map density levels to particle counts
    const getCount = (themeName: BackgroundTheme, d: ParticleDensity) => {
      switch (themeName) {
        case 'petals':
          return d === 'low' ? 40 : d === 'medium' ? 95 : 180;
        case 'sparks':
          return d === 'low' ? 30 : d === 'medium' ? 80 : 160;
        case 'stars':
          return d === 'low' ? 60 : d === 'medium' ? 150 : 300;
        case 'matrix':
          return d === 'low' ? 15 : d === 'medium' ? 40 : 80;
        default:
          return 0;
      }
    };

    // Color pools for beautiful layers of red
    const petalColors = [
      'rgba(255, 0, 51, 0.85)',   // Neon Red / Brand Neon
      'rgba(230, 0, 46, 0.75)',   // Crimson Red
      'rgba(204, 0, 41, 0.65)',   // Darker Scarlet
      'rgba(139, 0, 0, 0.75)',    // Deep Dark Crimson
      'rgba(255, 77, 109, 0.85)'   // Soft Red-Pink Petal
    ];

    const sparkColors = [
      '#ff0033', // Neon Red
      '#ff3366', // Glow Pinkish Red
      '#ff5500', // Neon Orange-Red
      '#cc002c'  // Medium Crimson
    ];

    const starColors = [
      '#ffffff', // Bright white highlight
      '#ffcccc', // Light ruby twinkle
      '#ff6680', // Soft pastel red glow
      '#ff3355'  // Glowing ruby red
    ];

    const matrixChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&'.split('');

    // Initialize Particles
    const initParticles = () => {
      const active = currentTheme.current;
      const count = getCount(active, currentDensity.current);

      petals = [];
      sparks = [];
      stars = [];
      shootingStars = [];
      matrixDrops = [];

      if (active === 'petals') {
        for (let i = 0; i < count; i++) {
          petals.push({
            x: Math.random() * width,
            y: Math.random() * height - height,
            size: Math.random() * 12 + 6,
            speedX: Math.random() * 1.5 - 0.75,
            speedY: Math.random() * 1.5 + 0.8,
            rotationX: Math.random() * Math.PI,
            rotationY: Math.random() * Math.PI,
            rotationZ: Math.random() * Math.PI,
            rotationSpeedX: Math.random() * 0.02 - 0.01,
            rotationSpeedY: Math.random() * 0.02 - 0.01,
            rotationSpeedZ: Math.random() * 0.015 - 0.0075,
            swingRange: Math.random() * 30 + 15,
            swingSpeed: Math.random() * 0.02 + 0.005,
            swingTime: Math.random() * 100,
            opacity: Math.random() * 0.4 + 0.5,
            color: petalColors[Math.floor(Math.random() * petalColors.length)],
            isWholeFlower: Math.random() < 0.35 // 35% chance for a whole 5-petalled flower
          });
        }
      } else if (active === 'sparks') {
        for (let i = 0; i < count; i++) {
          sparks.push(createSpark(true));
        }
      } else if (active === 'stars') {
        for (let i = 0; i < count; i++) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            baseOpacity: Math.random() * 0.6 + 0.2,
            opacity: 0,
            twinkleSpeed: Math.random() * 0.03 + 0.008,
            twinkleTime: Math.random() * 100,
            color: starColors[Math.floor(Math.random() * starColors.length)]
          });
        }
      } else if (active === 'matrix') {
        const columns = Math.floor(width / 20);
        const actualCount = Math.min(count, columns);
        for (let i = 0; i < actualCount; i++) {
          const fontSize = Math.floor(Math.random() * 8) + 10;
          const colX = Math.random() * width;
          matrixDrops.push({
            x: colX,
            y: Math.random() * height - height,
            speed: Math.random() * 3 + 2,
            chars: Array.from({ length: Math.floor(Math.random() * 15) + 8 }, () => 
              matrixChars[Math.floor(Math.random() * matrixChars.length)]
            ),
            length: Math.floor(Math.random() * 15) + 8,
            fontSize,
            opacity: Math.random() * 0.4 + 0.4
          });
        }
      }
    };

    const createSpark = (randomY = false): Spark => {
      const life = Math.random() * 200 + 100;
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + Math.random() * 50,
        size: Math.random() * 4 + 1.5,
        speedX: Math.random() * 1.0 - 0.5,
        speedY: -(Math.random() * 1.2 + 0.5),
        maxLife: life,
        life,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        glowColor: '#ff0033',
        amplitude: Math.random() * 0.6 + 0.2,
        frequency: Math.random() * 0.03 + 0.01,
        time: Math.random() * 100
      };
    };

    // Draw functions for each particle style
    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      
      // True 3D projection-like scale trick
      const scaleX = Math.cos(p.rotationX);
      const scaleY = Math.sin(p.rotationY);
      ctx.scale(scaleX, scaleY);
      ctx.rotate(p.rotationZ);

      ctx.globalAlpha = p.opacity * currentOpacity.current;

      if (p.isWholeFlower) {
        // Draw whole 5-petalled blossom in red
        ctx.fillStyle = p.color;
        const petalsCount = 5;
        const petalSize = p.size * 0.8;
        for (let i = 0; i < petalsCount; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI * 2) / petalsCount);
          
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(petalSize * 0.45, -petalSize * 0.45, petalSize * 0.25, -petalSize * 0.7);
          ctx.quadraticCurveTo(0, -petalSize * 0.95, -petalSize * 0.25, -petalSize * 0.7);
          ctx.quadraticCurveTo(-petalSize * 0.45, -petalSize * 0.45, 0, 0);
          ctx.closePath();
          ctx.fill();
          
          ctx.restore();
        }
        
        // Add a beautiful glowing center core
        ctx.beginPath();
        ctx.arc(0, 0, petalSize * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6680'; // soft pink-red glow core
        ctx.fill();
      } else {
        // Render single custom sakura/lily leaf outline
        ctx.beginPath();
        ctx.moveTo(0, -p.size / 2);
        ctx.quadraticCurveTo(p.size * 0.6, -p.size * 0.6, p.size * 0.35, 0);
        ctx.quadraticCurveTo(p.size * 0.6, p.size * 0.6, 0, p.size * 0.6);
        ctx.quadraticCurveTo(-p.size * 0.6, p.size * 0.6, -p.size * 0.35, 0);
        ctx.quadraticCurveTo(-p.size * 0.6, -p.size * 0.6, 0, -p.size / 2);
        ctx.closePath();

        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.restore();
    };

    const drawSpark = (s: Spark) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      
      // Render beautiful glow shadow effect
      const currentAlpha = (s.life / s.maxLife) * currentOpacity.current * 0.9;
      ctx.globalAlpha = Math.max(0, currentAlpha);
      
      ctx.shadowBlur = s.size * 2.8;
      ctx.shadowColor = s.glowColor;
      ctx.fill();
      ctx.restore();
    };

    const drawStar = (star: Star) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = star.opacity * currentOpacity.current;
      ctx.fill();
      ctx.restore();
    };

    const drawShootingStar = (star: ShootingStar) => {
      ctx.save();
      ctx.beginPath();
      // Draw tail trail
      const grad = ctx.createLinearGradient(
        star.x,
        star.y,
        star.x - star.dx * star.length,
        star.y - star.dy * star.length
      );
      grad.addColorStop(0, star.color);
      grad.addColorStop(1, 'rgba(255, 0, 51, 0)');
      
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(star.x - star.dx * star.length, star.y - star.dy * star.length);
      ctx.stroke();
      ctx.restore();
    };

    const drawMatrix = (drop: MatrixDrop) => {
      ctx.save();
      ctx.font = `bold ${drop.fontSize}px 'Space Grotesk', monospace`;
      
      // Draw tail characters fading out
      for (let i = 0; i < drop.chars.length; i++) {
        const charY = drop.y - i * drop.fontSize;
        if (charY < -20 || charY > height + 20) continue;

        // The top character is the brightest/white, the rest fade into pure red
        const isLead = i === 0;
        ctx.fillStyle = isLead ? '#ffffff' : '#ff0033';
        
        const textAlpha = (1 - i / drop.chars.length) * drop.opacity * currentOpacity.current * 0.8;
        ctx.globalAlpha = Math.max(0, textAlpha);

        ctx.fillText(drop.chars[i], drop.x, charY);
      }
      ctx.restore();
    };

    // Update Particles
    const updateParticles = () => {
      const active = currentTheme.current;

      // Handle real-time density resets (if count size doesn't match density preset, re-init)
      const expectedCount = getCount(active, currentDensity.current);
      const currentListCount = 
        active === 'petals' ? petals.length :
        active === 'sparks' ? sparks.length :
        active === 'stars' ? stars.length :
        active === 'matrix' ? matrixDrops.length : 0;

      if (currentListCount !== expectedCount) {
        initParticles();
      }

      // 1. Decaying scroll kinetic force
      if (Math.abs(scrollOffset.current) > 0.05) {
        scrollOffset.current *= 0.92;
      } else {
        scrollOffset.current = 0;
      }

      // 2. Mouse wind calculations
      let targetWindX = 0;
      if (mousePos.current.x !== -1000) {
        // Create wind away from mouse horizontally
        const percentX = (mousePos.current.x / width) - 0.5; // -0.5 to 0.5
        targetWindX = percentX * 2.0;
      }

      if (active === 'petals') {
        petals.forEach((p) => {
          p.swingTime += p.swingSpeed;
          
          // Motion math
          const scrollPush = scrollOffset.current * 0.15;
          p.y += p.speedY + scrollPush;
          p.x += p.speedX + Math.sin(p.swingTime) * (p.swingRange * 0.02) + targetWindX * 0.8;

          // Spins
          p.rotationX += p.rotationSpeedX;
          p.rotationY += p.rotationSpeedY;
          p.rotationZ += p.rotationSpeedZ;

          // Recycle
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
            p.speedY = Math.random() * 1.5 + 0.8;
            p.isWholeFlower = Math.random() < 0.35;
          }
          if (p.x > width + 20) p.x = -20;
          if (p.x < -20) p.x = width + 20;

          drawPetal(p);
        });
      } else if (active === 'sparks') {
        sparks.forEach((s, idx) => {
          s.time += s.frequency;
          s.life -= 1;

          // Wave motion
          const oscX = Math.sin(s.time) * s.amplitude;
          const scrollPush = scrollOffset.current * -0.25; // scroll speed helps embers rise faster
          
          s.y += s.speedY + scrollPush;
          s.x += s.speedX + oscX;

          // Mouse Repulsion Field (Action Shonen sparks avoid mouse)
          if (mousePos.current.x !== -1000) {
            const dx = s.x - mousePos.current.x;
            const dy = s.y - mousePos.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const repelRadius = 150;

            if (dist < repelRadius) {
              const force = (repelRadius - dist) / repelRadius;
              const angle = Math.atan2(dy, dx);
              const pushX = Math.cos(angle) * force * 3.5;
              const pushY = Math.sin(angle) * force * 3.5;
              
              s.x += pushX;
              s.y += pushY;
            }
          }

          // Recycle or Draw
          if (s.life <= 0 || s.y < -10 || s.x < -10 || s.x > width + 10) {
            sparks[idx] = createSpark(false);
          } else {
            drawSpark(s);
          }
        });
      } else if (active === 'stars') {
        // Twinkling stars
        stars.forEach((star) => {
          star.twinkleTime += star.twinkleSpeed;
          const scale = Math.sin(star.twinkleTime) * 0.5 + 0.5; // 0 to 1
          star.opacity = star.baseOpacity * (0.3 + scale * 0.7);

          drawStar(star);
        });

        // Chance to launch shooting star
        if (Math.random() < 0.003 && shootingStars.length < 3) {
          const startX = Math.random() * (width * 0.6);
          const startY = Math.random() * (height * 0.4);
          const angle = Math.random() * (Math.PI / 6) + Math.PI / 8; // gentle downward angle
          const speed = Math.random() * 12 + 8;
          const maxLife = Math.random() * 30 + 20;

          shootingStars.push({
            x: startX,
            y: startY,
            dx: Math.cos(angle),
            dy: Math.sin(angle),
            length: Math.random() * 80 + 60,
            speed,
            life: maxLife,
            maxLife,
            color: '#ff3366'
          });
        }

        // Update shooting stars
        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const ss = shootingStars[i];
          ss.life--;
          
          const push = scrollOffset.current * 0.15;
          ss.x += ss.dx * ss.speed;
          ss.y += ss.dy * ss.speed + push;

          if (ss.life <= 0 || ss.x > width + 100 || ss.y > height + 100) {
            shootingStars.splice(i, 1);
          } else {
            drawShootingStar(ss);
          }
        }
      } else if (active === 'matrix') {
        matrixDrops.forEach((drop) => {
          const scrollPush = scrollOffset.current * 0.25;
          drop.y += drop.speed + scrollPush;

          // Mutate drop characters randomly to create that scanning effect
          if (Math.random() < 0.05) {
            const mutateIdx = Math.floor(Math.random() * drop.chars.length);
            drop.chars[mutateIdx] = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          }

          // Recycle
          const tailY = drop.y - drop.chars.length * drop.fontSize;

          if (tailY > height) {
            drop.y = -20;
            drop.x = Math.random() * width;
            drop.speed = Math.random() * 3 + 2;
            drop.opacity = Math.random() * 0.4 + 0.4;
          }

          drawMatrix(drop);
        });
      }
    };

    // Master Animation Loop
    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Render only if a valid theme is active and opacity is non-zero
      if (currentTheme.current !== 'none' && currentOpacity.current > 0.01) {
        updateParticles();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    // Bootstrap
    initParticles();
    loop();

    // Cleanups
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-10"
      style={{
        mixBlendMode: 'screen', // allows glowing colors to overlay beautifully on dark elements
      }}
    />
  );
}

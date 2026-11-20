import React, { useEffect, useRef } from 'react';

export default function MagicParticles({ type = 'magic' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Color palettes per particle type - Pure Primary Colors & Spectrum Accents
    let colors = [
      'rgba(255, 0, 0, ',    // Pure Red sparkle
      'rgba(0, 68, 255, ',   // Pure Blue sparkle
      'rgba(255, 255, 0, ',  // Pure Yellow sparkle
      'rgba(0, 221, 0, ',    // Pure Green sparkle
      'rgba(255, 119, 0, ',  // Pure Orange
      'rgba(0, 255, 255, ',  // Pure Cyan
      'rgba(255, 255, 255, ', // Starlight sparkle
    ];

    if (type === 'primary') {
      colors = [
        'rgba(255, 0, 0, ',    // Pure Red
        'rgba(0, 68, 255, ',   // Pure Blue
        'rgba(255, 255, 0, ',  // Pure Yellow
        'rgba(0, 221, 0, ',    // Pure Green
        'rgba(255, 255, 255, ', // Pure Starlight
      ];
    } else if (type === 'fireflies') {
      colors = [
        'rgba(0, 221, 0, ',    // Pure Green
        'rgba(255, 255, 0, ',  // Pure Yellow
        'rgba(153, 255, 0, ',  // Lime
        'rgba(0, 68, 255, ',   // Pure Blue
      ];
    } else if (type === 'aurora') {
      colors = [
        'rgba(0, 255, 255, ',  // Cyan
        'rgba(0, 68, 255, ',   // Pure Blue
        'rgba(255, 0, 127, ',  // Pink
        'rgba(153, 0, 255, ',  // Purple
        'rgba(255, 255, 255, ', // Starlight
      ];
    } else if (type === 'embers') {
      colors = [
        'rgba(255, 0, 0, ',    // Pure Red
        'rgba(255, 119, 0, ',  // Pure Orange
        'rgba(255, 255, 0, ',  // Pure Yellow
        'rgba(255, 255, 255, ', // Starlight
      ];
    }

    const particleCount = Math.min(45, Math.floor((width * height) / 16000));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      baseRadius: Math.random() * 2 + 1,
      speedY: -Math.random() * 0.45 - 0.2, // slowly floating upwards
      speedX: Math.random() * 0.4 - 0.2,
      angle: Math.random() * Math.PI * 2,
      colorPrefix: colors[Math.floor(Math.random() * colors.length)],
      pulseSpeed: Math.random() * 0.03 + 0.015,
      pulse: Math.random() * Math.PI,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulse += p.pulseSpeed;
        const currentAlpha = 0.25 + 0.5 * (Math.sin(p.pulse) * 0.5 + 0.5);
        p.radius = p.baseRadius * (0.8 + 0.3 * Math.sin(p.pulse));

        p.angle += 0.015;
        p.y += p.speedY;
        p.x += Math.sin(p.angle) * 0.5 + p.speedX;

        // Wrap around top/bottom/sides
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        } else if (p.y > height + 10) {
          p.y = -10;
        }

        if (p.x > width + 10) {
          p.x = -10;
        } else if (p.x < -10) {
          p.x = width + 10;
        }

        // Draw soft glowing orb
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2, false);
        ctx.fillStyle = `${p.colorPrefix}${currentAlpha * 0.25})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = `${p.colorPrefix}${currentAlpha})`;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}

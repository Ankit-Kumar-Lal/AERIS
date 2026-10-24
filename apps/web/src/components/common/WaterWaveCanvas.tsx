import React, { useEffect, useRef } from 'react';

interface WaterWaveCanvasProps {
  className?: string;
  showPulseLine?: boolean;
}

export const WaterWaveCanvas: React.FC<WaterWaveCanvasProps> = ({
  className = '',
  showPulseLine = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 400;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      if (!prefersReducedMotion) {
        step += 0.02;
      }

      // Draw Wave 1 (Deep Forest / Emerald tint)
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 10) {
        const y = Math.sin(x * 0.008 + step) * 18 + Math.cos(x * 0.004 + step * 0.5) * 12 + height * 0.72;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = 'rgba(16, 47, 21, 0.45)';
      ctx.fill();

      // Draw Wave 2 (Emerald Accent)
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 10) {
        const y = Math.sin(x * 0.012 - step * 1.2) * 14 + Math.sin(x * 0.006 + step * 0.8) * 10 + height * 0.78;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = 'rgba(51, 153, 102, 0.35)';
      ctx.fill();

      // Draw Wave 3 (Mint Ripple)
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 10) {
        const y = Math.cos(x * 0.01 + step * 0.7) * 10 + height * 0.85;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = 'rgba(102, 204, 153, 0.25)';
      ctx.fill();

      // Draw Water Droplets rising gently
      const dropletCount = 5;
      for (let i = 0; i < dropletCount; i++) {
        const dropX = (width * 0.2) + (i * width * 0.15);
        const dropY = (height * 0.65) - ((step * 35 + i * 40) % (height * 0.5));
        const alpha = Math.max(0, 1 - ((height * 0.65 - dropY) / (height * 0.5)));

        ctx.beginPath();
        ctx.arc(dropX, dropY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(211, 254, 234, ${alpha * 0.7})`;
        ctx.fill();
      }

      // Draw Pulse Line (Health surveillance heartbeat ECG)
      if (showPulseLine) {
        ctx.beginPath();
        const pulseY = height * 0.48;
        ctx.moveTo(0, pulseY);

        for (let x = 0; x <= width; x += 6) {
          const relativeX = (x + step * 60) % width;
          let offsetY = 0;
          // Spike when relativeX is near center pulse window
          const pulseCenter = width * 0.5;
          const dist = Math.abs(relativeX - pulseCenter);
          if (dist < 40) {
            offsetY = Math.sin((relativeX - pulseCenter) * 0.15) * 35;
          }
          ctx.lineTo(x, pulseY + offsetY);
        }
        ctx.strokeStyle = 'rgba(102, 204, 153, 0.55)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [showPulseLine]);

  return <canvas ref={canvasRef} className={`w-full h-full pointer-events-none ${className}`} />;
};

'use client';

import React, { useRef, useEffect } from 'react';
import { useMotionValue, useVelocity, useTransform, useAnimationFrame } from 'framer-motion';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
    life: number;
}

interface HoliParticlesProps {
    rotationValue: any; // MotionValue<number>
}

export default function HoliParticles({ rotationValue }: HoliParticlesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const lastRotation = useRef(0);

    const rotationVelocity = useVelocity(rotationValue);

    // Map rotation velocity to particle intensity
    // Normalize velocity (which can be quite high)
    const intensity = useTransform(rotationVelocity, [-2000, 2000], [0, 1]);

    const colors = ['#FF6B35', '#F21B6A', '#FFD100', '#ffffff'];

    const createParticle = (x: number, y: number, velX: number, velY: number): Particle => {
        return {
            x,
            y,
            vx: velX + (Math.random() - 0.5) * 5,
            vy: velY + (Math.random() - 0.5) * 5,
            size: Math.random() * 8 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            life: 1,
        };
    };

    useAnimationFrame((time, delta) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Reset canvas dimensions if needed
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        // Spawn particles based on velocity
        const vel = Math.abs(rotationVelocity.get());
        if (vel > 50) {
            const count = Math.min(Math.floor(vel / 200), 5);
            for (let i = 0; i < count; i++) {
                // Spawn around the center where the mandala is
                const angle = Math.random() * Math.PI * 2;
                const radius = 100 + Math.random() * 50;
                const spawnX = canvas.width / 2 + Math.cos(angle) * radius;
                const spawnY = canvas.height / 2 + Math.sin(angle) * radius;

                // Direction of velocity depends on rotation sign
                const rotDir = rotationVelocity.get() > 0 ? 1 : -1;
                const spreadX = -Math.sin(angle) * rotDir * (vel / 100);
                const spreadY = Math.cos(angle) * rotDir * (vel / 100);

                particles.current.push(createParticle(spawnX, spawnY, spreadX, spreadY));
            }
        }

        // Clear with slight trail
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles.current = particles.current.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.life -= 0.015;
            p.alpha = Math.max(0, p.life);

            if (p.life <= 0) return false;

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;

            // Draw a "powder" shape (diamond or irregular)
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Secondary glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.fill();

            ctx.restore();
            return true;
        });

        // Limit particle count for performance
        if (particles.current.length > 200) {
            particles.current = particles.current.slice(-200);
        }
    });

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[35]"
            style={{ filter: 'blur(1px)' }}
        />
    );
}

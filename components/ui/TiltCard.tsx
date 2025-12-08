"use client";

import { useRef, useState, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
    children: ReactNode;
    className?: string;
    tiltAmount?: number;
    glareEnabled?: boolean;
    glareColor?: string;
    perspective?: number;
    scale?: number;
}

/**
 * TiltCard - A card component with 3D tilt effect on hover
 * Creates a premium parallax-like interaction
 */
export function TiltCard({
    children,
    className,
    tiltAmount = 10,
    glareEnabled = true,
    glareColor = "rgba(255, 255, 255, 0.2)",
    perspective = 1000,
    scale = 1.02,
}: TiltCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [tiltStyle, setTiltStyle] = useState({
        transform: "",
        transition: "transform 0.3s ease-out",
    });
    const [glareStyle, setGlareStyle] = useState({
        opacity: 0,
        background: "",
    });

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Calculate rotation based on mouse position
        const rotateX = (-mouseY / (rect.height / 2)) * tiltAmount;
        const rotateY = (mouseX / (rect.width / 2)) * tiltAmount;

        setTiltStyle({
            transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
            transition: "transform 0.1s ease-out",
        });

        // Calculate glare position
        if (glareEnabled) {
            const glareX = ((e.clientX - rect.left) / rect.width) * 100;
            const glareY = ((e.clientY - rect.top) / rect.height) * 100;

            setGlareStyle({
                opacity: 0.3,
                background: `radial-gradient(circle at ${glareX}% ${glareY}%, ${glareColor} 0%, transparent 60%)`,
            });
        }
    };

    const handleMouseLeave = () => {
        setTiltStyle({
            transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`,
            transition: "transform 0.5s ease-out",
        });
        setGlareStyle({
            opacity: 0,
            background: "",
        });
    };

    return (
        <div
            ref={cardRef}
            className={cn("relative overflow-hidden", className)}
            style={{
                transformStyle: "preserve-3d",
                ...tiltStyle,
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            {/* Glare overlay */}
            {glareEnabled && (
                <div
                    className="absolute inset-0 pointer-events-none rounded-[inherit] z-10"
                    style={{
                        ...glareStyle,
                        transition: "opacity 0.3s ease-out",
                    }}
                />
            )}
        </div>
    );
}

interface TiltCardContentProps {
    children: ReactNode;
    className?: string;
    depth?: number;
}

/**
 * TiltCardContent - Content that "pops out" from the card
 */
export function TiltCardContent({
    children,
    className,
    depth = 30,
}: TiltCardContentProps) {
    return (
        <div
            className={cn("relative", className)}
            style={{
                transform: `translateZ(${depth}px)`,
                transformStyle: "preserve-3d",
            }}
        >
            {children}
        </div>
    );
}

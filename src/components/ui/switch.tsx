'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
    disabled?: boolean;
}

export function Switch({ checked, onCheckedChange, className, disabled = false }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "relative rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
                checked ? "bg-[#F21B6A]" : "bg-slate-200",
                "w-11 h-6",
                className
            )}
        >
            <motion.div
                initial={false}
                animate={{ x: checked ? 20 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                    "w-5 h-5 rounded-full shadow-sm bg-white mt-0.5",
                    "pointer-events-none block"
                )}
            />
        </button>
    );
}

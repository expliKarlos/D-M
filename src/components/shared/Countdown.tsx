'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
    targetDate: string; // ISO string or parsable date string
    labels: {
        days: string;
        hours: string;
        minutes: string;
    };
    colorClass: 'red' | 'orange';
}

export default function Countdown({ targetDate, labels, colorClass }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            let timeLeft = {
                days: 0,
                hours: 0,
                minutes: 0,
            };

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                };
            }

            return timeLeft;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // Update every minute is enough

        return () => clearInterval(timer);
    }, [targetDate]);

    const textColorClass = colorClass === 'red' ? 'text-slate-800' : 'text-slate-800';
    const subTextColorClass = 'text-[9px] text-slate-500 uppercase font-bold';
    const dividerColorClass = colorClass === 'red' ? 'bg-red-200' : 'bg-orange-200';

    return (
        <div className="flex justify-between items-center px-2">
            <div className="text-center">
                <span className={`block text-2xl font-bold ${textColorClass}`}>
                    {timeLeft.days}
                </span>
                <span className={subTextColorClass}>
                    {labels.days}
                </span>
            </div>
            <div className={`h-8 w-[1px] ${dividerColorClass}`}></div>
            <div className="text-center">
                <span className={`block text-2xl font-bold ${textColorClass}`}>
                    {timeLeft.hours}
                </span>
                <span className={subTextColorClass}>
                    {labels.hours}
                </span>
            </div>
            <div className={`h-8 w-[1px] ${dividerColorClass}`}></div>
            <div className="text-center">
                <span className={`block text-2xl font-bold ${textColorClass}`}>
                    {timeLeft.minutes}
                </span>
                <span className={subTextColorClass}>
                    {labels.minutes}
                </span>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const languages = [
    { code: "EN", label: "EN" },
    { code: "ES", label: "ES" },
    { code: "HI", label: "HI" },
];

export function LanguageSelector() {
    const [currentLang, setCurrentLang] = useState("ES");

    return (
        <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm p-1 rounded-full border border-gray-200">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200",
                        currentLang === lang.code
                            ? "bg-primary text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    )}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
}

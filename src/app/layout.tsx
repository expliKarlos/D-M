import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Fredoka, Outfit } from "next/font/google";
import "./globals.css";
import PWAInitializer from "@/components/shared/PWAInitializer";

const plusJakarta = Plus_Jakarta_Sans({
    variable: "--font-plus-jakarta",
    subsets: ["latin"],
});

const fredoka = Fredoka({
    variable: "--font-fredoka",
    subsets: ["latin"],
});

const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
});

export const viewport: Viewport = {
    themeColor: "#ee6c2b",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    title: "Digvijay & María | Boda Real",
    description: "Bienvenidos a la unión de Digvijay & María. Una celebración de amor entre España e India.",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        title: "Digvijay & Maria",
        statusBarStyle: "black-translucent",
    },
    icons: {
        apple: "/icons/icon-192x192.png",
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Tiro+Devanagari+Hindi&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body className={`${plusJakarta.variable} ${fredoka.variable} ${outfit.variable} font-sans antialiased text-[#1a1a1a]`}>
                <PWAInitializer />
                {children}
            </body>
        </html>
    );
}

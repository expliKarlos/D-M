import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
// Build trigger: v2.0.4
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";

const plusJakarta = Plus_Jakarta_Sans({
    variable: "--font-plus-jakarta",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Digvijay & María | Boda Real",
    description: "Bienvenidos a la unión de Digvijay & María. Una celebración de amor entre España e India.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet" />
                {/* Fallback Theme Variables with !important to battle production cache */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    :root, [data-theme='light'] { 
                        --background: #f8f7f6 !important; 
                        --foreground: #0f172a !important; 
                        --primary: #ec9213 !important;
                        --footer-bg: #f8fafc !important; 
                        --footer-border: #f1f5f9 !important;
                        --card-spain: #fef5f5 !important; 
                        --card-india: #fdf2e9 !important;
                    }
                    .dark, [data-theme='dark'] { 
                        --background: #221a10 !important; 
                        --foreground: #ffffff !important;
                        --footer-bg: rgba(0, 0, 0, 0.4) !important; 
                        --footer-border: rgba(255, 255, 255, 0.1) !important;
                        --card-spain: rgba(69, 10, 10, 0.5) !important; 
                        --card-india: rgba(67, 20, 7, 0.5) !important;
                    }
                `}} />
            </head>
            <body className={`${plusJakarta.variable} font-sans antialiased transition-colors`}>
                <ThemeProvider
                    attribute="data-theme"
                    defaultTheme="light"
                    enableSystem={false}
                    storageKey="dm-theme-v4"
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}

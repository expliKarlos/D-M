/**
 * PWA Utility for managing the installation prompt
 * Standard 2026 patterns for PWA onboarding
 */

let deferredPrompt: any = null;

export const initPWAInstallListener = () => {
    if (typeof window === "undefined") return;

    window.addEventListener("beforeinstallprompt", (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;

        // Dispatch local event to notify components
        window.dispatchEvent(new CustomEvent("pwa-installable", { detail: true }));
    });

    window.addEventListener("appinstalled", () => {
        // Clear the deferredPrompt so it can be garbage collected
        deferredPrompt = null;
        console.log("PWA was installed");
        window.dispatchEvent(new CustomEvent("pwa-installable", { detail: false }));
        window.dispatchEvent(new CustomEvent("pwa-installed"));
    });
};

export const presentInstallPrompt = async () => {
    if (!deferredPrompt) {
        console.warn("Install prompt not available");
        return false;
    }

    // Show the prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent("pwa-installable", { detail: false }));

    return outcome === "accepted";
};

export const isPWAInstalled = () => {
    if (typeof window === "undefined") return false;

    // Check matchMedia for standalone display mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // Check for iOS safari standalone
    const isIOSStandalone = (window.navigator as any).standalone === true;

    return isStandalone || isIOSStandalone;
};

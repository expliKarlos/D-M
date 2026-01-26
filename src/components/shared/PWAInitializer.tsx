"use client";

import { useEffect } from "react";
import { initPWAInstallListener } from "@/lib/utils/pwa";

export default function PWAInitializer() {
    useEffect(() => {
        initPWAInstallListener();

        // SERVICE WORKER REGISTRATION (Basic)
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").then(
                (registration) => {
                    console.log("ServiceWorker registration successful with scope: ", registration.scope);
                },
                (err) => {
                    console.log("ServiceWorker registration failed: ", err);
                }
            );
        }
    }, []);

    return null;
}

import LanguageSelector from "@/components/shared/LanguageSelector";
import { LoginHeader } from "@/components/auth/LoginHeader";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Heart } from "lucide-react";

export default function LoginPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
            {/* Top Bar with Language Selector */}
            <div className="fixed top-6 right-6 z-10">
                <LanguageSelector />
            </div>

            <div className="w-full max-w-md space-y-8">
                {/* Visual Header */}
                <LoginHeader />

                {/* Welcome Text */}
                <div className="text-center space-y-3">
                    <div className="flex justify-center mb-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <Heart className="w-6 h-6 text-primary" fill="currentColor" fillOpacity={0.2} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Bienvenidos a la unión de{" "}
                        <span className="text-primary block mt-1">Digvijay & María</span>
                    </h1>
                    <p className="text-lg text-gray-600 font-medium">
                        Por favor, identifícate para descubrir todos los detalles de nuestro enlace.
                    </p>
                </div>

                {/* Auth Action */}
                <div className="pt-4">
                    <GoogleAuthButton />
                </div>

                {/* Footer info */}
                <p className="text-center text-sm text-gray-400 mt-8">
                    España &bull; 12 de Junio &nbsp;|&nbsp; India &bull; 20 de Septiembre
                </p>
            </div>

            {/* Decorative elements */}
            <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
        </main>
    );
}

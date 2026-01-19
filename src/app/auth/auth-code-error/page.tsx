import Link from 'next/link';

export default function AuthCodeErrorPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f6f6] p-6 text-center">
            <h1 className="text-3xl font-bold text-primary mb-4">¡Ups! Algo salió mal</h1>
            <p className="text-gray-600 mb-8 max-w-md">
                Hubo un error al intentar verificar tu cuenta de Google. Esto puede deberse a que el enlace ha expirado o hubo un problema de conexión.
            </p>
            <Link
                href="/es/login"
                className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-opacity-90 transition-all"
            >
                Volver a intentarlo
            </Link>
        </div>
    );
}

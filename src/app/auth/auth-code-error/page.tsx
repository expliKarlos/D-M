'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f6f6] p-6 text-center">
            <h1 className="text-3xl font-bold text-primary mb-4">¡Ups! Algo salió mal</h1>
            <p className="text-gray-600 mb-2 max-w-md">
                Hubo un error al intentar verificar tu cuenta de Google.
            </p>
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 font-mono text-sm max-w-lg break-words">
                    Error Details: {error}
                </div>
            )}
            <Link
                href="/es/login"
                className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-opacity-90 transition-all"
            >
                Volver a intentarlo
            </Link>
        </div>
    );
}

export default function AuthCodeErrorPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ErrorContent />
        </Suspense>
    );
}

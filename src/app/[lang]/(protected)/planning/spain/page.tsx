import { Suspense } from 'react';
import InfoSpain from '../InfoSpain';

export default function SpainPage() {
    return (
        <div className="min-h-screen bg-[#fafafa] pt-24 pb-40 px-6">
            <Suspense fallback={<div className="animate-pulse h-96 bg-slate-100 rounded-3xl" />}>
                <InfoSpain />
            </Suspense>
        </div>
    );
}

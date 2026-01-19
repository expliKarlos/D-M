import Image from "next/image";

export function LoginHeader() {
    return (
        <div className="relative w-full h-[220px] md:h-[280px] overflow-hidden rounded-3xl shadow-xl transition-transform duration-500 hover:scale-[1.01]">
            <Image
                src="/images/header-fusion.png"
                alt="Digvijay & María Wedding"
                fill
                className="object-cover z-0"
                priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 flex items-end p-6">
                <h2 className="text-white text-2xl md:text-3xl font-bold drop-shadow-lg">
                    Digvijay & María
                </h2>
            </div>
        </div>
    );
}

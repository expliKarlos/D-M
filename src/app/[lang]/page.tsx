import Image from "next/image";

export default function Dashboard() {
  return (
    <>
      {/* Header */}
      <nav className="sticky top-0 z-50 glass-header px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden shadow-md relative">
            <Image
              alt="D&M Logo"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpZsXn3DjS1ll4JPwOQSqzigSzc8qosFEszXX4MywVBe8RqlOGrf8CfIXhykXj7YZ_FLPbLvE--JcaDNsdj-n3OLWvoRofDTD1U9kBszlwhs6224LiYO0tmJ9zEMC-3pnt4bJuHEYGaWxxqOWmPChnOreRWsiTMNEFAiYpHHvTJIVIq19P7L9zzfa59EZsRoXOqTAfsVteJ2p6ngR3w39l1BCU46SQ2-cXw9OX2OBvrK3K8Ti1szMB0QRjp5ieUbBPr2TjApW0f_1m"
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight">D&M</h1>
        </div>
        <div className="flex bg-white/50 dark:bg-white/10 p-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
          <button className="px-3 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-primary transition-colors">
            EN
          </button>
          <button className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white">
            ES
          </button>
          <button className="px-3 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-primary transition-colors">
            HI
          </button>
        </div>
      </nav>

      <main className="pb-40">
        {/* Hero Section */}
        <section className="px-6 mt-4">
          <div className="relative h-56 rounded-xl overflow-hidden shadow-2xl">
            <Image
              alt="Fusión de arcos españoles y arquitectura de palacio indio"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuARCHomBwCIICWzlbS9I3SN-qwOom5B9HgY6pRzyDEVjMGW8o7BsEEKaFLZXyJ9SnjSscjTUtoYjuiBQv5djCZHvYiKVkLSiTaiSmE71c1vDDsQXEo31WRb6G9tf77Y8LTbQMwougFVulR5JgclewOixnpxDdIAst-h14TCGq5ZzwKOcMHteCry_jTqm3k2SsJ6Af2mn7Efd6bRtBxcwxqzPAKhqLu-5eFe03fqYCqpiGw3hatN5BeMsVdFkzRaYs7gL6q5vBoj4wXG"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">
                Digvijay & María
              </h2>
            </div>
          </div>
        </section>

        {/* Countdowns */}
        <section className="px-6 mt-8">
          <div className="grid grid-cols-1 gap-4">
            {/* Spain Card */}
            <div className="bg-card-spain dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-red-500 text-lg">
                  location_on
                </span>
                <h4 className="text-[11px] font-bold text-slate-700 dark:text-red-200 uppercase tracking-wider">
                  España - 12 de Junio
                </h4>
              </div>
              <div className="flex justify-between items-center px-2">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-slate-800 dark:text-white">
                    124
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                    Días
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-red-200 dark:bg-red-800/50"></div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-slate-800 dark:text-white">
                    14
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                    Horas
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-red-200 dark:bg-red-800/50"></div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-slate-800 dark:text-white">
                    45
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                    Minutos
                  </span>
                </div>
              </div>
            </div>

            {/* India Card */}
            <div className="bg-card-india dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-lg">
                  location_on
                </span>
                <h4 className="text-[11px] font-bold text-slate-700 dark:text-orange-200 uppercase tracking-wider">
                  India - 20 de Septiembre
                </h4>
              </div>
              <div className="flex justify-between items-center px-2">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-slate-800 dark:text-white">
                    224
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                    Días
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-orange-200 dark:bg-orange-800/50"></div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-slate-800 dark:text-white">
                    08
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                    Horas
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-orange-200 dark:bg-orange-800/50"></div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-slate-800 dark:text-white">
                    12
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold">
                    Minutos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Events Carousel */}
        <section className="mt-10">
          <div className="px-6 flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Próximos Eventos</h3>
            <button className="text-primary text-sm font-semibold">
              Ver Todo
            </button>
          </div>
          <div className="flex overflow-x-auto gap-4 px-6 hide-scrollbar pb-2">
            {/* Event 1 */}
            <div className="flex-none w-72 bg-card-spain dark:bg-red-950/20 p-5 rounded-lg border border-red-100 dark:border-red-900/30">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                  España
                </span>
                <span className="text-slate-400 text-xs">15 Ago</span>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-1">
                Noche de Sangeet & Tapas
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
                <span className="material-icons-outlined text-sm">place</span>{" "}
                Madrid, España
              </p>
              <div className="flex -space-x-2">
                <div className="relative w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden">
                  <Image
                    alt="Guest 1"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDThHxl565Vdnzu2t7bmTq27nnqt_NEV8Quq1tmTU5K_QgQgkDODE8ApzZxZ-86wvY6WE2ZveeSgHW2xgLSuKnQV_rUkJSbDPtVYbKXNjFv_d7zgTBkNdPLm8hc5-7Czinwj91RRe_Ck6FpsZKG3X8dwoAHvQY9oSOtaxtj5AVb1Qs7UgoV8KIJdkvn_nr12FSdH4MPdmI4aZGtuL16l_GqWrxZzqJE9lKIU7CA_97d2MtUM49SmwNCYRdB4RdblcSa1qbFh0mQEAbZ"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden">
                  <Image
                    alt="Guest 2"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAj_w9FGIn4VH3jOh74uSqV59Pj9kqXoci8qEAIsWsF7zq-btl_LywDzWlS7kxEi2TFZYRXgxAXf3Bz3Yw8IzREkGDBWG8tU1dqVpOKH5i_wFITon_XuTlsL2uiNFq76jnWcNpqTFnvy-yIFhnUSTMWtKHSYaK06Kz835OH4zwn8jsIQzEeinhsopd5KeUxcgmk_2WJ6m0PDdNIgarpeq4kk8TpI04a7LCQT7ql9hBdWswYEPwg7B5LgSuO9rI_L_kcTD6EtQjrUxJX"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                  +42
                </div>
              </div>
            </div>

            {/* Event 2 */}
            <div className="flex-none w-72 bg-card-india dark:bg-orange-950/20 p-5 rounded-lg border border-orange-100 dark:border-orange-900/30">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                  India
                </span>
                <span className="text-slate-400 text-xs">02 Dic</span>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-1">
                Los Pheras Reales
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
                <span className="material-icons-outlined text-sm">place</span>{" "}
                Jaipur, India
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
                  Cuenta atrás: 112 Días
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links Grid */}
        <section className="px-6 mt-10 grid grid-cols-1 gap-4">
          <div className="group relative bg-white dark:bg-white/5 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-white/10 flex items-center justify-between transition-all hover:shadow-md cursor-pointer">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-500">
                <span className="material-icons-outlined text-3xl">
                  flight_takeoff
                </span>
              </div>
              <div>
                <h4 className="font-bold text-lg">Info</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Viaje, Visado y Cultura
                </p>
              </div>
            </div>
            <span className="material-icons-outlined text-slate-300">
              chevron_right
            </span>
          </div>

          <div className="group relative bg-white dark:bg-white/5 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-white/10 flex items-center justify-between transition-all hover:shadow-md cursor-pointer">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-500">
                <span className="material-icons-outlined text-3xl">
                  auto_awesome
                </span>
              </div>
              <div>
                <h4 className="font-bold text-lg">El Enlace</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Eventos y Código de Vestimenta
                </p>
              </div>
            </div>
            <span className="material-icons-outlined text-slate-300">
              chevron_right
            </span>
          </div>

          <div className="w-full h-48 rounded-xl overflow-hidden shadow-sm my-2 relative">
            <Image
              alt="Pareja - Digvijay & María"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrx96UFPK5cHXzLSx21-J9DioL15gk7tlXtbEqxMrkpMmPT0g3pdHnwACzxnSzBpwuZR1jhzPcOjkQgh5iRa8fHDUR4mOnF6qCgu3XRdys2MEr93TCN3jF5squM01DpwV4-Rbwsqcj2AxhH6TDYHrwKTB6Vpg3ouzN4x5pNXNLbxYNf2ZgkbJn4WR8AvJg8dhr3SvDbHw-HCHHVK3oMxdiL8BwFiEywqZKyxvc4vjVgPbxexitxDVdDOEvjyTJYdj4mM6g-ErEikbd"
              fill
              className="object-cover"
            />
          </div>

          <div className="group relative bg-white dark:bg-white/5 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-white/10 flex items-center justify-between transition-all hover:shadow-md cursor-pointer">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-500">
                <span className="material-icons-outlined text-3xl">
                  celebration
                </span>
              </div>
              <div>
                <h4 className="font-bold text-lg">Participa</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  RSVP, Regalos y Fotos
                </p>
              </div>
            </div>
            <span className="material-icons-outlined text-slate-300">
              chevron_right
            </span>
          </div>

          <div className="group relative bg-white dark:bg-white/5 p-6 rounded-lg shadow-sm border border-slate-100 dark:border-white/10 flex items-center justify-between transition-all hover:shadow-md cursor-pointer">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500">
                <span className="material-icons-outlined text-3xl">
                  event_note
                </span>
              </div>
              <div>
                <h4 className="font-bold text-lg">Organízate</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Planificación y Reservas
                </p>
              </div>
            </div>
            <span className="material-icons-outlined text-slate-300">
              chevron_right
            </span>
          </div>

          {/* Assistant CTA */}
          <div className="bg-card-spain dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center mt-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg mb-6">
              <span className="material-icons-outlined">psychology</span>
            </div>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              ¿Necesitas ayuda con la logística?
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-[240px]">
              Nuestro asistente IA puede ayudarte con consejos de viaje y etiqueta
              cultural.
            </p>
            <button className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-full shadow-lg active:scale-95 transition-all text-sm">
              Preguntar al Asistente
            </button>
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-[34px] left-1/2 -translate-x-1/2 z-[60]">
        <button className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_8px_25px_rgba(238,108,43,0.4)] active:scale-95 transition-transform border-4 border-white dark:border-background-dark">
          <span
            className="material-symbols-outlined text-3xl"
            style={{
              fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48",
            }}
          >
            auto_awesome
          </span>
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-background-dark/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-4 py-3 pb-8 flex justify-between items-center z-50">
        <div className="flex w-[40%] justify-around">
          <button className="flex flex-col items-center gap-1 text-primary">
            <span className="material-icons-outlined">home</span>
            <span className="text-[10px] font-bold">Inicio</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
            <span className="material-icons-outlined">favorite_border</span>
            <span className="text-[10px] font-medium">Enlace</span>
          </button>
        </div>
        <div className="w-16"></div>
        <div className="flex w-[40%] justify-around">
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
            <span className="material-icons-outlined">celebration</span>
            <span className="text-[10px] font-medium">Participa</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
            <span className="material-icons-outlined">event_note</span>
            <span className="text-[10px] font-medium">Planning</span>
          </button>
        </div>
      </nav>
    </>
  );
}

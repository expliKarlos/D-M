import Image from "next/image";
import { useTranslations } from 'next-intl';
import Countdown from '@/components/shared/Countdown';
// Use Link from next-intl for localized routing if needed, or stick to buttons for now
import { Link } from '@/i18n/navigation'; // We might need to create this or use next/link with locale
import AssistantCTA from '@/components/dashboard/AssistantCTA';

export default function Dashboard() {
  const t = useTranslations('Dashboard');

  return (
    <>
      {/* Header - Simplified as requested */}
      <nav className="sticky top-0 z-50 glass-header px-6 py-4 flex items-center justify-center">
        <h1 className="text-xl font-bold tracking-tight text-primary">D&M</h1>
      </nav>

      <main className="pb-8">
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
                {t('hero.title')}
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
                  {t('spain_card.title')}
                </h4>
              </div>
              <Countdown
                targetDate="2026-06-12T12:00:00"
                labels={{
                  days: t('spain_card.days'),
                  hours: t('spain_card.hours'),
                  minutes: t('spain_card.minutes')
                }}
                colorClass="red"
              />
            </div>

            {/* India Card */}
            <div className="bg-card-india dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-lg">
                  location_on
                </span>
                <h4 className="text-[11px] font-bold text-slate-700 dark:text-orange-200 uppercase tracking-wider">
                  {t('india_card.title')}
                </h4>
              </div>
              <Countdown
                targetDate="2026-09-20T12:00:00"
                labels={{
                  days: t('india_card.days'),
                  hours: t('india_card.hours'),
                  minutes: t('india_card.minutes')
                }}
                colorClass="orange"
              />
            </div>
          </div>
        </section>

        {/* Upcoming Events Carousel */}
        <section className="mt-10">
          <div className="px-6 flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{t('events.title')}</h3>
            <button className="text-primary text-sm font-semibold">
              {t('events.view_all')}
            </button>
          </div>
          <div className="flex overflow-x-auto gap-4 px-6 hide-scrollbar pb-2">
            {/* Event 1 */}
            <div className="flex-none w-72 bg-card-spain dark:bg-red-950/20 p-5 rounded-lg border border-red-100 dark:border-red-900/30">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                  {t('events.sangeet.tag')}
                </span>
                <span className="text-slate-400 text-xs">{t('events.sangeet.date')}</span>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-1">
                {t('events.sangeet.title')}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
                <span className="material-icons-outlined text-sm">place</span>{" "}
                {t('events.sangeet.location')}
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
                  {t('events.pheras.tag')}
                </span>
                <span className="text-slate-400 text-xs">{t('events.pheras.date')}</span>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-1">
                {t('events.pheras.title')}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1">
                <span className="material-icons-outlined text-sm">place</span>{" "}
                {t('events.pheras.location')}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
                  {t('events.pheras.countdown', { days: 112 })}
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
                <h4 className="font-bold text-lg">{t('quick_links.info.title')}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('quick_links.info.subtitle')}
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
                <h4 className="font-bold text-lg">{t('quick_links.wedding.title')}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('quick_links.wedding.subtitle')}
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
                <h4 className="font-bold text-lg">{t('quick_links.participate.title')}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('quick_links.participate.subtitle')}
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
                <h4 className="font-bold text-lg">{t('quick_links.organize.title')}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('quick_links.organize.subtitle')}
                </p>
              </div>
            </div>
            <span className="material-icons-outlined text-slate-300">
              chevron_right
            </span>
          </div>

        </section>

        {/* Assistant CTA */}
        <AssistantCTA />

      </main>

    </>
  );
}

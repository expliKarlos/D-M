import Image from "next/image";
import { useTranslations } from 'next-intl';
import LanguageSelector from '@/components/shared/LanguageSelector';
import Countdown from '@/components/shared/Countdown';
// Use Link from next-intl for localized routing if needed, or stick to buttons for now
import { Link } from '@/i18n/navigation'; // We might need to create this or use next/link with locale
import AssistantCTA from '@/components/dashboard/AssistantCTA';
import ShareSection from '@/components/dashboard/ShareSection';
import PlanningMandala from '@/components/shared/PlanningMandala';
import InstallBanner from '@/components/shared/InstallBanner';
import { TripleTapDetector } from '@/components/admin/TripleTapDetector';

export default function Dashboard() {
  const t = useTranslations('Dashboard');

  return (
    <>
      {/* Header */}
      <nav className="sticky top-0 z-50 glass-header px-6 py-4 flex items-center justify-between">
        <TripleTapDetector>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-md relative">
              <Image
                alt="D&M Logo"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpZsXn3DjS1ll4JPwOQSqzigSzc8qosFEszXX4MywVBe8RqlOGrf8CfIXhyXj7YZ_FLPbLvE--JcaDNsdj-n3OLWvoRofDTD1U9kBszlwhs6224LiYO0tmJ9zEMC-3pnt4bJuHEYGaWxxqOWmPChnOreRWsiTMNEFAiYpHHvTJIVIq19P7L9zzfa59EZsRoXOqTAfsVteJ2p6ngR3w39l1BCU46SQ2-cXw9OX2OBvrK3K8Ti1szMB0QRjp5ieUbBPr2TjApW0f_1m"
                fill
                className="object-cover"
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight">D&M</h1>
          </div>
        </TripleTapDetector>

        {/* Language Selector would go here, maybe as a separate component */}
        {/* For now, just rendering static buttons that should be interactive */}
        <LanguageSelector />
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
                {t('hero.title')}
              </h2>
            </div>
          </div>
        </section>

        {/* Countdowns */}
        <section className="px-6 mt-8">
          <div className="grid grid-cols-1 gap-4">
            {/* Spain Card */}
            <div className="bg-card-spain border border-red-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-red-500 text-lg">
                  location_on
                </span>
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
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
            <div className="bg-card-india border border-orange-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-lg">
                  location_on
                </span>
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
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

        {/* Utilities Section */}
        <section className="px-6 mt-10">
          <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
            <span className="w-2 h-6 bg-primary rounded-full" />
            {t('utils.title')}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Voice/Text Translator */}
            <Link href="/tools/translator">
              <div className="group relative bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 transition-all hover:shadow-md cursor-pointer h-[80px]">
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 shrink-0">
                  <span className="material-icons-outlined text-xl">
                    translate
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-[11px] leading-tight text-slate-800">{t('utils.voice_translator')}</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                    {t('utils.voice_translator_subtitle')}
                  </p>
                </div>
              </div>
            </Link>

            {/* Camera Translator */}
            <Link href="/tools/camera-translator">
              <div className="group relative bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 transition-all hover:shadow-md cursor-pointer h-[80px]">
                <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 shrink-0">
                  <span className="material-icons-outlined text-xl">
                    photo_camera
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-[11px] leading-tight text-slate-800">{t('utils.camera_translator')}</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                    {t('utils.camera_translator_subtitle')}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Quick Links Grid */}
        <section className="px-6 mt-10 grid grid-cols-1 gap-4">
          <Link href="/info-hub">
            <div className="group relative bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                  <span className="material-icons-outlined text-3xl">
                    flight_takeoff
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{t('quick_links.info.title')}</h4>
                  <p className="text-sm text-slate-500">
                    {t('quick_links.info.subtitle')}
                  </p>
                </div>
              </div>
              <span className="material-icons-outlined text-slate-300">
                chevron_right
              </span>
            </div>
          </Link>

          <Link href="/wedding">
            <div className="group relative bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                  <span className="material-icons-outlined text-3xl">
                    auto_awesome
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{t('quick_links.wedding.title')}</h4>
                  <p className="text-sm text-slate-500">
                    {t('quick_links.wedding.subtitle')}
                  </p>
                </div>
              </div>
              <span className="material-icons-outlined text-slate-300">
                chevron_right
              </span>
            </div>
          </Link>

          <div className="w-full h-48 rounded-xl overflow-hidden shadow-sm my-2 relative">
            <Image
              alt="Pareja - Digvijay & María"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrx96UFPK5cHXzLSx21-J9DioL15gk7tlXtbEqxMrkpMmPT0g3pdHnwACzxnSzBpwuZR1jhzPcOjkQgh5iRa8fHDUR4mOnF6qCgu3XRdys2MEr93TCN3jF5squM01DpwV4-Rbwsqcj2AxhH6TDYHrwKTB6Vpg3ouzN4x5pNXNLbxYNf2ZgkbJn4WR8AvJg8dhr3SvDbHw-HCHHVK3oMxdiL8BwFiEywqZKyxvc4vjVgPbxexitxDVdDOEvjyTJYdj4mM6g-ErEikbd"
              fill
              className="object-cover"
            />
          </div>

          <Link href="/participate">
            <div className="group relative bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
                  <span className="material-icons-outlined text-3xl">
                    celebration
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{t('quick_links.participate.title')}</h4>
                  <p className="text-sm text-slate-500">
                    {t('quick_links.participate.subtitle')}
                  </p>
                </div>
              </div>
              <span className="material-icons-outlined text-slate-300">
                chevron_right
              </span>
            </div>
          </Link>

          <Link href="/planning">
            <div className="group relative bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                  <span className="material-icons-outlined text-3xl">
                    event_note
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{t('quick_links.organize.title')}</h4>
                  <p className="text-sm text-slate-500">
                    {t('quick_links.organize.subtitle')}
                  </p>
                </div>
              </div>
              <span className="material-icons-outlined text-slate-300">
                chevron_right
              </span>
            </div>
          </Link>

        </section>

        {/* Assistant CTA */}
        <AssistantCTA />

        {/* Share Section */}
        <ShareSection />

        <InstallBanner />
      </main>

    </>
  );
}

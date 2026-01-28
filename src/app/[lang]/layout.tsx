import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ChatInterface } from '@/components/chat/ChatInterface';
import BottomNav from '@/components/layout/BottomNav';
import { GalleryProvider } from '@/lib/contexts/GalleryContext';
import { TimelineProvider } from '@/lib/contexts/TimelineContext';

import { Toaster } from 'sonner';
import SyncManager from '@/components/sync/SyncManager';

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const params = await props.params;
  const { lang } = params;

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={lang}>
      <GalleryProvider>
        <TimelineProvider>
          <SyncManager />
          {props.children}
          <Toaster richColors position="top-center" />
          <ChatInterface />
          <BottomNav />
        </TimelineProvider>
      </GalleryProvider>
    </NextIntlClientProvider>
  );
}

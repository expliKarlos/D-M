import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ChatInterface } from '@/components/chat/ChatInterface';

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
      {props.children}
      <ChatInterface />
    </NextIntlClientProvider>
  );
}

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digvijay & María | Boda Real",
  description: "Bienvenidos a la unión de Digvijay & María. Una celebración de amor entre España e India.",
};

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { children } = props;
  // We can use lang here if we need to provide a context or similar
  return <>{children}</>;
}

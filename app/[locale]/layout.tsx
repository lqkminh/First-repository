import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Thánh Lễ Missa", template: "%s | Thánh Lễ Missa" },
  description: "Lịch phụng vụ, Thánh Kinh, Hạnh các Thánh, giáo lý và thánh nhạc Công giáo.",
  applicationName: "Thánh Lễ Missa",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
  openGraph: { title: "Thánh Lễ Missa", description: "Tra cứu phụng vụ và học hỏi đức tin Công giáo.", type: "website" }
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "vi" | "en")) notFound();
  const messages = await getMessages();
  return <html lang={locale} suppressHydrationWarning><body><NextIntlClientProvider messages={messages}><SiteHeader />{children}<SiteFooter /><ServiceWorkerRegister /></NextIntlClientProvider></body></html>;
}

"use client";

import { BookOpen, CalendarDays, Church, Library, LogIn, Menu, Music2, Users, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { LocaleSwitch } from "@/components/locale-switch";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const t = useTranslations("Navigation");
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: t("calendar"), icon: CalendarDays },
    { href: "/than-kinh", label: t("bible"), icon: BookOpen },
    { href: "/hanh-cac-thanh", label: t("saints"), icon: Church },
    { href: "/giao-ly", label: t("catechism"), icon: Users },
    { href: "/binh-ca", label: t("chant"), icon: Music2 },
    { href: "/thu-vien", label: t("library"), icon: Library }
  ];
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Thánh Lễ Missa - Trang chủ">
          <span className="brand-mark">✠</span>
          <span><strong>THÁNH LỄ MISSA</strong><small>ORDO · MISSALE · FIDES</small></span>
        </Link>
        <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Điều hướng">
          {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)}><Icon size={15}/>{label}</Link>)}
          <Link href="/hoi-vien" onClick={() => setOpen(false)}>{t("membership")}</Link>
        </nav>
        <div className="header-actions">
          <Link href="/dang-nhap" className="sign-in-link"><LogIn size={15}/>{t("signIn")}</Link>
          <LocaleSwitch />
          <ThemeToggle />
          <button className="icon-button mobile-menu" type="button" onClick={() => setOpen(!open)} aria-label="Mở menu">{open ? <X size={19}/> : <Menu size={19}/>}</button>
        </div>
      </div>
    </header>
  );
}

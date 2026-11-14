"use client";

import { BookOpen, CalendarDays, Church, Library, LogIn, Menu, Music2, Users, X, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { LocaleSwitch } from "@/components/locale-switch";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const t = useTranslations("Navigation");
  const [open,setOpen] = useState(false);
  const links = [
    { href:"/", label:t("calendar") },
    { href:"/than-kinh", label:t("bible") },
    { href:"/hanh-cac-thanh", label:t("saints") },
    { href:"/giao-ly", label:t("catechism") },
    { href:"/binh-ca", label:t("chant") },
    { href:"/thu-vien", label:t("library") }
  ];
  return (
    <>
      <div className="topline"><div className="container topline-inner"><span>✠ &nbsp; AD MAIOREM DEI GLORIAM</span><span>ORDO ROMANUS · SACRA LITURGIA · FIDES CATHOLICA</span></div></div>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="Thánh Lễ Missa - Trang chủ" onClick={()=>setOpen(false)}>
            <span className="brand-mark"><span>✠</span></span>
            <span className="brand-wordmark"><strong>THÁNH LỄ MISSA</strong><small>ORDO · MISSALE · FIDES</small></span>
          </Link>
          <nav className={open?"main-nav is-open":"main-nav"} aria-label="Điều hướng chính">
            {links.map(({href,label})=><Link key={href} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}
            <Link className="nav-member-mobile" href="/hoi-vien" onClick={()=>setOpen(false)}>{t("membership")}</Link>
          </nav>
          <div className="header-actions">
            <Link href="/hoi-vien" className="nav-member"><span>HỘI VIÊN</span><ChevronDown size={13}/></Link>
            <Link href="/dang-nhap" className="sign-in-link"><LogIn size={15}/><span>{t("signIn")}</span></Link>
            <span className="header-divider"/>
            <LocaleSwitch/>
            <ThemeToggle/>
            <button className="icon-button mobile-menu" type="button" onClick={()=>setOpen(!open)} aria-label={open?"Đóng menu":"Mở menu"} aria-expanded={open}>{open?<X size={19}/>:<Menu size={19}/>}</button>
          </div>
        </div>
      </header>
    </>
  );
}

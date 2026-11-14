"use client";
import { useLocale } from "next-intl";
import { usePathname,useRouter } from "@/i18n/navigation";
export function LocaleSwitch(){const locale=useLocale();const pathname=usePathname();const router=useRouter();const nextLocale=locale==="vi"?"en":"vi";return <button className="locale-button" type="button" onClick={()=>router.replace(pathname,{locale:nextLocale})} aria-label={nextLocale==="en"?"Switch to English":"Chuyển sang tiếng Việt"}>{nextLocale.toUpperCase()}</button>;}

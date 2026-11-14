import { getTranslations } from "next-intl/server";
import { CalendarClient } from "@/components/calendar-client";\nimport { Link } from "@/i18n/navigation";

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  return (
    <main>
      <section className="hero-shell">
        <div className="container hero">
          <div className="hero-copy">
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1>{t("title")}</h1>
            <p className="hero-subtitle">{t("subtitle")}</p>
            <Link className="button button-wine" href="/">{t("calendarTitle")}</Link>
          </div>
          <div className="hero-mark" aria-hidden="true">
            <div className="hero-cross">✠</div>
            <span>ORDO · MISSALE · FIDES</span>
          </div>
        </div>
      </section>

      <section className="container calendar-section" id="calendar">
        <div className="section-heading">
          <div><p className="eyebrow">ORDO ROMANUS</p><h2>{t("calendarTitle")}</h2><p>{t("calendarDescription")}</p></div>
        </div>
        <CalendarClient />
      </section>

      <section className="container module-grid" aria-label="Các thư viện">
        <Link href="/than-kinh" className="module-card"><span>01</span><h3>Thánh Kinh</h3><p>Vulgata và bản văn được cấp phép.</p></Link>
        <Link href="/hanh-cac-thanh" className="module-card"><span>02</span><h3>Hạnh các Thánh</h3><p>Tiểu sử và ngày kính các Thánh.</p></a>
        <Link href="/giao-ly" className="module-card"><span>03</span><h3>Giáo lý & Đố vui</h3><p>Học hỏi giáo lý theo từng cấp độ.</p></a>
        <Link href="/binh-ca" className="module-card"><span>04</span><h3>Bình ca</h3><p>Thư viện bình ca và thánh nhạc.</p></a>
        <Link href="/thu-vien" className="module-card"><span>05</span><h3>Thư viện</h3><p>Sách, bài giảng và tài liệu.</p></a>
      </section>
    </main>
  );
}

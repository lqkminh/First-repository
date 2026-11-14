import { CalendarDays, BookOpen, Church, Music2, Library, ArrowRight, Crown, BookMarked, GraduationCap } from "lucide-react";
import { CalendarClient } from "@/components/calendar-client";
import { Link } from "@/i18n/navigation";

const modules = [
  { number:"01", title:"Lịch phụng vụ", latin:"ORDO ROMANUS", description:"Tra cứu niên lịch Rôma 1962 và các lịch trước năm 1955.", href:"/", icon:CalendarDays, tone:"wine" },
  { number:"02", title:"Thánh Kinh", latin:"BIBLIA SACRA", description:"Đọc bản văn Kinh Thánh với Vulgata và bản dịch được cấp phép.", href:"/than-kinh", icon:BookOpen, tone:"gold" },
  { number:"03", title:"Hạnh các Thánh", latin:"VITAE SANCTORUM", description:"Tìm hiểu cuộc đời, nhân đức và ngày kính các Thánh.", href:"/hanh-cac-thanh", icon:Church, tone:"sage" },
  { number:"04", title:"Giáo lý", latin:"CATECHISMUS", description:"Thư viện giáo lý và chương trình học hỏi đức tin.", href:"/giao-ly", icon:GraduationCap, tone:"wine" },
  { number:"05", title:"Bình ca", latin:"CANTUS GREGORIANUS", description:"Bình ca Gregorian, thánh ca và bản nhạc phụng vụ.", href:"/binh-ca", icon:Music2, tone:"gold" },
  { number:"06", title:"Thư viện", latin:"BIBLIOTHECA", description:"Sách thiêng liêng, thần học, phụng vụ và tài liệu tham khảo.", href:"/thu-vien", icon:Library, tone:"sage" }
];

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-grain" aria-hidden="true" />
        <div className="container home-hero-inner">
          <div className="hero-copy">
            <div className="hero-kicker"><span /> AD MAIOREM DEI GLORIAM <span /></div>
            <h1>Thánh Lễ <em>Missa</em></h1>
            <p className="hero-lead">Kho tàng phụng vụ và học hỏi đức tin Công giáo.</p>
            <p className="hero-description">Tra cứu niên lịch, đọc bản văn Latinh – Việt, tìm hiểu hạnh các Thánh và gìn giữ di sản thánh nhạc của Giáo hội.</p>
            <div className="hero-actions">
              <a className="hero-primary" href="#lich-phung-vu"><CalendarDays size={16}/> Tra cứu lịch phụng vụ <ArrowRight size={15}/></a>
              <Link className="hero-secondary" href="/hoi-vien">Khám phá hội viên</Link>
            </div>
            <div className="hero-note"><span className="hero-note-cross">✠</span><span>LEX ORANDI, LEX CREDENDI</span><span className="hero-note-line" /></div>
          </div>
          <div className="hero-art" aria-label="Biểu trưng Thánh Lễ Missa">
            <div className="hero-art-ring ring-one" />
            <div className="hero-art-ring ring-two" />
            <div className="hero-art-center"><span className="hero-art-crown">✥</span><span className="hero-art-cross">✠</span><span className="hero-art-caption">MISSALE<br/>ROMANUM</span></div>
            <span className="hero-art-top">M · M · X X V I</span>
            <span className="hero-art-bottom">IN UNITATE FIDEI</span>
          </div>
        </div>
        <div className="hero-bottom-rule"><span /><span /><span /></div>
      </section>

      <section className="container calendar-section home-calendar" id="lich-phung-vu">
        <div className="section-heading section-heading-editorial">
          <div><p className="eyebrow">ORDO · TEMPUS · FESTA</p><h2>Lịch phụng vụ</h2><p>Chọn niên lịch và ngày muốn tra cứu. Bản văn được trình bày song song Latin – Việt.</p></div>
          <div className="section-heading-side"><span>01 / 06</span><small>PHỤNG VỤ</small></div>
        </div>
        <CalendarClient />
      </section>

      <section className="modules-section">
        <div className="container">
          <div className="section-heading section-heading-editorial modules-heading">
            <div><p className="eyebrow">THESAURUS ECCLESIAE</p><h2>Kho tàng đức tin</h2><p>Những nguồn tài liệu được sưu tầm, biên tập và sắp xếp để phục vụ việc học hỏi và cầu nguyện.</p></div>
            <div className="section-heading-side"><span>06</span><small>PHÂN HỆ</small></div>
          </div>
          <div className="module-grid editorial-module-grid">
            {modules.map(({number,title,latin,description,href,icon:Icon,tone})=>(
              <Link href={href} className="editorial-module-card" key={number}>
                <div className="editorial-module-top"><span>{number}</span><Icon size={21} strokeWidth={1.4} className={"module-icon " + tone}/></div>
                <p className="module-latin">{latin}</p>
                <h3>{title}</h3>
                <p className="module-description">{description}</p>
                <span className="module-open">KHÁM PHÁ <ArrowRight size={13}/></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="membership-band">
        <div className="container membership-band-inner">
          <div className="membership-emblem"><Crown size={24} strokeWidth={1.2}/><span>✠</span></div>
          <div className="membership-copy"><p className="eyebrow">SOCIETAS · HỘI VIÊN</p><h2>Đi sâu hơn vào kho tàng phụng vụ</h2><p>Truy cập các bộ niên lịch và thư viện chuyên biệt theo quyền hội viên.</p></div>
          <Link href="/hoi-vien" className="membership-link">Tìm hiểu các gói hội viên <ArrowRight size={15}/></Link>
        </div>
      </section>

      <section className="container home-quote">
        <BookMarked size={22} strokeWidth={1.2}/>
        <blockquote>“Hãy lấy đức tin mà cầu nguyện, và lấy lời cầu nguyện mà nuôi dưỡng đức tin.”</blockquote>
        <span>THÁNH LỄ MISSA · LEX ORANDI, LEX CREDENDI</span>
      </section>
    </main>
  );
}

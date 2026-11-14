import { CalendarDays, BookOpen, Church, Music2, Library, ArrowRight, Crown, BookMarked, GraduationCap } from "lucide-react";
import { getLocale } from "next-intl/server";
import { CalendarClient } from "@/components/calendar-client";
import { Link } from "@/i18n/navigation";

export default async function HomePage() {
  const locale=await getLocale();
  const en=locale==="en";
  const labels=en?{
    kicker:"AD MAIOREM DEI GLORIAM",lead:"A treasury of Catholic liturgy and learning.",description:"Explore the liturgical calendar, read Latin and Vietnamese texts, discover the lives of the saints and preserve the heritage of sacred music.",calendar:"Liturgical calendar",calendarDescription:"Choose a calendar and date to explore. Texts are presented in parallel Latin and Vietnamese.",libraryKicker:"THESAURUS ECCLESIAE",libraryTitle:"A treasury of faith",libraryDescription:"A carefully curated collection for study, prayer and the preservation of Catholic heritage.",membershipKicker:"SOCIETAS · MEMBERSHIP",membershipTitle:"Go deeper into the treasury of the liturgy",membershipDescription:"Access specialist calendar collections and libraries with the appropriate membership.",membershipLink:"Explore membership plans",quote:"Let faith be your prayer, and let prayer nourish your faith.",explore:"EXPLORE"
  }:{
    kicker:"AD MAIOREM DEI GLORIAM",lead:"Kho tàng phụng vụ và học hỏi đức tin Công giáo.",description:"Tra cứu niên lịch, đọc bản văn Latinh – Việt, tìm hiểu hạnh các Thánh và gìn giữ di sản thánh nhạc của Giáo hội.",calendar:"Lịch phụng vụ",calendarDescription:"Chọn niên lịch và ngày muốn tra cứu. Bản văn được trình bày song song Latin – Việt.",libraryKicker:"THESAURUS ECCLESIAE",libraryTitle:"Kho tàng đức tin",libraryDescription:"Những nguồn tài liệu được sưu tầm, biên tập và sắp xếp để phục vụ việc học hỏi và cầu nguyện.",membershipKicker:"SOCIETAS · HỘI VIÊN",membershipTitle:"Đi sâu hơn vào kho tàng phụng vụ",membershipDescription:"Truy cập các bộ niên lịch và thư viện chuyên biệt theo quyền hội viên.",membershipLink:"Tìm hiểu các gói hội viên",quote:"Hãy lấy đức tin mà cầu nguyện, và lấy lời cầu nguyện mà nuôi dưỡng đức tin.",explore:"KHÁM PHÁ"
  };
  const modules = en?[
    {number:"01",title:"Liturgical Calendar",latin:"ORDO ROMANUS",description:"Explore the Roman 1962 and pre-1955 liturgical calendars.",href:"/",icon:CalendarDays,tone:"wine"},
    {number:"02",title:"Holy Bible",latin:"BIBLIA SACRA",description:"Read the Latin Vulgate and properly licensed translations.",href:"/than-kinh",icon:BookOpen,tone:"gold"},
    {number:"03",title:"Lives of the Saints",latin:"VITAE SANCTORUM",description:"Discover the lives, virtues and feast days of the saints.",href:"/hanh-cac-thanh",icon:Church,tone:"sage"},
    {number:"04",title:"Catechism",latin:"CATECHISMUS",description:"A structured library for learning the Catholic faith.",href:"/giao-ly",icon:GraduationCap,tone:"wine"},
    {number:"05",title:"Gregorian Chant",latin:"CANTUS GREGORIANUS",description:"Gregorian chant, sacred hymns and liturgical scores.",href:"/binh-ca",icon:Music2,tone:"gold"},
    {number:"06",title:"Library",latin:"BIBLIOTHECA",description:"Spiritual, theological, liturgical and historical works.",href:"/thu-vien",icon:Library,tone:"sage"}
  ]:[
    {number:"01",title:"Lịch phụng vụ",latin:"ORDO ROMANUS",description:"Tra cứu niên lịch Rôma 1962 và các lịch trước năm 1955.",href:"/",icon:CalendarDays,tone:"wine"},
    {number:"02",title:"Thánh Kinh",latin:"BIBLIA SACRA",description:"Đọc bản văn Kinh Thánh với Vulgata và bản dịch được cấp phép.",href:"/than-kinh",icon:BookOpen,tone:"gold"},
    {number:"03",title:"Hạnh các Thánh",latin:"VITAE SANCTORUM",description:"Tìm hiểu cuộc đời, nhân đức và ngày kính các Thánh.",href:"/hanh-cac-thanh",icon:Church,tone:"sage"},
    {number:"04",title:"Giáo lý",latin:"CATECHISMUS",description:"Thư viện giáo lý và chương trình học hỏi đức tin.",href:"/giao-ly",icon:GraduationCap,tone:"wine"},
    {number:"05",title:"Bình ca",latin:"CANTUS GREGORIANUS",description:"Bình ca Gregorian, thánh ca và bản nhạc phụng vụ.",href:"/binh-ca",icon:Music2,tone:"gold"},
    {number:"06",title:"Thư viện",latin:"BIBLIOTHECA",description:"Sách thiêng liêng, thần học, phụng vụ và tài liệu tham khảo.",href:"/thu-vien",icon:Library,tone:"sage"}
  ];
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-grain" aria-hidden="true" />
        <div className="container home-hero-inner">
          <div className="hero-copy">
            <div className="hero-kicker"><span /> {labels.kicker} <span /></div>
            <h1>Thánh Lễ <em>Missa</em></h1>
            <p className="hero-lead">{labels.lead}</p>
            <p className="hero-description">{labels.description}</p>
            <div className="hero-actions">
              <a className="hero-primary" href="#lich-phung-vu"><CalendarDays size={16}/>{labels.calendar}<ArrowRight size={15}/></a>
              <Link className="hero-secondary" href="/hoi-vien">{labels.membershipLink}</Link>
            </div>
            <div className="hero-note"><span className="hero-note-cross">✠</span><span>LEX ORANDI, LEX CREDENDI</span><span className="hero-note-line" /></div>
          </div>
          <div className="hero-art" aria-label="Thánh Lễ Missa">
            <div className="hero-art-ring ring-one" /><div className="hero-art-ring ring-two" />
            <div className="hero-art-center"><span className="hero-art-crown">✥</span><span className="hero-art-cross">✠</span><span className="hero-art-caption">MISSALE<br/>ROMANUM</span></div>
            <span className="hero-art-top">M · M · X X V I</span><span className="hero-art-bottom">IN UNITATE FIDEI</span>
          </div>
        </div>
        <div className="hero-bottom-rule"><span/><span/><span/></div>
      </section>

      <section className="container calendar-section home-calendar" id="lich-phung-vu">
        <div className="section-heading section-heading-editorial">
          <div><p className="eyebrow">ORDO · TEMPUS · FESTA</p><h2>{labels.calendar}</h2><p>{labels.calendarDescription}</p></div>
          <div className="section-heading-side"><span>01 / 06</span><small>{en?"LITURGY":"PHỤNG VỤ"}</small></div>
        </div>
        <CalendarClient/>
      </section>

      <section className="modules-section"><div className="container">
        <div className="section-heading section-heading-editorial modules-heading">
          <div><p className="eyebrow">{labels.libraryKicker}</p><h2>{labels.libraryTitle}</h2><p>{labels.libraryDescription}</p></div>
          <div className="section-heading-side"><span>06</span><small>{en?"COLLECTIONS":"PHÂN HỆ"}</small></div>
        </div>
        <div className="module-grid editorial-module-grid">
          {modules.map(({number,title,latin,description,href,icon:Icon,tone})=><Link href={href} className="editorial-module-card" key={number}>
            <div className="editorial-module-top"><span>{number}</span><Icon size={21} strokeWidth={1.4} className={"module-icon "+tone}/></div>
            <p className="module-latin">{latin}</p><h3>{title}</h3><p className="module-description">{description}</p>
            <span className="module-open">{labels.explore}<ArrowRight size={13}/></span>
          </Link>)}
        </div>
      </div></section>

      <section className="membership-band"><div className="container membership-band-inner">
        <div className="membership-emblem"><Crown size={24} strokeWidth={1.2}/><span>✠</span></div>
        <div className="membership-copy"><p className="eyebrow">{labels.membershipKicker}</p><h2>{labels.membershipTitle}</h2><p>{labels.membershipDescription}</p></div>
        <Link href="/hoi-vien" className="membership-link">{labels.membershipLink}<ArrowRight size={15}/></Link>
      </div></section>

      <section className="container home-quote"><BookMarked size={22} strokeWidth={1.2}/><blockquote>“{labels.quote}”</blockquote><span>THÁNH LỄ MISSA · LEX ORANDI, LEX CREDENDI</span></section>
    </main>
  );
}

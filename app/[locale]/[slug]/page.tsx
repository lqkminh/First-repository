import { ArrowLeft, ArrowRight, BookOpen, Church, Library, Music2, GraduationCap, LockKeyhole, Sparkles } from "lucide-react";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";

type ModuleCopy = { title:string; latin:string; description:string; status:string; points:string[]; icon:typeof BookOpen };
const moduleCopy:Record<string,{vi:ModuleCopy;en:ModuleCopy}> = {
  "than-kinh": {
    vi:{title:"Thánh Kinh",latin:"BIBLIA SACRA",description:"Đọc và suy niệm Lời Chúa với bản văn được trình bày cẩn trọng, tôn trọng nguồn và ấn bản.",status:"Đang chuẩn bị dữ liệu và kiểm tra giấy phép bản dịch.",points:["Bản văn Vulgata Latin","Bản dịch tiếng Việt có quyền sử dụng","Tra cứu theo sách, chương và câu","Đánh dấu, ghi chú và tiếp tục đọc"],icon:BookOpen},
    en:{title:"Holy Bible",latin:"BIBLIA SACRA",description:"Read and meditate on Scripture with carefully presented texts and proper source attribution.",status:"Text sources and translation permissions are being reviewed.",points:["Latin Vulgate text","Vietnamese translations with proper rights","Browse by book, chapter and verse","Bookmarks, notes and reading progress"],icon:BookOpen}
  },
  "hanh-cac-thanh":{
    vi:{title:"Hạnh các Thánh",latin:"VITAE SANCTORUM",description:"Tìm hiểu cuộc đời, nhân đức, chứng tá và ngày kính của các Thánh trong lịch sử Giáo hội.",status:"Đang chuẩn bị nguồn tư liệu và quy trình biên tập.",points:["Tra cứu theo ngày kính","Tiểu sử và quê quán","Quan thầy và các tước hiệu","Nguồn tham khảo cho từng bài"],icon:Church},
    en:{title:"Lives of the Saints",latin:"VITAE SANCTORUM",description:"Discover the lives, virtues, witness and feast days of the saints throughout the Church's history.",status:"Sources and editorial workflow are being prepared.",points:["Browse by feast day","Biographies and places of origin","Patronages and titles","References for each entry"],icon:Church}
  },
  "giao-ly":{
    vi:{title:"Giáo lý",latin:"CATECHISMUS",description:"Một thư viện học hỏi đức tin có hệ thống, từ giáo lý căn bản đến các chủ đề thần học chuyên sâu.",status:"Đang chuẩn bị mục lục và dữ liệu giáo lý.",points:["Sách Giáo lý Hội Thánh Công Giáo","Giáo lý dự tòng và thiếu nhi","Tìm kiếm theo chủ đề","Đánh dấu đã đọc và ghi chú"],icon:GraduationCap},
    en:{title:"Catechism",latin:"CATECHISMUS",description:"A structured library for learning the Catholic faith, from foundational catechesis to deeper theological topics.",status:"The contents and learning structure are being prepared.",points:["Catechism of the Catholic Church","Catechesis for candidates and children","Topic-based search","Reading progress and notes"],icon:GraduationCap}
  },
  "do-vui":{
    vi:{title:"Đố vui Giáo lý",latin:"CERTAMEN CATECHETICUM",description:"Ôn tập giáo lý qua những câu hỏi được phân cấp, có giải thích và dẫn chiếu nguồn.",status:"Cấu trúc dữ liệu đã được chuẩn bị; bộ câu hỏi đang chờ biên soạn.",points:["Nhiều cấp độ học hỏi","Trắc nghiệm và điền khuyết","Giải thích đáp án","Lịch sử kết quả"],icon:Sparkles},
    en:{title:"Catechism Quiz",latin:"CERTAMEN CATECHETICUM",description:"Review the faith with graded questions, explanations and references to source material.",status:"The data structure is ready; the question bank is being prepared.",points:["Multiple learning levels","Multiple-choice and fill-in questions","Answer explanations","Attempt history"],icon:Sparkles}
  },
  "binh-ca":{
    vi:{title:"Bình ca và Thánh nhạc",latin:"CANTUS GREGORIANUS",description:"Gìn giữ và phổ biến di sản bình ca Gregorian, thánh ca và nhạc phụng vụ qua các thời đại.",status:"Đang chuẩn bị thư viện; chỉ công bố bản nhạc và bản thu có quyền sử dụng.",points:["Bình ca Gregorian theo mùa và nghi thức","Bản nhạc PDF và MusicXML khi được phép","Bản văn Latin – Việt","Danh sách nghe và yêu thích"],icon:Music2},
    en:{title:"Gregorian Chant & Sacred Music",latin:"CANTUS GREGORIANUS",description:"Preserve and share the heritage of Gregorian chant, sacred hymns and liturgical music across the ages.",status:"The library is being prepared; scores and recordings will be published only with appropriate rights.",points:["Gregorian chant by season and rite","PDF and MusicXML scores where licensed","Latin and Vietnamese lyrics","Listening lists and favourites"],icon:Music2}
  },
  "thu-vien":{
    vi:{title:"Thư viện",latin:"BIBLIOTHECA",description:"Kho sách và tư liệu về đời sống thiêng liêng, thần học, phụng vụ, giáo luật và lịch sử Giáo hội.",status:"Đang chuẩn bị danh mục và quy trình kiểm tra bản quyền.",points:["Sách thiêng liêng và thần học","Phụng vụ và giáo luật","Bài giảng và suy niệm","Trình đọc PDF/EPUB khi có quyền"],icon:Library},
    en:{title:"Library",latin:"BIBLIOTHECA",description:"A collection of resources on spiritual life, theology, liturgy, canon law and Church history.",status:"The catalogue and rights-review workflow are being prepared.",points:["Spiritual and theological works","Liturgy and canon law","Sermons and meditations","PDF/EPUB reader where permitted"],icon:Library}
  }
};

export function generateStaticParams() {
  return [...Object.keys(moduleCopy),"hoi-vien","ve-chung-toi","lien-he","chinh-sach-bao-mat","dieu-khoan"].map((slug)=>({slug}));
}

export default async function ModulePage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const locale=await getLocale();
  if(slug==="hoi-vien") return <MembershipPage english={locale==="en"}/>;
  if(slug==="ve-chung-toi"||slug==="lien-he"||slug==="chinh-sach-bao-mat"||slug==="dieu-khoan") {
    const legal:Record<string,{title:string;description:string}> = {
      "ve-chung-toi":{title:locale==="en"?"About us":"Về chúng tôi",description:locale==="en"?"Thánh Lễ Missa is a project for the careful study and preservation of Catholic liturgical and devotional heritage.":"Thánh Lễ Missa là dự án phục vụ việc tra cứu, học hỏi và gìn giữ kho tàng phụng vụ, thánh nhạc và giáo huấn Công giáo."},
      "lien-he":{title:locale==="en"?"Contact":"Liên hệ",description:locale==="en"?"Contact details and feedback channels will be published here.":"Thông tin liên hệ và kênh tiếp nhận góp ý sẽ được công bố tại đây."},
      "chinh-sach-bao-mat":{title:locale==="en"?"Privacy policy":"Chính sách bảo mật",description:locale==="en"?"The privacy policy will be completed before account registration and membership payments are enabled.":"Chính sách bảo mật sẽ được hoàn thiện trước khi mở đăng ký tài khoản và thanh toán hội viên."},
      "dieu-khoan":{title:locale==="en"?"Terms of use":"Điều khoản sử dụng",description:locale==="en"?"The terms of use will be completed before the platform is opened to members.":"Điều khoản sử dụng sẽ được hoàn thiện trước khi nền tảng mở cho hội viên."}
    };
    const item=legal[slug];
    return <main className="container simple-info-page"><p className="eyebrow">THÁNH LỄ MISSA · {locale==="en"?"INFORMATION":"THÔNG TIN"}</p><h1>{item.title}</h1><p>{item.description}</p><Link href="/" className="back-home"><ArrowLeft size={14}/>{locale==="en"?"Back to home":"Trở về trang chủ"}</Link></main>;
  }
  const moduleData=moduleCopy[slug]?.[locale==="en"?"en":"vi"];
  if(!moduleData) notFound();
  const Icon=moduleData.icon;
  return (
    <main className="module-detail-page">
      <section className="module-detail-hero"><div className="container module-detail-hero-inner">
        <div className="module-detail-copy"><p className="eyebrow">THÁNH LỄ MISSA · THƯ VIỆN</p><p className="module-detail-latin">{moduleData.latin}</p><h1>{moduleData.title}</h1><p>{moduleData.description}</p><div className="module-status-inline"><span className="status-dot"/>{moduleData.status}</div></div>
        <div className="module-detail-emblem"><Icon size={46} strokeWidth={1.1}/><span>✠</span></div>
      </div></section>
      <section className="container module-detail-body">
        <div className="module-detail-main"><p className="eyebrow">{locale==="en"?"IN THIS SECTION":"NỘI DUNG PHÂN HỆ"}</p><h2>{locale==="en"?"What you will find":"Những nội dung chính"}</h2><div className="module-feature-list">{moduleData.points.map((point,index)=><div className="module-feature" key={point}><span>0{index+1}</span><p>{point}</p></div>)}</div></div>
        <aside className="module-detail-aside"><span className="aside-cross">✠</span><h3>{locale==="en"?"Carefully sourced content":"Nội dung có nguồn dẫn"}</h3><p>{locale==="en"?"Entries will be reviewed for accuracy, source attribution and appropriate usage rights before publication.":"Tư liệu sẽ được kiểm tra về nội dung, xuất xứ và quyền sử dụng trước khi công bố."}</p><Link href="/hoi-vien">{locale==="en"?"Membership information":"Thông tin hội viên"} <ArrowRight size={13}/></Link></aside>
      </section>
      <div className="container module-back-row"><Link href="/" className="back-home"><ArrowLeft size={14}/>{locale==="en"?"Back to home":"Trở về trang chủ"}</Link></div>
    </main>
  );
}

function MembershipPage({english}:{english:boolean}) {
  const copy=english?{
    kicker:"SOCIETAS · MEMBERSHIP",title:"Membership plans",intro:"Choose the liturgical collection you wish to access. The 1962 and pre-1955 calendars are separate collections.",
    free:"Free access",freePrice:"0 VND",freeDesc:"Today's published information and the designated free texts.",planA:"Roman Ordo 1962",planADesc:"Full access to the 1962 liturgical calendar and its published Missal sections.",planB:"Pre-1955 Ordo",planBDesc:"Access to the separate pre-1955 calendar and its reviewed liturgical collection.",month:"per month",year:"per year",note:"Online payment is not yet enabled. Membership purchase will open only after authentication, payment verification and renewal workflows have been tested.",login:"Sign in",badge:"PAYMENT NOT ACTIVE"
  }:{
    kicker:"SOCIETAS · HỘI VIÊN",title:"Các gói hội viên",intro:"Chọn bộ sưu tập phụng vụ muốn truy cập. Niên lịch 1962 và trước năm 1955 là hai thư viện riêng biệt.",
    free:"Truy cập miễn phí",freePrice:"0 đồng",freeDesc:"Thông tin ngày lễ hôm nay và những bản văn được đánh dấu công khai.",planA:"Ordo Rôma 1962",planADesc:"Truy cập đầy đủ lịch phụng vụ 1962 và các phần sách lễ đã xuất bản.",planB:"Ordo trước 1955",planBDesc:"Truy cập riêng bộ niên lịch trước năm 1955 và các bản văn đã kiểm duyệt.",month:"mỗi tháng",year:"mỗi năm",note:"Thanh toán trực tuyến hiện chưa được kích hoạt. Chỉ mở đăng ký sau khi đã kiểm thử đăng nhập, xác nhận thanh toán và gia hạn hội viên.",login:"Đăng nhập",badge:"CHƯA MỞ THANH TOÁN"
  };
  return (
    <main className="membership-page">
      <section className="membership-page-hero"><div className="container"><p className="eyebrow">{copy.kicker}</p><h1>{copy.title}</h1><p>{copy.intro}</p></div></section>
      <section className="container membership-page-body">
        <div className="membership-plan-card free"><div className="plan-top"><span>01</span><span>FREE</span></div><h2>{copy.free}</h2><strong>{copy.freePrice}</strong><p>{copy.freeDesc}</p><ul><li>{english?"Today’s published liturgical information":"Thông tin ngày lễ hôm nay"}</li><li>{english?"The designated free readings":"Bài Thơ và Phúc-âm thư công khai"}</li></ul><Link href="/dang-nhap" className="plan-link">{copy.login} <ArrowRight size={14}/></Link></div>
        <div className="membership-plan-card featured"><div className="plan-top"><span>02</span><span>ORDO · 1962</span></div><h2>{copy.planA}</h2><strong>{english?"39,000 VND":"39.000đ"} <small>/ {copy.month}</small></strong><p>{copy.planADesc}</p><ul><li>{english?"390,000 VND":"390.000đ"} / {copy.year}</li><li>{english?"Separate calendar entitlement":"Quyền truy cập niên lịch riêng"}</li></ul><span className="plan-disabled">{copy.badge}</span></div>
        <div className="membership-plan-card"><div className="plan-top"><span>03</span><span>ORDO · PRE-55</span></div><h2>{copy.planB}</h2><strong>{english?"69,000 VND":"69.000đ"} <small>/ {copy.month}</small></strong><p>{copy.planBDesc}</p><ul><li>{english?"690,000 VND":"690.000đ"} / {copy.year}</li><li>{english?"Separate calendar entitlement":"Quyền truy cập niên lịch riêng"}</li></ul><span className="plan-disabled">{copy.badge}</span></div>
      </section>
      <div className="container membership-note"><LockKeyhole size={17}/><p>{copy.note}</p></div>
    </main>
  );
}

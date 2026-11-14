import { notFound } from "next/navigation";

const pages: Record<string,{title:string;description:string;status:string}> = {
  "than-kinh": { title:"Thánh Kinh", description:"Đọc Thánh Kinh với bản văn Latin Vulgata và các bản dịch đã được cấp phép.", status:"Phân hệ đang chờ nhập dữ liệu và kiểm tra giấy phép bản dịch." },
  "hanh-cac-thanh": { title:"Hạnh các Thánh", description:"Tra cứu hạnh các Thánh theo ngày kính, quốc gia, dòng tu và quan thầy.", status:"Đang chuẩn bị cấu trúc biên tập và nguồn tư liệu." },
  "giao-ly": { title:"Giáo lý", description:"Thư viện giáo lý có mục lục, tìm kiếm, đánh dấu đã đọc và ghi chú cá nhân.", status:"Phân hệ nội dung sẽ được triển khai sau Lịch Phụng Vụ." },
  "do-vui": { title:"Đố vui Giáo lý", description:"Bộ câu hỏi trắc nghiệm, điền khuyết và các cấp độ học hỏi.", status:"Cấu trúc dữ liệu Quiz và Question đã có trong Prisma; giao diện sẽ phát triển tiếp." },
  "binh-ca": { title:"Bình ca và Thánh nhạc", description:"Thư viện bình ca Gregorian, thánh ca và bản nhạc phụng vụ.", status:"Chỉ nhập âm thanh và bản nhạc có giấy phép phù hợp hoặc thuộc phạm vi công cộng." },
  "thu-vien": { title:"Thư viện", description:"Sách, bài viết, bài giảng, tài liệu PDF và EPUB được phân loại theo chủ đề.", status:"Đã có cấu trúc Document, Category và nguồn tư liệu; trình đọc sẽ phát triển tiếp." },
  "ve-chung-toi": { title:"Về chúng tôi", description:"Giới thiệu dự án Thánh Lễ Missa và mục tiêu phục vụ việc tra cứu phụng vụ.", status:"Nội dung giới thiệu sẽ được biên soạn." },
  "lien-he": { title:"Liên hệ", description:"Liên hệ ban quản trị và gửi góp ý về dữ liệu phụng vụ.", status:"Biểu mẫu liên hệ sẽ được bổ sung." },
  "chinh-sach-bao-mat": { title:"Chính sách bảo mật", description:"Thông tin về tài khoản, dữ liệu cá nhân và quyền riêng tư.", status:"Cần hoàn thiện và rà soát pháp lý trước khi vận hành." },
  "dieu-khoan": { title:"Điều khoản sử dụng", description:"Điều khoản truy cập, quyền hội viên và sử dụng nội dung.", status:"Cần hoàn thiện và rà soát pháp lý trước khi vận hành." }
};

export function generateStaticParams() {
  return Object.keys(pages).map((slug)=>({slug}));
}

export default function ModulePage({params}:{params:{slug:string}}) {
  const page=pages[params.slug];
  if (!page) notFound();
  if(params.slug==="hoi-vien") return <MembershipPage />;
  return <main className="container module-page"><p className="eyebrow">THÁNH LỄ MISSA · THƯ VIỆN</p><h1>{page.title}</h1><p className="module-page-description">{page.description}</p><div className="module-status"><strong>Trạng thái phát triển</strong><p>{page.status}</p></div><a className="button button-wine" href="/vi">Trở về lịch phụng vụ</a></main>;
}

function MembershipPage() {
  return <main className="container module-page"><p className="eyebrow">SOCIETAS · HỘI VIÊN</p><h1>Gói hội viên</h1><p className="module-page-description">Chọn thư viện phụng vụ mà bạn muốn truy cập. Hai niên lịch là hai quyền hội viên độc lập.</p><div className="member-plan-grid">
    <article><span>FREE</span><h2>Miễn phí</h2><strong>0đ</strong><p>Thông tin ngày lễ hôm nay, Bài Thơ và Phúc-âm thư được công bố miễn phí.</p></article>
    <article className="featured"><span>ORDO 1962</span><h2>Lịch Rôma 1962</h2><strong>39.000đ / tháng</strong><p>390.000đ / năm · Tra cứu đầy đủ lịch 1962 và các phần sách lễ.</p></article>
    <article><span>ORDO PRE-55</span><h2>Lịch trước 1955</h2><strong>69.000đ / tháng</strong><p>690.000đ / năm · Thư viện phụng vụ trước 1955 riêng biệt.</p></article>
  </div><div className="module-status"><strong>Thanh toán chưa được kích hoạt</strong><p>Giá và cấu trúc hội viên đã được chuẩn bị. Chỉ mở đăng ký trả phí sau khi cấu hình xác thực, cổng thanh toán, webhook và quy trình gia hạn.</p></div></main>;
}

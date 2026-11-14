import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer editorial-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <span className="footer-brand-mark">✠</span>
          <strong>THÁNH LỄ MISSA</strong>
          <p>Gìn giữ và phổ biến kho tàng phụng vụ, thánh nhạc và giáo huấn Công giáo.</p>
        </div>
        <div className="footer-column"><span>TRA CỨU</span><Link href="/">Lịch phụng vụ</Link><Link href="/than-kinh">Thánh Kinh</Link><Link href="/hanh-cac-thanh">Hạnh các Thánh</Link></div>
        <div className="footer-column"><span>HỌC HỎI</span><Link href="/giao-ly">Giáo lý</Link><Link href="/binh-ca">Bình ca</Link><Link href="/thu-vien">Thư viện</Link></div>
        <div className="footer-column"><span>THÔNG TIN</span><Link href="/ve-chung-toi">Về chúng tôi</Link><Link href="/lien-he">Liên hệ</Link><Link href="/hoi-vien">Hội viên <ArrowUpRight size={12}/></Link></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} THÁNH LỄ MISSA</span><span>LEX ORANDI, LEX CREDENDI</span><div><Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link><Link href="/dieu-khoan">Điều khoản sử dụng</Link></div></div>
    </footer>
  );
}

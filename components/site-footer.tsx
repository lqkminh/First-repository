import { Link } from "@/i18n/navigation";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div><strong>THÁNH LỄ MISSA</strong><p>Lịch phụng vụ · Thánh Kinh · Thánh nhạc · Thư viện</p></div>
        <div className="footer-links"><Link href="/ve-chung-toi">Về chúng tôi</Link><Link href="/lien-he">Liên hệ</Link><Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link><Link href="/dieu-khoan">Điều khoản</Link></div>
        <small>© {new Date().getFullYear()} Thánh Lễ Missa</small>
      </div>
    </footer>
  );
}

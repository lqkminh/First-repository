import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { getLocale } from "next-intl/server";

export async function SiteFooter() {
  const en=(await getLocale())==="en";
  return (
    <footer className="site-footer editorial-footer">
      <div className="container footer-main">
        <div className="footer-brand"><span className="footer-brand-mark">✠</span><strong>THÁNH LỄ MISSA</strong><p>{en?"Preserving and sharing the heritage of Catholic liturgy, sacred music and teaching.":"Gìn giữ và phổ biến kho tàng phụng vụ, thánh nhạc và giáo huấn Công giáo."}</p></div>
        <div className="footer-column"><span>{en?"DISCOVER":"TRA CỨU"}</span><Link href="/">{en?"Liturgical calendar":"Lịch phụng vụ"}</Link><Link href="/than-kinh">{en?"Holy Bible":"Thánh Kinh"}</Link><Link href="/hanh-cac-thanh">{en?"Lives of the Saints":"Hạnh các Thánh"}</Link></div>
        <div className="footer-column"><span>{en?"LEARN":"HỌC HỎI"}</span><Link href="/giao-ly">{en?"Catechism":"Giáo lý"}</Link><Link href="/binh-ca">{en?"Gregorian chant":"Bình ca"}</Link><Link href="/thu-vien">{en?"Library":"Thư viện"}</Link></div>
        <div className="footer-column"><span>{en?"INFORMATION":"THÔNG TIN"}</span><Link href="/ve-chung-toi">{en?"About us":"Về chúng tôi"}</Link><Link href="/lien-he">{en?"Contact":"Liên hệ"}</Link><Link href="/hoi-vien">{en?"Membership":"Hội viên"} <ArrowUpRight size={12}/></Link></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} THÁNH LỄ MISSA</span><span>LEX ORANDI, LEX CREDENDI</span><div><Link href="/chinh-sach-bao-mat">{en?"Privacy policy":"Chính sách bảo mật"}</Link><Link href="/dieu-khoan">{en?"Terms of use":"Điều khoản sử dụng"}</Link></div></div>
    </footer>
  );
}

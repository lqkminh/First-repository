import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session=await getServerSession(authOptions);
  const locale=await getLocale();
  if(!session?.user?.id) redirect("/"+locale+"/dang-nhap");
  if(!["ADMIN","EDITOR"].includes(session.user.role)) redirect("/"+locale);
  const [draftDays,reviewDays,publishedDays,users]=await Promise.all([
    prisma.liturgicalDay.count({where:{status:"DRAFT"}}),
    prisma.liturgicalDay.count({where:{status:"IN_REVIEW"}}),
    prisma.liturgicalDay.count({where:{status:"PUBLISHED"}}),
    session.user.role==="ADMIN"?prisma.user.count():Promise.resolve(null)
  ]);
  return (
    <main className="container admin-shell">
      <p className="eyebrow">CONTROL PANEL</p><h1>Quản trị nội dung</h1>
      <p className="admin-intro">Xin chào {session.user.name??session.user.email}. Vai trò: {session.user.role}.</p>
      <div className="admin-stats">
        <div><strong>{draftDays}</strong><span>Bản nháp</span></div>
        <div><strong>{reviewDays}</strong><span>Chờ duyệt</span></div>
        <div><strong>{publishedDays}</strong><span>Đã xuất bản</span></div>
        {users!==null&&<div><strong>{users}</strong><span>Tài khoản</span></div>}
      </div>
      <section className="admin-panel"><h2>Lịch phụng vụ</h2><p>Quản lý ngày lễ và các mục sách lễ. API CRUD đã có kiểm tra vai trò Editor/Admin; giao diện nhập liệu sẽ được hoàn thiện tiếp trong module Lịch.</p><a className="button button-wine" href="/vi/admin/lich-phung-vu">Mở quản lý lịch</a></section>
      <section className="admin-panel"><h2>Các phân hệ</h2><div className="admin-links"><a href="/vi/admin/lich-phung-vu">Lịch phụng vụ</a><a href="/vi/admin/hoi-vien">Hội viên</a><a href="/vi/admin/thu-vien">Thư viện</a></div></section>
    </main>
  );
}

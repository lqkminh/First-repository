import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { LiturgicalAdminClient } from "@/components/liturgical-admin-client";

export default async function LiturgicalAdminPage() {
  const session=await getServerSession(authOptions);
  const locale=await getLocale();
  if(!session?.user?.id||!["ADMIN","EDITOR"].includes(session.user.role)) redirect("/"+locale+"/dang-nhap");
  return <main className="container admin-shell"><p className="eyebrow">EDITOR WORKSPACE</p><h1>Biên tập lịch phụng vụ</h1><p className="admin-intro">Tạo ngày lễ, nhập thông tin Latin – Việt và lưu ở trạng thái bản nháp hoặc chờ duyệt.</p><LiturgicalAdminClient/></main>;
}

# Thánh Lễ Missa

Nền tảng tra cứu phụng vụ, Thánh Kinh, Hạnh các Thánh, giáo lý, bình ca và thư viện Công giáo. Giao diện mặc định tiếng Việt, có English, Light/Dark mode và thiết kế responsive.

> Nhánh Next.js mới được phát triển riêng. Website GitHub Pages cũ trên `main` được giữ nguyên đến khi hoàn tất kiểm thử và chuyển hosting.

## Kiến trúc

- Next.js 15.5.28 App Router + TypeScript.
- Tailwind CSS và Lucide icons.
- PostgreSQL + Prisma ORM.
- NextAuth v4 với Email magic link và Google OAuth (cần cấu hình).
- next-intl: `vi` mặc định, `en` tùy chọn.
- PWA manifest + service worker; không cache API hoặc dữ liệu hội viên.
- Vitest cho tiện ích lịch.
- Docker cho môi trường phát triển/triển khai.

```text
Browser / PWA
    -> Next.js App Router (VI/EN, responsive, dark/light)
       -> NextAuth (Email / Google)
       -> API Routes (role/entitlement check, Zod validation, audit log)
          -> Prisma ORM
             -> PostgreSQL
                -> Users / Roles / Sessions
                -> Calendars / Days / Bilingual sections / Sources / Saints
                -> Bible / Catechism / Quiz / Hymns / Playlists / Documents
                -> Plans / Prices / Subscriptions / Payments / Entitlements
          -> Private storage (later: Supabase Storage / Cloudflare R2)
          -> Payment provider webhook (later)
```

## Niên lịch

- `ROMAN_1962`: Missale Romanum 1962.
- `PRE_1955`: lịch và sách lễ trước 1955.

Hai niên lịch được lưu và phân quyền riêng. Chu kỳ Chúa Nhật A/B/C chỉ là metadata tùy chọn cho truyền thống sử dụng chu kỳ đó; không áp dụng mặc định cho bản văn 1962 hoặc tiền 1955.

## Gói hội viên

- Free: thông tin ngày hôm nay và section được Admin đánh dấu `PUBLIC_TODAY` (Bài Thơ, Phúc-âm thư).
- ORDO 1962: 39.000đ/tháng hoặc 390.000đ/năm.
- ORDO tiền 1955: 69.000đ/tháng hoặc 690.000đ/năm.

Hai entitlement độc lập. Chưa bật thanh toán thật cho đến khi cấu hình đối tác, webhook ký số, idempotency và quy trình hủy/gia hạn.

## Bắt đầu cục bộ

Yêu cầu: Node.js 20+, npm, PostgreSQL 15+.

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Mở http://localhost:3000. Cấu hình Google OAuth hoặc email SMTP nếu muốn bật provider đăng nhập.

## Kiểm tra chất lượng

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Docker

```bash
docker compose up --build
```

Ứng dụng chạy ở http://localhost:3000; PostgreSQL ở localhost:5432. Đổi mật khẩu database trong môi trường thật.

## Prisma

- Schema: `prisma/schema.prisma`
- Seed: `prisma/seed.ts`
- Tạo migration: `npm run db:migrate`
- Triển khai migration: `npm run db:deploy`
- Quản lý database: `npm run db:studio`

Seed chỉ tạo hai niên lịch, các gói và giá; không tự thêm ngày lễ giả. Nội dung phải do Editor nhập, kiểm tra nguồn và Admin duyệt.

## Phân quyền

- Guest: ngày hôm nay và section Free được xuất bản.
- User: nội dung theo entitlement.
- Editor: tạo/sửa nội dung, gửi duyệt; không được tự xuất bản.
- Admin: duyệt/xuất bản và quản trị.

API trả dữ liệu trả phí chỉ sau khi kiểm tra entitlement ở server. Không nhúng bản văn trả phí vào JavaScript công khai hoặc service worker cache.

## Tài liệu

- [Kiến trúc](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Nguồn và bản quyền](docs/SOURCES_AND_LICENSES.md)

## Triển khai

Khuyến nghị Vercel + PostgreSQL managed cho giai đoạn đầu hoặc VPS Docker. GitHub Pages hiện tại không chạy Next.js server routes/Prisma; chỉ chuyển tên miền sau khi kiểm thử, sao lưu/khôi phục và nghiệm thu bảo mật.

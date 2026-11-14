# Kiến trúc chi tiết — Thánh Lễ Missa

## Lựa chọn

1. Monolith Next.js trước, chưa tách NestJS.
2. PostgreSQL + Prisma.
3. NextAuth v4 + Prisma Adapter.
4. PostgreSQL Full-text Search trước; Meilisearch/Redis chỉ bổ sung khi có nhu cầu đo được.
5. PWA chỉ cache shell/static assets; không cache API, admin, thanh toán hoặc bản văn hội viên.
6. File trả phí lưu ở private storage, phân phối bằng signed URL thời hạn ngắn.

## Sơ đồ

```text
[Mobile / Desktop / PWA]
      |
      v
[Next.js 15.5.28 + next-intl + Tailwind]
      |-- Calendar / Bible / Saints / Catechism / Quiz / Chant / Library
      |-- NextAuth Email + Google
      |-- API Routes
             |-- Role check: Guest / User / Editor / Admin
             |-- Entitlement: ROMAN_1962 / PRE_1955
             |-- Zod validation + audit log
      v
[Prisma ORM] -> [PostgreSQL]
      |-- Users / Account / Session / Role
      |-- Calendar / Day / Section / Source / Saint
      |-- Bible / Catechism / Quiz / Hymn / Playlist
      |-- Document / Category / Comment / Rating
      |-- Plan / Price / Subscription / Payment / Entitlement
      +-- Private storage / Payment webhook / Search
```

## Lịch phụng vụ

`LiturgicalCalendar` tách ROMAN_1962 và PRE_1955. `LiturgicalDay` định danh bằng calendar + civilDate. `LiturgicalSection` lưu nhãn, tham chiếu và bản văn Latin/Việt theo vị trí. Ngày liên kết nhiều thánh qua `DaySaint`.

Module 1 có:
- Hôm nay, tuần, tháng, năm.
- Lưới tháng bắt đầu Thứ Hai.
- Đổi lịch 1962 / trước 1955.
- Modal chi tiết ngày: bậc lễ, màu, mùa, bản văn song ngữ, Thánh kính nhớ.
- API kiểm tra quyền.
- API biên tập ngày và sections dành cho Editor/Admin.

Chưa có kho dữ liệu phụng vụ chính thức được nạp. Không được suy diễn ngày lễ/màu/bậc/bản văn từ ngày dân sự; chỉ publish sau khi biên tập và kiểm chứng nguồn.

## Phân quyền và dữ liệu

- Guest chỉ được đọc ngày hôm nay và các mục được đánh dấu PUBLIC_TODAY, đúng key Bài Thơ/Phúc-âm thư.
- ORDO 1962 chỉ mở entitlement ROMAN_1962.
- ORDO tiền 1955 chỉ mở entitlement PRE_1955.
- Có cả hai entitlement thì mở cả hai thư viện.
- Editor tạo/sửa, gửi duyệt; Admin mới được publish.
- Subscription, payment, entitlement và role không có mutation từ browser.
- Webhook phải xác minh chữ ký, số tiền, currency, merchant reference và event ID trước khi cập nhật quyền.

## Hiệu năng và PWA

- Server components cho shell và metadata.
- Client component chỉ cho tương tác lịch.
- API giới hạn khoảng ngày 367 ngày.
- Chỉ select trường cần thiết cho lưới lịch.
- PWA không lưu cache response chứa nội dung thành viên.
- Lighthouse >90 là tiêu chí kiểm thử mục tiêu, chưa phải kết quả đo.

## Roadmap

1. Lịch phụng vụ (đang triển khai).
2. Thánh Kinh: BibleBook/BibleVerse, bookmark, note, cross-reference.
3. Hạnh các Thánh: Saint, source, filters, calendar day.
4. Giáo lý và Quiz: Catechism tree, quiz, attempts, scores.
5. Bình ca: Hymn, MusicXML/PDF/audio, playlist.
6. Thư viện: Document, Category, private storage, editorial workflow.


## Production deploy on Vercel

This application requires a Node.js runtime. GitHub Pages cannot host App Router API routes, NextAuth callbacks or Prisma database access.

1. Import this repository into Vercel and choose branch `feature/thanh-le-missa-next-platform` for a preview deployment.
2. Add a managed PostgreSQL database (Vercel Postgres/Neon/Supabase) and set `DATABASE_URL`.
3. Set `NEXTAUTH_URL` to the Vercel URL and generate a strong `NEXTAUTH_SECRET`.
4. Configure Google OAuth redirect URL `https://<deployment-host>/api/auth/callback/google` and SMTP settings if email sign-in is enabled.
5. Apply the reviewed Prisma migrations and seed only the calendar metadata and plans. No liturgical day data is fabricated by seed.
6. Test Guest, User, Editor and Admin access; confirm private sections are not returned to Guest; verify logs and backups.
7. Only after acceptance, add the production domain and switch it to the production deployment.

Do not expose `NEXTAUTH_SECRET`, OAuth secrets, database credentials, storage service-role keys or payment secrets in client-side variables. The current repository has no production database credentials and no payment gateway configuration; membership payments must remain disabled.

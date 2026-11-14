# API Routes

Tất cả route dùng JSON và cùng origin. Các ngày theo ISO `YYYY-MM-DD`.

## Auth

- `GET/POST /api/auth/[...nextauth]`: NextAuth callback OAuth/email/session.

## Liturgical calendar

### GET `/api/liturgical/calendar?calendar=ROMAN_1962&from=2026-11-01&to=2026-11-30`

Trả metadata các ngày. Guest chỉ nhận hôm nay nếu được công khai; hội viên cần entitlement của đúng niên lịch.

### GET `/api/liturgical/day?calendar=ROMAN_1962&date=2026-11-15`

Trả chi tiết ngày. Guest chỉ nhận ngày hiện tại và các mục `PUBLIC_TODAY` có key `bai_tho` hoặc `phuc_am_thu`. Member nhận sections sau khi kiểm tra entitlement.

## Admin

### GET `/api/admin/liturgical-days?calendar=ROMAN_1962`
Danh sách 100 ngày mới nhất, Editor/Admin.

### POST `/api/admin/liturgical-days`
Tạo/cập nhật theo niên lịch + ngày. Body gồm calendar, civilDate, titleVi và trường tùy chọn title/rank/color/season, cờ Sunday/Solemnity, status.

### POST `/api/admin/liturgical-days/:dayId/sections`
Tạo section có position, sectionKey, nhãn/tham chiếu/bản văn Latin – Việt.

### PATCH/DELETE `/api/admin/liturgical-sections/:sectionId`
Sửa/xóa section.

## Lỗi

- 400: tham số/body sai.
- 403: thiếu quyền.
- 404: ngày hoặc section không tồn tại.
- 409: niên lịch chưa seed hoặc xung đột.
- 500: lỗi máy chủ; không trả secrets/stack trace.

## API kế tiếp

- `/api/bible`, `/api/saints`, `/api/catechism`, `/api/quizzes`, `/api/hymns`, `/api/documents`, `/api/membership`.

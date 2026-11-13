# Thiết lập Supabase cho Lịch Rôma

Tài liệu này mô tả bước cấu hình backend. Repository hiện vẫn phục vụ giao diện qua GitHub Pages; migration chưa tự chạy trên tài khoản Supabase nào.

## 1. Tạo project Supabase

1. Tạo project mới tại https://supabase.com/dashboard.
2. Chọn region gần người dùng chính (Singapore là lựa chọn đáng cân nhắc cho Việt Nam, nếu có trong danh sách).
3. Lưu database password ở trình quản lý mật khẩu.
4. Trong Project Settings → API, lấy Project URL và publishable/anon key.
5. Không đưa service-role key, database password, JWT secret hoặc khóa MoMo vào GitHub.

## 2. Chạy migration

Có hai cách:

### Cách A — Supabase SQL Editor

1. Mở SQL Editor trong Supabase Dashboard.
2. Mở file `supabase/migrations/20261113000100_initial_membership_liturgical_schema.sql` trong GitHub.
3. Sao chép toàn bộ SQL và chạy trong SQL Editor.
4. Kiểm tra các bảng đã tạo trong Table Editor.

### Cách B — Supabase CLI

Cài Supabase CLI theo tài liệu chính thức, đăng nhập, liên kết project rồi chạy:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Không chạy cả hai cách cho cùng một migration nếu đã áp dụng thành công bằng cách kia.

## 3. Tạo tài khoản quản trị đầu tiên

1. Đăng ký một tài khoản người dùng qua Supabase Auth.
2. Xác nhận email nếu bật email confirmation.
3. Lấy UUID người dùng từ Authentication → Users.
4. Chạy câu lệnh sau trong SQL Editor, thay UUID bằng UUID thật của tài khoản quản trị:

```sql
insert into public.user_roles(user_id, role)
values ('YOUR_AUTH_USER_UUID', 'admin')
on conflict do nothing;
```

Chỉ Admin hiện hữu mới được quản trị vai trò qua backend. Không tạo chức năng tự cấp role từ trình duyệt.

## 4. Bảng giá hiện tại

Migration đã tạo:
- ORDO 1962: 39.000 VND/tháng.
- ORDO 1962: 390.000 VND/năm.
- ORDO tiền 1955: đã có gói sản phẩm, chưa có giá.

Khi quyết định giá tiền 1955, thêm dòng tương ứng vào `public.plan_prices`. Ví dụ:

```sql
insert into public.plan_prices(plan_code, interval_unit, amount_vnd)
values ('ORDO_PRE55', 'month', YOUR_MONTHLY_PRICE_VND);
```

Giá năm có thể thêm bằng `interval_unit = 'year'`. Chỉ nhập mức giá đã được chốt.

## 5. Cấu hình frontend

GitHub Pages có thể giữ phần giao diện tĩnh. Sau khi có project Supabase, cấu hình Supabase URL và publishable/anon key trong một file cấu hình public riêng hoặc trong bước build frontend.

Publishable/anon key được thiết kế để xuất hiện ở trình duyệt khi RLS được cấu hình đúng. Service-role key tuyệt đối không được đưa vào `index.html`, `export.js`, `export.css`, `.env` public hoặc GitHub.

Các biến server-side cần lưu trong Supabase Edge Function Secrets:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MOMO_PARTNER_CODE`
- `MOMO_ACCESS_KEY`
- `MOMO_SECRET_KEY`

Tên biến MoMo chỉ là cấu hình dự kiến; chỉ thêm sau khi được MoMo cấp thông tin tích hợp chính thức. Không commit giá trị bí mật.

## 6. Kiểm tra phân quyền

Sau khi chạy migration:
- Anon: chỉ đọc metadata ngày hiện tại và các section có `is_free_today = true), với `section_key` là `bai_tho` hoặc `phuc_am_thu`.
- Tài khoản không có entitlement: không đọc được section trả phí hoặc ngày cũ.
- Entitlement 1962 còn hạn: đọc được nội dung đã xuất bản trong lịch 1962, không đọc được PRE55.
- Entitlement PRE55 còn hạn: đọc được nội dung đã xuất bản trong lịch PRE55, không đọc được 1962.
- Có cả hai entitlement: đọc được cả hai lịch.
- Editor/Admin: có thể quản lý dữ liệu theo policy; quyền tài chính/đăng ký vẫn không được cấp qua thao tác trình duyệt.

## 7. Giới hạn hiện tại

Migration là nền móng database và RLS, chưa phải hệ thống thu tiền đã hoạt động. Các phần còn phải triển khai sau khi có Supabase Project và thông tin đối tác thanh toán:
- Frontend đăng ký/đăng nhập kết nối Supabase Auth.
- API lấy dữ liệu lịch và sách lễ từ Supabase thay vì biến JavaScript công khai.
- Trang tài khoản và trạng thái gói.
- Tạo yêu cầu thanh toán, xác minh webhook có chữ ký theo tài liệu tích hợp được cấp.
- Cấp/gia hạn/thu hồi entitlement theo giao dịch xác thực.
- Trang Admin/Editor để nhập sách lễ.
- Kiểm thử RLS bằng tài khoản anon, member, editor và admin.

Không nhận thanh toán thật trước khi webhook, idempotency, hoàn tiền/hủy gia hạn và kiểm thử bảo mật hoàn tất.

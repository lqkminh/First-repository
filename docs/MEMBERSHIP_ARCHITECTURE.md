# Kiến trúc LỊCH RÔMA

## Quyết định sản phẩm

Một tài khoản có thể có hai entitlement độc lập:
- `1962` — gói ORDO 1962.
- `PRE55` — gói ORDO tiền 1955.

Free không cần subscription. Free được xem metadata ngày hiện tại và hai mục `bai_tho`, `phuc_am_thu` nếu được biên tập viên đánh dấu `is_free_today = true`.

Giá đã chốt:
- ORDO 1962: 39.000 VND/tháng.
- ORDO 1962: 390.000 VND/năm (ưu đãi 2 tháng so với trả tháng).
- ORDO tiền 1955: 69.000 VND/tháng.
- ORDO tiền 1955: 690.000 VND/năm (ưu đãi 2 tháng so với trả tháng).

## Kiến trúc

```text
Browser (GitHub Pages)
    |
    | Supabase publishable/anon key + user JWT
    v
Supabase Auth + PostgREST
    |
    +-- PostgreSQL (RLS enforced)
    |     +-- profiles / user_roles
    |     +-- plans / plan_prices
    |     +-- subscriptions / payments / entitlements
    |     +-- liturgical_calendars / liturgical_days
    |     +-- liturgical_sections / liturgical_sources
    |
    +-- Edge Functions (server-side only)
          +-- payment checkout
          +-- verified payment webhook
          +-- subscription lifecycle
          +-- privileged content/admin operations
```

GitHub Pages chỉ phục vụ giao diện. Nội dung trả phí không được nhúng vào JavaScript tĩnh hoặc tệp JSON công khai.

## Các bảng cốt lõi

| Bảng | Chức năng |
|---|---|
| profiles | Hồ sơ tài khoản |
| user_roles | member, editor, admin |
| liturgical_calendars | 1962 và PRE55 |
| plans | ORDO_1962, ORDO_PRE55 |
| plan_prices | Giá tháng/năm |
| subscriptions | Đăng ký định kỳ |
| payments | Giao dịch đã ghi nhận |
| payment_webhook_events | Idempotency và log webhook |
| entitlements | Quyền truy cập thật, có hạn |
| liturgical_days | Metadata từng ngày trong từng lịch |
| liturgical_sections | Các phần Latin – Việt theo thứ tự |
| liturgical_sources | Ấn bản, trang, nguồn văn bản |
| audit_logs | Nhật ký thao tác quản trị |

## Quy tắc nội dung

`liturgical_days` nhận diện một ngày bằng `calendar_code + civil_date`. Vì vậy 15/11/2026 của 1962 và 15/11/2026 của PRE55 là hai bản ghi độc lập.

`liturgical_sections` lưu các mục theo `position`, ví dụ:
- introitus
- oratio
- bai_tho
- graduale
- alleluia
- phuc_am_thu
- offertorium
- secreta
- praefatio
- communio
- postcommunio

Mỗi section lưu riêng `label_la`, `label_vi`, `reference_la`, `reference_vi`, `text_la`, `text_vi`. Cả modal, PDF và Word phải dùng cùng một danh sách có thứ tự.

## Mô hình quyền

- Public: ngày hiện tại và section được đánh dấu miễn phí, chỉ với `bai_tho` hoặc `phuc_am_thu`.
- ORDO_1962: mọi nội dung đã xuất bản có `calendar_code = '1962'`.
- ORDO_PRE55: mọi nội dung đã xuất bản có `calendar_code = 'PRE55'`.
- Cả hai entitlement: đọc được cả hai lịch.
- Editor/Admin: biên tập nội dung.
- Subscription, payment, webhook, entitlement và role không có policy ghi từ browser. Chỉ backend tin cậy/service role mới được cập nhật.

## Các nguyên tắc bảo mật

1. RLS bật trên toàn bộ bảng nghiệp vụ.
2. Browser không bao giờ giữ service-role key hoặc MoMo secret.
3. Không cấp entitlement dựa trên query string, localStorage hay thông báo thành công phía client.
4. Webhook phải xác thực chữ ký, đối chiếu amount/currency/user/subscription, lưu event idempotently rồi mới cấp quyền.
5. User chỉ đọc hồ sơ, giao dịch, đăng ký và entitlement của chính mình.
6. Không thể ngăn tuyệt đối chụp màn hình; watermark và giới hạn phiên chỉ là biện pháp giảm chia sẻ trái phép.

## Trạng thái triển khai

Đã commit migration SQL nền tảng và RLS vào repository. Chưa có Supabase project credentials trong repository/session này, vì vậy chưa thể chạy migration trên database thực hoặc chuyển website hiện tại sang API. Hướng dẫn: `docs/SETUP_SUPABASE.md`.

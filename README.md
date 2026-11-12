# Ordo Romanus — Calendarium Liturgicum

Lịch phụng vụ Rôma truyền thống 1962, trình bày song ngữ Latin – Việt.

## Chạy website
Mở trực tiếp `index.html` bằng trình duyệt hiện đại. Website sử dụng HTML, CSS và JavaScript thuần; không cần backend hoặc bước build.

## Chức năng lịch
- Lịch tháng, tuần bắt đầu từ Thứ Hai.
- Chuyển tháng trước/sau và trở về hôm nay.
- Đánh dấu ngày hiện tại và ngày đã có dữ liệu.
- Bấm ngày để mở hộp thoại Proprium Missae.
- Đóng hộp thoại bằng nút, bấm nền ngoài hoặc phím Esc.

## Xuất file (Export the Mass)
Trong modal chi tiết ngày, chọn **Xuất file** để mở hộp thoại xuất:
- **PDF**: khổ A4, A5 hoặc A5 booklet.
- **Word (DOCX)**: khổ A4 hoặc A5; A5 booklet bị vô hiệu hóa với Word.
- PDF booklet: tạo nội dung A5 trước, sau đó dùng pdf-lib dàn hai trang A5 lên mỗi mặt A4 ngang. Với N là số trang sau khi đệm lên bội số 4, mỗi tờ được sắp:
  - Mặt trước: [N, 1], [N-2, 3], ...
  - Mặt sau: [2, N-1], [4, N-3], ...
  In hai mặt theo cạnh ngắn, gấp giữa và đóng ghim để thành tập A5.
- Tệp được tạo ngay trên trình duyệt, không gửi bản văn lên máy chủ.
- Tên file: `SachLe_[TenNgay]_[YYYY-MM-DD]_[KhoGiay].[pdf|docx]`.

### Thư viện trình duyệt
Các thư viện được tải từ CDN (vì vậy cần kết nối Internet khi xuất file):
- pdfmake + VFS Roboto: PDF và font Unicode.
- pdf-lib: ghép/dàn trang PDF booklet.
- docx: tạo file Word DOCX.

## Dữ liệu
Dữ liệu mẫu hiện được khai báo trong đối tượng `ORDO_DATA` ở cuối `index.html`. Thêm ngày mới bằng khóa `YYYY-MM-DD`, ví dụ:

```js
"2026-12-25": {
  title_vi: "Đại lễ Giáng Sinh",
  title_la: "In Nativitate Domini",
  rank: "I classis",
  color: "Trắng · Albus",
  season: "Tempus Nativitatis",
  solemnity: true,
  readings: [
    {
      label_vi: "Bài đọc 1",
      label_la: "Lectio I",
      reference_vi: "Tham chiếu tiếng Việt",
      reference_la: "Tham chiếu Latinh",
      text_vi: "Bản văn tiếng Việt...",
      text_la: "Textus Latinus..."
    }
  ],
  prayers: [
    {
      label_vi: "Lời nguyện",
      label_la: "Oratio",
      reference_vi: "Lời nguyện riêng",
      reference_la: "Oratio propria",
      text_vi: "Bản văn lời nguyện tiếng Việt...",
      text_la: "Textus Orationis..."
    }
  ]
}
```

Các mục `readings` và `prayers` được ghép theo thứ tự: cùng một phần tử trong mảng sẽ nằm cùng hàng trong hai cột Latin và Việt. Nếu thiếu một ngôn ngữ, cột đó hiển thị `—`. Cấu trúc cũ có `label`, `reference`, `text` vẫn được hỗ trợ ở mức tương thích cơ bản.

## Mã nguồn
- `index.html`: giao diện lịch và modal chi tiết.
- `export.css`: giao diện modal Xuất File.
- `export.js`: tạo PDF/DOCX, xử lý tên file và dàn trang booklet.

## Lưu ý phụng vụ
Những ngày hiện được đánh dấu `demo: true` chỉ là dữ liệu minh họa để thử chức năng. Bản văn, thứ bậc, màu lễ và lịch riêng phải được đối chiếu với Missale Romanum 1962 và nguồn có thẩm quyền trước khi đưa vào sử dụng chính thức.

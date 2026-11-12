# Ordo Romanus — Calendarium Liturgicum

Lịch phụng vụ Rôma truyền thống 1962, trình bày song ngữ Latinh – Việt.

## Chạy website
Mở trực tiếp `index.html` bằng trình duyệt hiện đại. Website sử dụng HTML, CSS và JavaScript thuần; không cần backend hoặc bước build. Khi xuất PDF/Word cần kết nối Internet để tải các thư viện phía trình duyệt.

## Lịch và cửa sổ chi tiết ngày
- Lịch tháng, tuần bắt đầu từ Thứ Hai.
- Chuyển tháng trước/sau và trở về hôm nay.
- Đánh dấu ngày hiện tại và ngày đã có dữ liệu.
- Bấm ngày để mở một luồng cuộn liên tục, hiển thị các mục Latinh và Việt song song.
- Không tách nội dung thành hai nhóm “Proper” và “Orationes”.
- Các mục được sắp theo thứ tự phụng vụ: Introitus, Oratio, Bài Thánh Thư/Bài đọc, Graduale, Alleluia, Evangelium, Offertorium, Secreta, Praefatio, Communio, Postcommunio.
- Dữ liệu cũ dùng `readings` và `prayers` được ghép và phân loại theo nhãn để giữ tương thích.

## Xuất file
Trong modal chi tiết ngày, chọn **Xuất file**:
- PDF: A4, A5 hoặc A5 booklet.
- Word (DOCX): A4 hoặc A5; Word không hỗ trợ A5 booklet.
- PDF và Word dùng cùng một danh sách nội dung theo đúng thứ tự; không thêm tiêu đề nhóm Proper/Orationes.
- Nội dung đặt song song: Latinh bên trái, Tiếng Việt bên phải.
- PDF dùng Noto Serif (phông serif có bộ ký tự Vietnamese), tải qua URL và được pdfmake nhúng vào PDF đầu ra. Phông Noto Serif được phát hành theo SIL Open Font License (OFL).
- Word dùng Times New Roman.
- PDF có cỡ chữ nội dung khoảng 11 pt và tiêu đề khoảng 16 pt; A5 có thể điều chỉnh nhỏ hơn đôi chút.
- Tên file PDF: `SachLe_YYYY-MM-DD.pdf`; Word: `SachLe_YYYY-MM-DD.docx`.
- Booklet: tạo nội dung A5 trước, rồi dàn các trang A5 lên tờ A4 ngang. Tổng số trang được đệm lên bội số của 4; mỗi tờ theo cặp mặt trước [trang cuối, trang 1], mặt sau [trang 2, trang kế cuối]... In hai mặt theo cạnh ngắn, gấp và đóng ghim.
- Các thư viện chạy phía trình duyệt: pdfmake, pdf-lib và docx. Không cần backend.

## Cấu trúc dữ liệu sách lễ
Dữ liệu mới dùng `sections` — một mảng duy nhất chứa mọi phần riêng và lời nguyện:

```js
"2026-12-25": {
  title_vi: "Đại lễ Giáng Sinh",
  title_la: "In Nativitate Domini",
  rank: "I classis",
  color: "Trắng · Albus",
  season: "Tempus Nativitatis",
  solemnity: true,
  sections: [
    {
      order: 0,
      label_vi: "Ca đầu lễ",
      label_la: "Introitus",
      reference_vi: "Tham chiếu tiếng Việt",
      reference_la: "Tham chiếu Latinh",
      text_vi: "Bản văn tiếng Việt...",
      text_la: "Textus Latinus..."
    },
    {
      order: 1,
      label_vi: "Kinh tổng nguyện",
      label_la: "Oratio",
      reference_vi: "Lời nguyện riêng",
      reference_la: "Oratio propria",
      text_vi: "Bản văn lời nguyện tiếng Việt...",
      text_la: "Textus Orationis..."
    },
    {
      order: 2,
      label_vi: "Bài Thánh Thư",
      label_la: "Lectio Epistolæ",
      reference_vi: "Tham chiếu tiếng Việt",
      reference_la: "Tham chiếu Latinh",
      text_vi: "Bản văn tiếng Việt...",
      text_la: "Textus Latinus..."
    }
  ]
}
```

`order` là tùy chọn nhưng nên khai báo để giữ đúng thứ tự khi có nhiều mục. Nếu không có `order`, ứng dụng sẽ suy ra thứ tự từ các nhãn phụng vụ. Một mục thiếu một ngôn ngữ sẽ hiển thị dấu `—` ở cột tương ứng.

Các mục `sections` được dùng chung cho modal, PDF và DOCX. Dữ liệu cũ `readings` và `prayers` vẫn được hỗ trợ và tự động hợp thành một danh sách.

## Mã nguồn
- `index.html`: giao diện lịch, dữ liệu mẫu, modal và sắp xếp mục phụng vụ.
- `export.css`: giao diện modal Xuất File.
- `export.js`: tạo PDF/DOCX, nhúng font PDF, xử lý booklet và tải file.

## Lưu ý phụng vụ
Các ngày mẫu hiện được đánh dấu `demo: true` chỉ là dữ liệu minh họa. Bản văn, thứ bậc, màu lễ và lịch riêng cần được đối chiếu với Missale Romanum 1962 và nguồn có thẩm quyền trước khi đưa vào sử dụng chính thức.

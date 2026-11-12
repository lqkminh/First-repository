# Ordo Romanus — Calendarium Liturgicum

Lịch phụng vụ Rôma truyền thống 1962, trình bày song ngữ Latin – Việt.

## Chạy website
Mở trực tiếp `index.html` bằng trình duyệt hiện đại. Website sử dụng HTML, CSS và JavaScript thuần; không cần backend hoặc bước build.

## Chức năng
- Lịch tháng, tuần bắt đầu từ Thứ Hai.
- Chuyển tháng trước/sau và trở về hôm nay.
- Đánh dấu ngày hiện tại và ngày đã có dữ liệu.
- Bấm ngày để mở hộp thoại Proprium Missae.
- Đóng hộp thoại bằng nút, bấm nền ngoài hoặc phím Esc.
- Giao diện responsive cho máy tính và điện thoại.

## Dữ liệu
Dữ liệu mẫu hiện được khai báo trong đối tượng `ORDO_DATA` ở cuối `index.html`. Thêm ngày bằng khóa `YYYY-MM-DD`, ví dụ:

```js
"2026-12-25": {
  titleVi: "Đại lễ Giáng Sinh",
  titleLatin: "In Nativitate Domini",
  rank: "I classis",
  color: "Trắng · Albus",
  season: "Tempus Nativitatis",
  solemnity: true,
  readings: [
    { label: "Epistola · Bài Thánh Thư", reference: "tham chiếu", text: "Bản văn Latin / Việt..." },
    { label: "Evangelium · Phúc Âm", reference: "tham chiếu", text: "Bản văn Latin / Việt..." }
  ],
  prayers: [
    { label: "Oratio · Lời nguyện", reference: "Collecta", text: "Bản văn..." }
  ]
}
```

Các mục hiện tại là **dữ liệu minh họa để thử giao diện**, chưa phải bản văn đã kiểm chứng theo Missale Romanum 1962. Hãy đối chiếu sách lễ và lịch riêng có thẩm quyền trước khi đưa vào sử dụng phụng vụ.

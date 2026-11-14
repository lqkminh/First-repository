# Nguồn dữ liệu và bản quyền

## Divinum Officium

- Repository: https://github.com/DivinumOfficium/divinum-officium
- Upstream README mô tả dữ liệu Mass và Office trong `web/www/missa/` và `web/www/horas/`, chia thư mục ngôn ngữ; tệp UTF-8 được phân đoạn bằng heading trong ngoặc vuông.
- Repository công bố giấy phép MIT. Khi phân phối bản sao hoặc phần đáng kể, giữ thông báo bản quyền và giấy phép.
- Đây không phải REST API công khai trong ứng dụng. Adapter chỉ phân tích file sau khi nhập; không tự động crawl hay tự động publish.
- Mỗi lần nhập phải lưu source path, edition, language, attribution/license và qua bước kiểm duyệt.

## Thánh Kinh và Giáo lý

Vulgata, bản dịch Việt, CCC và tài liệu giáo lý phải được kiểm tra theo ấn bản và quyền sử dụng cụ thể. Không giả định bản dịch hiện đại là public domain. Lưu translationCode, license và sourceUrl.

## Thánh nhạc và thư viện

Tác phẩm, bản phối, bản in và bản thu âm có thể có quyền khác nhau. Chỉ phát audio, cấp file MusicXML/PDF hoặc cho tải offline khi có giấy phép, quyền sở hữu hoặc public domain đã xác minh.

## Biên tập

1. Editor nhập nội dung và nguồn.
2. Lưu Draft hoặc In Review.
3. Admin kiểm tra bản văn, thứ tự, nguồn, bản quyền và dữ liệu phụng vụ.
4. Admin publish.
5. API chỉ trả nội dung đã publish theo entitlement.

## MIT notice

Giữ notice sau khi phân phối phần mềm/dữ liệu MIT từ Divinum Officium:

```text
MIT License

Copyright (c) Divinum Officium contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

Kiểm tra upstream LICENSE trước từng lần phát hành.

# Module Chunker (`app/chunker.py`)

## Mục đích

Chuyển raw text dài thành nhiều đoạn nhỏ (chunks) có overlap và metadata để:

- embedding hiệu quả hơn,
- retrieval chính xác hơn,
- giữ được ngữ cảnh section khi build prompt.

## Các hàm chính

- `_normalize(text)`: chuẩn hóa whitespace/newline.
- `_is_section_header(line)`: nhận diện tiêu đề section qua regex.
- `_contains_formula(text)`: phát hiện công thức/đơn vị khoa học.
- `_make_chunk(...)`: tạo object `Chunk`.
- `chunk_text(...)`: hàm chính dùng ở `/ingest`.

## Thuật toán `chunk_text()` (chi tiết)

Input:
- `text`
- `chunk_size` (mặc định `DEFAULT_CHUNK_SIZE = 500` từ config)
- `overlap` (mặc định `DEFAULT_OVERLAP = 50`)
- `source_name`

Các bước:

1. **Guard**
   - Nếu text rỗng/blank -> trả `[]`.

2. **Normalize**
   - convert line ending về `\n`,
   - gom nhiều space/tab,
   - giới hạn blank line tối đa 2.

3. **Tách paragraph**
   - split theo `\n\n+`.

4. **Duyệt từng paragraph**
   - nếu paragraph là section header -> cập nhật `current_section`.
   - tính số từ paragraph.

5. **Case paragraph quá lớn**
   - nếu paragraph > `chunk_size`:
     - flush buffer hiện tại (nếu có),
     - split paragraph bằng sliding window word-based,
     - bước nhảy: `chunk_size - overlap`.

6. **Case overflow buffer**
   - nếu thêm para vào vượt chunk_size:
     - flush chunk cũ,
     - lấy overlap text từ chunk cũ,
     - mở buffer mới: `[overlap_text, para]`.

7. **Flush cuối**
   - còn buffer thì đóng chunk cuối.

8. **Fallback**
   - nếu vì lý do nào đó chưa tạo chunk nào, split toàn văn bản theo word window.

Output:
- `List[Chunk]` có field:
  - `content`, `chunk_index`, `word_count`, `has_chemistry`, `section`, `source`.

## Regex quan trọng

- Header patterns:
  - Markdown title `#`
  - dạng đánh số (`1. ...`, `IV. ...`)
  - từ khóa `Chương`, `Bài`, `Phần`
  - dòng ALL CAPS.
- Formula patterns:
  - công thức kiểu `H2SO4`, `Ca(OH)2`
  - biểu thức có mũi tên/đẳng thức
  - đơn vị `mol`, `kJ`, `kPa`, `eV`, `pH`, ...

## Vai trò metadata từ chunk

- `section`: giúp context dễ đọc hơn khi gửi sang LLM.
- `has_chemistry`: có thể dùng cho routing/prompt tuning trong tương lai.
- `word_count`: thống kê chất lượng chunk và ingest.

## Ghi chú cho người mới Python

- Nested function `flush()` và `make_overlap()` được dùng để tái sử dụng logic bên trong `chunk_text()`.
- `nonlocal chunk_index` cho phép tăng biến `chunk_index` ở scope ngoài.

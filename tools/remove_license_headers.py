import os
import re
import fnmatch

EXCLUDE_DIRS = {
    'node_modules', 'build', 'dist', 'target', 'out', '.git', '.idea',
    '.gradle', '__pycache__'
}

EXCLUDE_PATTERNS = ['*.min.css', '*.min.js']

# Định nghĩa Regex để bắt chính xác các khối giấy phép do script cũ tạo ra
LICENSE_PATTERNS = [
    # Dành cho Java, TS, JS, CSS (/* ... */, /** ... */, hoặc /*! ... */)
    re.compile(r"/\*[\s\S]*?Copyright[\s\S]*?Licensed under the Apache License[\s\S]*?\*/\s*", re.IGNORECASE),
    
    # Dành cho XML, HTML, Markdown ()
    re.compile(r"\s*", re.IGNORECASE),
    
    # Dành cho Python, YAML (# ...)
    re.compile(r"(?:#\s*Copyright.*?\n)(?:#\s*Licensed under the Apache License.*?\n)(?:#\s*http://www.apache.org/licenses/LICENSE-2.0.*?\n)\s*", re.IGNORECASE)
]

def should_skip_file(filename):
    return any(fnmatch.fnmatch(filename, p) for p in EXCLUDE_PATTERNS)

def remove_license_header(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"[LỖI] Không thể đọc {path}: {e}")
        return

    original_content = content
    shebang = ""
    
    # Giữ lại dòng shebang nếu có (ví dụ: #!/usr/bin/env python)
    if content.startswith("#!"):
        lines = content.split('\n', 1)
        shebang = lines[0] + '\n'
        content = lines[1] if len(lines) > 1 else ""

    # Tìm và xóa khối giấy phép ở ngay đầu file
    for pattern in LICENSE_PATTERNS:
        match = pattern.search(content)
        # Chỉ xóa nếu khối giấy phép nằm ở ngay đầu file (tránh xóa nhầm text bên trong file)
        if match and match.start() == 0:
            content = pattern.sub("", content, count=1)
            break

    new_content = shebang + content

    if new_content != original_content:
        try:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"[OK] Đã gỡ header: {path}")
        except Exception as e:
            print(f"[LỖI] Không thể ghi {path}: {e}")

def walk_and_clean(root):
    for dirpath, dirnames, filenames in os.walk(root):
        # Bỏ qua các thư mục không cần thiết
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]

        for filename in filenames:
            if should_skip_file(filename):
                continue

            full_path = os.path.join(dirpath, filename)
            remove_license_header(full_path)

if __name__ == "__main__":
    # Chạy script tại thư mục hiện tại
    print("Bắt đầu quét và gỡ bỏ header giấy phép...")
    walk_and_clean(".")
    print("Hoàn tất!")
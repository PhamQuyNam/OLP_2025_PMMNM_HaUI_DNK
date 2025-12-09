
#   BẢN QUYỀN GỐC:
#   Copyright (c) 2025 Haui.HIT - H2K
#   Mã nguồn này được sử dụng theo các điều khoản của Giấy phép Apache 2.0.
#   Xem: https://github.com/Haui-HIT-H2K/Ldx-Insight/blob/main/LICENSE

#   BẢN QUYỀN SỬA ĐỔI
#   Copyright 2025 by HaUI.DNK
#   Licensed under the Apache License, Version 2.0
#   http://www.apache.org/licenses/LICENSE-2.0

import os
import argparse
import fnmatch
import re

EXT_MAP = {
    ('.java', '.kt'): 'java',
    ('.ts', '.tsx', '.js', '.jsx'): 'ts',
    ('.css', '.scss'): 'css',
    ('.xml', '.html'): 'xml',
    ('.yml', '.yaml'): 'yaml',
    ('.md', '.mdx'): 'md',
    ('.py',): 'py'
}

EXCLUDE_DIRS = {
    'node_modules', 'build', 'dist', 'target', 'out', '.git', '.idea',
    '.gradle', '__pycache__'
}

EXCLUDE_PATTERNS = ['*.min.css', '*.min.js']

# =============================
# Header templates per language
# =============================
def with_spdx(block):
    return block

def header_java(owner, year, spdx):
    block = f"""/*
 * Copyright {year} {owner}
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"""
    return with_spdx(block) if spdx else block

def header_ts(owner, year, spdx):
    block = f"""/**
 * Copyright {year} {owner}
 *
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
 */
"""
    return with_spdx(block) if spdx else block

def header_css(owner, year, spdx):
    block = f"""/*!
 * Copyright {year} {owner}
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 */
"""
    return with_spdx(block) if spdx else block

def header_xml(owner, year, spdx):
    block = f"""<!--
  Copyright {year} {owner}
  Licensed under the Apache License, Version 2.0
  http://www.apache.org/licenses/LICENSE-2.0
-->
"""
    return with_spdx(block) if spdx else block

def header_yaml(owner, year, spdx):
    block = f"""# Copyright {year} {owner}
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0
"""
    return with_spdx(block) if spdx else block

def header_md(owner, year, spdx):
    block = f"""<!--
  Copyright {year} {owner}
  Licensed under the Apache License, Version 2.0
  http://www.apache.org/licenses/LICENSE-2.0
-->
"""
    return with_spdx(block) if spdx else block

def header_py(owner, year, spdx):
    block = f"""# Copyright {year} {owner}
# Licensed under the Apache License, Version 2.0
# http://www.apache.org/licenses/LICENSE-2.0
"""
    return with_spdx(block) if spdx else block

HEADER_GENERATORS = {
    'java': header_java,
    'ts': header_ts,
    'css': header_css,
    'xml': header_xml,
    'yaml': header_yaml,
    'md': header_md,
    'py': header_py
}

# =============================
# Helpers
# =============================
LICENSE_REGEX = re.compile(
    r"(Copyright\s+\d{4})|(Licensed under the Apache License)",
    re.IGNORECASE
)

def get_type_by_extension(ext):
    for exts, group in EXT_MAP.items():
        if ext in exts:
            return group
    return None

def should_skip_file(filename):
    return any(fnmatch.fnmatch(filename, p) for p in EXCLUDE_PATTERNS)

def has_existing_header(content):
    first_25 = "\n".join(content.splitlines()[:25])
    return bool(LICENSE_REGEX.search(first_25))

# =============================
# File processing
# =============================
def process_file(path, header):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"[ERROR] Cannot read {path}: {e}")
        return

    if has_existing_header(content):
        print(f"[SKIP] Has header: {path}")
        return

    lines = content.splitlines(keepends=True)

    # Preserve shebang (#!/usr/bin/env python3)
    if lines and lines[0].startswith("#!"):
        new_content = lines[0] + header + "".join(lines[1:])
    else:
        new_content = header + content

    try:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"[OK] Added header: {path}")
    except Exception as e:
        print(f"[ERROR] Cannot write {path}: {e}")

# =============================
# Walk directories
# =============================
def walk_and_apply(root, year, owner, spdx):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]

        for filename in filenames:
            if should_skip_file(filename):
                continue

            ext = os.path.splitext(filename)[1]
            group = get_type_by_extension(ext)
            if not group:
                continue

            header = HEADER_GENERATORS[group](owner, year, spdx)
            full_path = os.path.join(dirpath, filename)
            process_file(full_path, header)

# =============================
# Main CLI
# =============================
def main():
    parser = argparse.ArgumentParser(description="Auto insert Apache-2.0 headers")
    parser.add_argument('--root', default='.', help='Root folder to scan')
    parser.add_argument('--year', required=True, help='Copyright year')
    parser.add_argument('--owner', required=True, help='Owner name')
    parser.add_argument('--spdx', action='store_true', help='Insert SPDX ID')
    args = parser.parse_args()

    walk_and_apply(args.root, args.year, args.owner, args.spdx)

if __name__ == '__main__':
    main()

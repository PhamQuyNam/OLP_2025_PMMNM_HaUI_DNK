import os
import fnmatch

EXCLUDE_DIRS = {'node_modules', '.git', 'dist', 'build', 'out', 'target'}

def should_skip_file(filename):
    return fnmatch.fnmatch(filename, "*.min.js") or fnmatch.fnmatch(filename, "*.min.css")

def remove_spdx_from_file(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Cannot read {path}: {e}")
        return

    new_lines = [line for line in lines if TARGET_KEYWORD not in line]

    if lines != new_lines:
        try:
            with open(path, "w", encoding="utf-8") as f:
                f.writelines(new_lines)
            print(f"Removed SPDX line: {path}")
        except Exception as e:
            print(f"Cannot write {path}: {e}")

def walk_and_clean(root):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for filename in filenames:
            if should_skip_file(filename):
                continue

            full_path = os.path.join(dirpath, filename)
            remove_spdx_from_file(full_path)

if __name__ == "__main__":
    walk_and_clean(".")

#!/usr/bin/env python3
"""
Convert quiz JS files to questions.json

Sources:
  quiz-data.js          → source: "quiz"      (小テスト)
  quiz-kakomon.js       → source: "kakomon"   (過去問)
  quiz-predicted-s1.js  → source: "predicted" (予想問題)
  quiz-predicted-s2.js  → source: "predicted" (予想問題)
"""
import re
import json
import os

SRC_DIR = os.environ.get('QUIZ_SRC_DIR') or os.path.join(os.path.dirname(__file__), '../../スペイン語')
OUT_PATH = os.path.join(os.path.dirname(__file__), '../src/data/questions.json')

PAGE_RE = re.compile(r"Spanish(\d)_lesson(\d+)\.html")


def find_matching_brace(text, start, open_c='{', close_c='}'):
    depth = 0
    in_string = False
    string_char = None
    i = start
    while i < len(text):
        c = text[i]
        if in_string:
            if c == '\\' and i + 1 < len(text):
                i += 2
                continue
            if c == string_char:
                in_string = False
        elif c in ('"', "'"):
            in_string = True
            string_char = c
        elif c == open_c:
            depth += 1
        elif c == close_c:
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return -1


def extract_js_string(text, start):
    if start >= len(text) or text[start] not in ('"', "'"):
        return None, start
    quote = text[start]
    i = start + 1
    chars = []
    while i < len(text):
        c = text[i]
        if c == '\\' and i + 1 < len(text):
            nc = text[i + 1]
            esc = {'n': '\n', 't': '\t', 'r': '\r', "'": "'", '"': '"',
                   '\\': '\\', '/': '/', 'u': None}
            if nc == 'u' and i + 5 < len(text):
                chars.append(chr(int(text[i+2:i+6], 16)))
                i += 6
                continue
            chars.append(esc.get(nc, nc))
            i += 2
            continue
        if c == quote:
            return ''.join(chars), i + 1
        chars.append(c)
        i += 1
    return ''.join(chars), i


def extract_objects_from_array(array_text):
    text = array_text.strip()
    if text.startswith('['):
        text = text[1:]
    if text.endswith(']'):
        text = text[:-1]

    objects = []
    i = 0
    while i < len(text):
        c = text[i]
        if c == '{':
            end = find_matching_brace(text, i)
            if end == -1:
                break
            objects.append(text[i:end+1])
            i = end + 1
        else:
            i += 1
    return objects


def get_field(obj_text, field):
    pattern = re.compile(rf'\b{re.escape(field)}\s*:\s*([\'"])', re.DOTALL)
    m = pattern.search(obj_text)
    if not m:
        return None
    val, _ = extract_js_string(obj_text, m.start(1))
    return val


def get_bool_field(obj_text, field):
    m = re.search(rf'\b{re.escape(field)}\s*:\s*(true|false)', obj_text)
    return m is not None and m.group(1) == 'true'


def parse_fill(t_html):
    blanks = re.findall(r'data-a="([^"]+)"', t_html)
    spanish = re.sub(r'<span class="qz-b" data-a="[^"]+"></span>', '___', t_html)
    spanish = re.sub(r'<span[^>]*class="qz-hint"[^>]*>.*?</span>', '', spanish)
    spanish = re.sub(r'<[^>]+>', '', spanish)
    spanish = re.sub(r'\s+', ' ', spanish).strip()
    full = re.sub(r'<span class="qz-b" data-a="([^"]+)"></span>', r'(\1)', t_html)
    full = re.sub(r'<span[^>]*class="qz-hint"[^>]*>.*?</span>', '', full)
    full = re.sub(r'<[^>]+>', '', full)
    full = re.sub(r'\s+', ' ', full).strip()
    return blanks, spanish, full


def make_id(prefix, series, lesson, idx):
    return f"{prefix}{series}l{lesson}_{idx:03d}"


def parse_page_block(page_name, block_text, source, id_prefix='s'):
    m = PAGE_RE.match(page_name)
    if not m:
        return []

    series = m.group(1)
    lesson = int(m.group(2))
    chapter = f"{series}列"

    # For quiz source, adminOnly blocks become predicted
    effective_source = source
    if source == 'quiz' and get_bool_field(block_text, 'adminOnly'):
        effective_source = 'predicted'

    sm = re.search(r'\bsections\s*:\s*\[', block_text)
    if not sm:
        return []

    arr_start = block_text.index('[', sm.start())
    arr_end = find_matching_brace(block_text, arr_start, '[', ']')
    if arr_end == -1:
        return []

    sections_text = block_text[arr_start:arr_end+1]
    section_blocks = extract_objects_from_array(sections_text)

    questions = []
    idx = 1

    for sec_block in section_blocks:
        heading = get_field(sec_block, 'heading') or ''
        theme = re.sub(r'^\d+\.\s*', '', heading).strip()
        if not theme:
            theme = '穴埋め' if series == '1' else '和文西訳'

        im = re.search(r'\bitems\s*:\s*\[', sec_block)
        if not im:
            continue

        items_arr_start = sec_block.index('[', im.start())
        items_arr_end = find_matching_brace(sec_block, items_arr_start, '[', ']')
        if items_arr_end == -1:
            continue

        items_text = sec_block[items_arr_start:items_arr_end+1]
        item_blocks = extract_objects_from_array(items_text)

        for item_block in item_blocks:
            t = get_field(item_block, 't')
            ja = get_field(item_block, 'ja')
            a = get_field(item_block, 'a')
            exp = get_field(item_block, 'exp')

            if not ja:
                continue

            q = {
                "id": make_id(id_prefix, series, lesson, idx),
                "chapter": chapter,
                "lesson": lesson,
                "theme": theme,
                "ja": ja,
                "source": effective_source,
            }

            if t:
                blanks, spanish, full_text = parse_fill(t)
                q["type"] = "fill"
                q["spanish"] = spanish
                q["blanks"] = blanks
                q["fullText"] = full_text
            elif a:
                q["type"] = "compose"
                q["answer"] = a
            else:
                continue

            if exp:
                q["exp"] = exp

            questions.append(q)
            idx += 1

    return questions


def extract_pages_from_main_object(content, var_name='QUIZ_DATA'):
    pages = {}
    m = re.search(rf'var\s+{re.escape(var_name)}\s*=\s*\{{', content)
    if not m:
        return pages

    main_start = content.index('{', m.start())
    main_end = find_matching_brace(content, main_start)
    if main_end == -1:
        return pages

    inner = content[main_start+1:main_end]
    pattern = re.compile(r"'(Spanish\d_lesson\d+\.html)'\s*:\s*\{")
    for pm in pattern.finditer(inner):
        page_name = pm.group(1)
        brace_pos = inner.index('{', pm.start())
        brace_end = find_matching_brace(inner, brace_pos)
        if brace_end != -1:
            pages[page_name] = inner[brace_pos:brace_end+1]

    return pages


def extract_pages_from_assignments(content, var_name='QUIZ_DATA'):
    pages = {}
    pattern = re.compile(rf"{re.escape(var_name)}\['(Spanish\d_lesson\d+\.html)'\]\s*=\s*\{{")
    for m in pattern.finditer(content):
        page_name = m.group(1)
        brace_pos = content.index('{', m.start())
        brace_end = find_matching_brace(content, brace_pos)
        if brace_end != -1:
            pages[page_name] = content[brace_pos:brace_end+1]
    return pages


def main():
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

    all_questions = []

    # (js_path, source, var_name, id_prefix)
    files = [
        (os.path.join(SRC_DIR, 'quiz-data.js'),         'quiz',      'QUIZ_DATA',    's'),
        (os.path.join(SRC_DIR, 'quiz-kakomon.js'),       'kakomon',   'QUIZ_KAKOMON', 'k'),
        (os.path.join(SRC_DIR, 'quiz-predicted-s1.js'),  'predicted', 'QUIZ_DATA',    's'),
        (os.path.join(SRC_DIR, 'quiz-predicted-s2.js'),  'predicted', 'QUIZ_DATA',    's'),
    ]

    for js_path, source, var_name, id_prefix in files:
        if not os.path.exists(js_path):
            print(f"  SKIP (not found): {js_path}")
            continue
        with open(js_path, encoding='utf-8') as f:
            content = f.read()

        pages = {}
        pages.update(extract_pages_from_main_object(content, var_name))
        pages.update(extract_pages_from_assignments(content, var_name))

        label = {'quiz': '小テスト', 'kakomon': '過去問', 'predicted': '予想問題'}[source]
        print(f"\n[{label}] {os.path.basename(js_path)}")
        for page_name in sorted(pages):
            questions = parse_page_block(page_name, pages[page_name], source, id_prefix)
            all_questions.extend(questions)
            print(f"  {page_name}: {len(questions)} questions")

    print(f"\n総問題数: {len(all_questions)}")
    by_source = {}
    for q in all_questions:
        by_source[q['source']] = by_source.get(q['source'], 0) + 1
    for k, v in sorted(by_source.items()):
        label = {'quiz': '小テスト', 'kakomon': '過去問', 'predicted': '予想問題'}.get(k, k)
        print(f"  {label}: {v}問")

    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump({"questions": all_questions}, f, ensure_ascii=False, indent=2)

    print(f"\n出力: {OUT_PATH}")


if __name__ == '__main__':
    main()

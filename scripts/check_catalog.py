"""Validate the navigation catalog with Python's standard library."""
import json
import re
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'catalog.json').read_text())
seen_projects = set()
count = 0

def check_path(base, value):
    assert isinstance(value, str) and value, 'Missing path'
    url = urlsplit(value)
    assert not url.scheme and not url.netloc, f'Unsafe path: {value}'
    target = (base / url.path).resolve()
    assert not Path(url.path).is_absolute() and target.is_relative_to(base.resolve()), f'Unsafe path: {value}'
    assert target.is_file(), f'Missing entry: {target}'

for project in data['projects']:
    pid = project['id']
    assert re.fullmatch(r'[0-9]{2}-[a-z0-9]+(?:-[a-z0-9]+)*', pid), pid
    assert pid not in seen_projects, f'Duplicate project: {pid}'
    seen_projects.add(pid)
    assert project['name'].strip()
    seen = set()
    for item in project['prototypes']:
        iid = item['id']
        assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', iid), iid
        assert iid not in seen, f'Duplicate prototype: {iid}'
        seen.add(iid)
        assert item['name'].strip()
        assert re.fullmatch(r'\d{4}-\d{2}-\d{2}', item['updatedAt'])
        date.fromisoformat(item['updatedAt'])
        base = ROOT / pid / iid
        assert isinstance(item.get('updateNote', ''), str), 'updateNote must be text'
        assert item['entries'], 'At least one entry is required'
        entry_names = set()
        for entry in item['entries']:
            assert entry['name'].strip() and entry['name'] not in entry_names
            entry_names.add(entry['name'])
            check_path(base, entry['path'])
        count += 1
for item in data.get('legacy', []):
    assert item['name'].strip()
    check_path(ROOT, item['path'])
print(f'OK: {len(seen_projects)} projects, {count} prototypes; all entry files exist.')

check_path(ROOT, 'project.html')

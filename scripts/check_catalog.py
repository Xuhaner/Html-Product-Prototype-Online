"""Validate the navigation catalog with Python's standard library."""
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'catalog.json').read_text())
seen_projects = set()
count = 0

def check_path(base, value):
    assert isinstance(value, str) and value, 'Missing path'
    target = (base / value).resolve()
    assert not Path(value).is_absolute() and target.is_relative_to(base.resolve()), f'Unsafe path: {value}'
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
        check_path(base, item['entry'])
        for page in item.get('pages', []):
            assert page['name'].strip()
            check_path(base, page['entry'])
        count += 1
for item in data.get('legacy', []):
    assert item['name'].strip()
    check_path(ROOT, item['path'])
print(f'OK: {len(seen_projects)} projects, {count} prototypes; all entry files exist.')

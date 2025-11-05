import csv, json, sys
from pathlib import Path

base = Path(__file__).parent
mapping_path = base / 'src/ro/mapping.ro.json'
catalog_path = Path('/Users/vladimirvolosevich/Downloads/Сatalog RO - Worksheet-2.csv')

# load mapping
with open(mapping_path, 'r', encoding='utf-8') as f:
    mapping = json.load(f)

# build set of (group, external_id) used in mapping
mapping_pairs = set()
mapping_external_ids = set()
for parent_uid, obj in mapping.items():
    g = obj.get('group')
    for vu, ext in (obj.get('variants') or {}).items():
        mapping_pairs.add((g, ext))
        mapping_external_ids.add(ext)

# parse catalog file → gather (item_group_id, external_id)
# Note: Meta catalog has comments on line 1, headers on line 2
cat_pairs = set()
cat_external_ids = set()
cat_rows = 0
with open(catalog_path, 'r', encoding='utf-8') as f:
    # Skip first line (comments)
    next(f)
    reader = csv.DictReader(f)
    for row in reader:
        cat_rows += 1
        ext = (row.get('id') or '').strip()
        group = (row.get('item_group_id') or '').strip()
        if ext and group:
            cat_pairs.add((group, ext))
            cat_external_ids.add(ext)

missing_in_mapping = sorted(list(cat_pairs - mapping_pairs))
extra_in_mapping = sorted(list(mapping_pairs - cat_pairs))

# Check which external_ids are in catalog but not in mapping
missing_external_ids = sorted(list(cat_external_ids - mapping_external_ids))
extra_external_ids = sorted(list(mapping_external_ids - cat_external_ids))

report = {
    'catalog_rows': cat_rows,
    'catalog_pairs': len(cat_pairs),
    'catalog_external_ids': len(cat_external_ids),
    'mapping_pairs': len(mapping_pairs),
    'mapping_external_ids': len(mapping_external_ids),
    'missing_in_mapping': missing_in_mapping[:50],  # first 50 for brevity
    'missing_in_mapping_total': len(missing_in_mapping),
    'extra_in_mapping': extra_in_mapping[:20],
    'extra_in_mapping_total': len(extra_in_mapping),
    'missing_external_ids': missing_external_ids[:30],
    'missing_external_ids_total': len(missing_external_ids),
    'extra_external_ids': extra_external_ids[:20],
    'extra_external_ids_total': len(extra_external_ids),
    'match_rate_estimate': f"{(len(mapping_external_ids & cat_external_ids) / len(cat_external_ids) * 100):.1f}%" if cat_external_ids else "0%"
}

(Path('reports')).mkdir(exist_ok=True)
with open('reports/verify_catalog_ro.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print(json.dumps(report, ensure_ascii=False, indent=2))


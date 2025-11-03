import csv, json, sys
from pathlib import Path

base = Path(__file__).parent
mapping_path = base / 'src/pl/mapping.pl.json'
store_path = base / 'src/pl/mapping.pl.json'  # not needed; mapping уже из store
catalog_path = Path('/Users/vladimirvolosevich/Downloads/Alumineu - Справочник-3.csv')

# load mapping
with open(mapping_path, 'r', encoding='utf-8') as f:
    mapping = json.load(f)

# build set of (group, external_id) used in mapping
mapping_pairs = set()
for parent_uid, obj in mapping.items():
    g = obj.get('group')
    for vu, ext in (obj.get('variants') or {}).items():
        mapping_pairs.add((g, ext))

# parse catalog file → gather (item_group_id, external_id)
cat_pairs = set()
cat_rows = 0
with open(catalog_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        cat_rows += 1
        ext = (row.get('Kod zewnętrzny') or row.get('Kod zewnetrzny') or '').strip()
        group = (row.get('item_group_id') or '').strip()
        if ext and group:
            cat_pairs.add((group, ext))

missing_in_mapping = sorted(list(cat_pairs - mapping_pairs))
extra_in_mapping = sorted(list(mapping_pairs - cat_pairs))

report = {
    'catalog_rows': cat_rows,
    'catalog_pairs': len(cat_pairs),
    'mapping_pairs': len(mapping_pairs),
    'missing_in_mapping': missing_in_mapping[:50],  # first 50 for brevity
    'missing_in_mapping_total': len(missing_in_mapping),
    'extra_in_mapping_total': len(extra_in_mapping)
}

(Path('reports')).mkdir(exist_ok=True)
with open('reports/verify_catalog_pl.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print(json.dumps(report, ensure_ascii=False, indent=2))

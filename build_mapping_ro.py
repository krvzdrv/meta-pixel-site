import csv, json, sys, os
from collections import defaultdict

# Input path can be passed as argv[1]
src = sys.argv[1] if len(sys.argv) > 1 else \
      "/Users/vladimirvolosevich/Downloads/Сatalog RO - store-13975805-202511051041.csv"

parents = {}  # parentUid -> groupId
variants_map = defaultdict(dict)  # parentUid -> { variantUid: externalId }
rows = 0

with open(src, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=',')
    for row in reader:
        rows += 1
        tilda_uid = (row.get('Tilda UID') or '').strip()
        parent_uid = (row.get('Parent UID') or '').strip()
        external_id = (row.get('External ID') or '').strip()
        if not tilda_uid:
            continue
        if parent_uid == '':
            # parent row (catalog record without parent)
            if external_id:
                parents[tilda_uid] = external_id
        else:
            # variant row
            if external_id:
                variants_map[parent_uid][tilda_uid] = external_id

# Build final mapping
mapping = {}
for parent_uid, group_id in parents.items():
    variants = variants_map.get(parent_uid, {})
    if not variants:
        # skip empty parents (no variants exported)
        continue
    mapping[parent_uid] = {
        "group": group_id,
        "variants": variants
    }

os.makedirs('src/ro', exist_ok=True)
os.makedirs('dist/ro', exist_ok=True)

with open('src/ro/mapping.ro.json', 'w', encoding='utf-8') as f:
    json.dump(mapping, f, ensure_ascii=False, indent=2)

with open('dist/ro/mapping.ro.js', 'w', encoding='utf-8') as f:
    f.write('window.productCatalogMapping = ')
    json.dump(mapping, f, ensure_ascii=False, indent=2)
    f.write(';' + '\n')

print(f"✅ Parsed rows: {rows}")
print(f"✅ Parents total: {len(parents)}; with variants: {len(mapping)}")
print(f"✅ Variants total: {sum(len(v['variants']) for v in mapping.values())}")
print(f"\n📁 Files created:")
print(f"  - src/ro/mapping.ro.json")
print(f"  - dist/ro/mapping.ro.js")


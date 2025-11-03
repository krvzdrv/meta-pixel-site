import csv, json, sys, os
from collections import defaultdict

# Input path can be passed as argv[1]; fallback to Downloads file name used above
src = sys.argv[1] if len(sys.argv) > 1 else \
      "/Users/vladimirvolosevich/Downloads/store-10348779-202511031418.csv"

parents = {}  # parentUid -> groupId
variants_map = defaultdict(dict)  # parentUid -> { variantUid: externalId }
rows = 0

with open(src, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
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

# Ensure INVISIA X209 from diagnostics is present (white + black)
# parentUid=318348125602, white variant=464804245532 -> cTT1GGAZj76alVXu4vaAe1, black variant=920286588882 -> EeRJkcybhq5xX9vhB-xzv3
p = '318348125602'
if p in mapping:
    mapping[p]["variants"].setdefault('464804245532', 'cTT1GGAZj76alVXu4vaAe1')
    mapping[p]["variants"].setdefault('920286588882', 'EeRJkcybhq5xX9vhB-xzv3')
else:
    mapping[p] = {
        "group": "invisia_x209",
        "variants": {
            '464804245532': 'cTT1GGAZj76alVXu4vaAe1',
            '920286588882': 'EeRJkcybhq5xX9vhB-xzv3'
        }
    }

os.makedirs('src/pl', exist_ok=True)
os.makedirs('dist/pl', exist_ok=True)

with open('src/pl/mapping.pl.json', 'w', encoding='utf-8') as f:
    json.dump(mapping, f, ensure_ascii=False, indent=2)

with open('dist/pl/mapping.pl.js', 'w', encoding='utf-8') as f:
    f.write('window.productCatalogMapping = ')
    json.dump(mapping, f, ensure_ascii=False, indent=2)
    f.write(';' + '\n')

print(f"Parsed rows: {rows}")
print(f"Parents total: {len(parents)}; with variants: {len(mapping)}; variants total: {sum(len(v['variants']) for v in mapping.values())}")

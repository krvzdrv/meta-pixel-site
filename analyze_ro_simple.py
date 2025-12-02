import csv
import json

# Читаем Meta каталог
meta_ids = set()
with open('/Users/vladimirvolosevich/Downloads/Сatalog RO - Worksheet-3.csv', 'r', encoding='utf-8') as f:
    next(f)  # пропуск комментария
    reader = csv.DictReader(f)
    for row in reader:
        ext_id = row.get('id', '').strip()
        if ext_id:
            meta_ids.add(ext_id)

# Читаем Tilda экспорт
tilda_ids = set()
with open('/Users/vladimirvolosevich/Downloads/store-13975805-202511060942.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    for row in reader:
        ext_id = row.get('External ID', '').strip()
        parent = row.get('Parent UID', '').strip()
        if ext_id and parent:  # только варианты
            tilda_ids.add(ext_id)

# Анализ
print(f"Meta каталог: {len(meta_ids)} товаров")
print(f"Tilda Store: {len(tilda_ids)} товаров")
print(f"Общих: {len(meta_ids & tilda_ids)}")
print(f"\nТолько в Meta (нет в Tilda): {len(meta_ids - tilda_ids)}")
print(f"Только в Tilda (нет в Meta): {len(tilda_ids - meta_ids)}")

test_id = 'EGXmtijjgeQdvXQSqdLGi3'
print(f"\nТестовый товар {test_id}:")
print(f"  В Meta: {test_id in meta_ids}")
print(f"  В Tilda: {test_id in tilda_ids}")

if tilda_ids - meta_ids:
    print(f"\n⚠️ {len(tilda_ids - meta_ids)} товаров из Tilda отсутствуют в Meta!")
    print("Это причина Match Rate 66.7%")


#!/usr/bin/env python3
"""
Проверка синхронизации между каталогом Meta и Tilda для RO сайта
"""
import csv
import json
from pathlib import Path

# Пути к файлам
meta_catalog = Path('/Users/vladimirvolosevich/Downloads/Сatalog RO - Worksheet-3.csv')
tilda_export = Path('/Users/vladimirvolosevich/Downloads/store-13975805-202511060942.csv')
current_mapping = Path('/Volumes/02 Data/work/Alumineu/GitHub/meta-pixel-site/src/ro/mapping.ro.json')

print("=" * 80)
print("ПРОВЕРКА СИНХРОНИЗАЦИИ RO: Meta Catalog ↔ Tilda Store")
print("=" * 80)

# 1. Загружаем каталог Meta
meta_products = {}  # item_group_id -> set of external_ids
meta_external_ids = set()

with open(meta_catalog, 'r', encoding='utf-8') as f:
    # Пропускаем первую строку (комментарии)
    next(f)
    reader = csv.DictReader(f)
    for row in reader:
        ext_id = row.get('id', '').strip()
        group_id = row.get('item_group_id', '').strip()
        title = row.get('title', '').strip()
        
        if ext_id and group_id:
            if group_id not in meta_products:
                meta_products[group_id] = []
            meta_products[group_id].append({
                'ext_id': ext_id,
                'title': title
            })
            meta_external_ids.add(ext_id)

print(f"\n✅ Каталог Meta загружен:")
print(f"   - Групп товаров: {len(meta_products)}")
print(f"   - Всего External IDs: {len(meta_external_ids)}")

# 2. Загружаем экспорт Tilda
tilda_products = {}  # parent_uid -> {variants: {variant_uid: ext_id}}
tilda_external_ids = set()

with open(tilda_export, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    for row in reader:
        tilda_uid = row.get('Tilda UID', '').strip()
        parent_uid = row.get('Parent UID', '').strip()
        ext_id = row.get('External ID', '').strip()
        title = row.get('Title', '').strip()
        
        if not tilda_uid:
            continue
            
        # Parent товар
        if not parent_uid and ext_id:
            if tilda_uid not in tilda_products:
                tilda_products[tilda_uid] = {
                    'group': ext_id,
                    'title': title,
                    'variants': {}
                }
        # Variant товар
        elif parent_uid and ext_id:
            if parent_uid not in tilda_products:
                tilda_products[parent_uid] = {
                    'group': '',
                    'title': '',
                    'variants': {}
                }
            tilda_products[parent_uid]['variants'][tilda_uid] = ext_id
            tilda_external_ids.add(ext_id)

print(f"\n✅ Tilda Store загружен:")
print(f"   - Parent товаров: {len(tilda_products)}")
print(f"   - Всего External IDs: {len(tilda_external_ids)}")

# 3. Загружаем текущий mapping
with open(current_mapping, 'r', encoding='utf-8') as f:
    current_map = json.load(f)

current_external_ids = set()
for parent_data in current_map.values():
    for ext_id in parent_data.get('variants', {}).values():
        current_external_ids.add(ext_id)

print(f"\n✅ Текущий mapping загружен:")
print(f"   - External IDs в mapping: {len(current_external_ids)}")

# 4. АНАЛИЗ РАСХОЖДЕНИЙ
print("\n" + "=" * 80)
print("АНАЛИЗ РАСХОЖДЕНИЙ")
print("=" * 80)

# 4.1 Товары в Meta, но НЕ в Tilda
missing_in_tilda = meta_external_ids - tilda_external_ids
if missing_in_tilda:
    print(f"\n⚠️  В КАТАЛОГЕ META, НО НЕ В TILDA ({len(missing_in_tilda)} шт):")
    for ext_id in sorted(missing_in_tilda):
        for group, products in meta_products.items():
            for prod in products:
                if prod['ext_id'] == ext_id:
                    print(f"   - {ext_id} | {group} | {prod['title']}")
else:
    print(f"\n✅ Все товары из каталога Meta есть в Tilda")

# 4.2 Товары в Tilda, но НЕ в Meta
extra_in_tilda = tilda_external_ids - meta_external_ids
if extra_in_tilda:
    print(f"\n⚠️  В TILDA, НО НЕ В КАТАЛОГЕ META ({len(extra_in_tilda)} шт):")
    for parent_uid, data in tilda_products.items():
        for variant_uid, ext_id in data['variants'].items():
            if ext_id in extra_in_tilda:
                print(f"   - {ext_id} | {data['group']} | {data['title']}")
else:
    print(f"\n✅ Все товары из Tilda есть в каталоге Meta")

# 4.3 Товары в старом mapping, но НЕ в новом экспорте Tilda
outdated_in_mapping = current_external_ids - tilda_external_ids
if outdated_in_mapping:
    print(f"\n⚠️  В СТАРОМ MAPPING, НО НЕ В СВЕЖЕМ TILDA ({len(outdated_in_mapping)} шт):")
    for ext_id in sorted(outdated_in_mapping):
        print(f"   - {ext_id}")
else:
    print(f"\n✅ Mapping актуален относительно Tilda")

# 5. ПРОВЕРКА ТЕСТОВОГО ТОВАРА
test_ext_id = 'EGXmtijjgeQdvXQSqdLGi3'  # INVISIA X206
print(f"\n" + "=" * 80)
print(f"ПРОВЕРКА ТЕСТОВОГО ТОВАРА: {test_ext_id}")
print("=" * 80)

in_meta = test_ext_id in meta_external_ids
in_tilda = test_ext_id in tilda_external_ids
in_mapping = test_ext_id in current_external_ids

print(f"\n✅ В каталоге Meta: {'ДА' if in_meta else 'НЕТ'}")
print(f"✅ В Tilda Store: {'ДА' if in_tilda else 'НЕТ'}")
print(f"✅ В текущем mapping: {'ДА' if in_mapping else 'НЕТ'}")

if in_meta and in_tilda and in_mapping:
    print(f"\n✅ Товар {test_ext_id} корректно присутствует везде!")
    
    # Найдём Tilda UID
    for parent_uid, data in tilda_products.items():
        for variant_uid, ext_id in data['variants'].items():
            if ext_id == test_ext_id:
                print(f"\n📦 Детали товара:")
                print(f"   - External ID: {ext_id}")
                print(f"   - Group ID: {data['group']}")
                print(f"   - Tilda Parent UID: {parent_uid}")
                print(f"   - Tilda Variant UID: {variant_uid}")
                print(f"   - Название: {data['title']}")
                break

# 6. ИТОГОВАЯ СТАТИСТИКА
print(f"\n" + "=" * 80)
print("ИТОГОВАЯ СТАТИСТИКА")
print("=" * 80)

coverage = (len(meta_external_ids & tilda_external_ids) / len(meta_external_ids) * 100) if meta_external_ids else 0

print(f"\n📊 Покрытие каталога Meta товарами из Tilda: {coverage:.1f}%")
print(f"   - Товаров в Meta: {len(meta_external_ids)}")
print(f"   - Товаров в Tilda: {len(tilda_external_ids)}")
print(f"   - Общих товаров: {len(meta_external_ids & tilda_external_ids)}")
print(f"   - Только в Meta: {len(missing_in_tilda)}")
print(f"   - Только в Tilda: {len(extra_in_tilda)}")

# 7. РЕКОМЕНДАЦИИ
print(f"\n" + "=" * 80)
print("РЕКОМЕНДАЦИИ")
print("=" * 80)

if missing_in_tilda:
    print(f"\n⚠️  ДЕЙСТВИЕ 1: Добавить {len(missing_in_tilda)} товаров в Tilda Store")
    print(f"   Или удалить их из каталога Meta, если они больше не продаются")

if extra_in_tilda:
    print(f"\n⚠️  ДЕЙСТВИЕ 2: Добавить {len(extra_in_tilda)} товаров в каталог Meta")
    print(f"   Эти товары есть на сайте, но Meta не может их отследить")
    print(f"   ЭТО ГЛАВНАЯ ПРИЧИНА Match Rate 66.7% вместо 100%!")

if outdated_in_mapping:
    print(f"\n⚠️  ДЕЙСТВИЕ 3: Обновить mapping (удалены {len(outdated_in_mapping)} старых товаров)")

if not missing_in_tilda and not extra_in_tilda and not outdated_in_mapping:
    print(f"\n✅ ВСЁ СИНХРОНИЗИРОВАНО! Можно обновить mapping.")

print(f"\n" + "=" * 80)


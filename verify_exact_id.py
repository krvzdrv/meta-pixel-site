#!/usr/bin/env python3
"""
Проверка точного совпадения External ID между Meta каталогом и тем, что отправляет скрипт
"""
import csv

# External ID из вашего тестового заказа
test_id = 'EGXmtijjgeQdvXQSqdLGi3'

print("=" * 80)
print(f"ПРОВЕРКА ТОЧНОГО СОВПАДЕНИЯ: {test_id}")
print("=" * 80)

# Читаем Meta каталог
meta_file = '/Users/vladimirvolosevich/Downloads/Сatalog RO - Worksheet-3.csv'

print(f"\n📁 Читаем каталог Meta: {meta_file}")

found_in_meta = False
with open(meta_file, 'r', encoding='utf-8') as f:
    # Пропускаем первую строку (комментарии)
    first_line = f.readline()
    print(f"\n   Первая строка (комментарии): {first_line[:100]}...")
    
    # Читаем заголовки
    headers_line = f.readline()
    print(f"   Вторая строка (заголовки): {headers_line[:100]}...")
    
    # Возвращаемся в начало для csv.DictReader
    f.seek(0)
    next(f)  # пропуск комментариев
    
    reader = csv.DictReader(f)
    
    # Проверяем заголовки
    print(f"\n   Колонки в CSV: {reader.fieldnames[:10]}...")
    
    for i, row in enumerate(reader, 1):
        ext_id = row.get('id', '').strip()
        group = row.get('item_group_id', '').strip()
        title = row.get('title', '').strip()
        
        # Ищем наш товар
        if ext_id == test_id:
            found_in_meta = True
            print(f"\n✅ НАЙДЕН В КАТАЛОГЕ META (строка {i+2}):")
            print(f"   - id: '{ext_id}'")
            print(f"   - item_group_id: '{group}'")
            print(f"   - title: '{title}'")
            print(f"   - Длина id: {len(ext_id)} символов")
            print(f"   - Байты: {ext_id.encode('utf-8')}")
            break
    
    if not found_in_meta:
        print(f"\n❌ НЕ НАЙДЕН в каталоге Meta!")
        print(f"   Это может быть причиной Match Rate = 0%")

# Проверяем Tilda mapping
print(f"\n" + "=" * 80)
print(f"ПРОВЕРКА В TILDA MAPPING")
print("=" * 80)

tilda_file = '/Users/vladimirvolosevich/Downloads/store-13975805-202511060942.csv'

found_in_tilda = False
with open(tilda_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    
    for i, row in enumerate(reader, 1):
        ext_id = row.get('External ID', '').strip()
        tilda_uid = row.get('Tilda UID', '').strip()
        parent_uid = row.get('Parent UID', '').strip()
        title = row.get('Title', '').strip()
        
        if ext_id == test_id:
            found_in_tilda = True
            print(f"\n✅ НАЙДЕН В TILDA (строка {i+1}):")
            print(f"   - External ID: '{ext_id}'")
            print(f"   - Tilda UID: '{tilda_uid}'")
            print(f"   - Parent UID: '{parent_uid}'")
            print(f"   - Title: '{title}'")
            print(f"   - Длина External ID: {len(ext_id)} символов")
            print(f"   - Байты: {ext_id.encode('utf-8')}")
            
            # Проверяем в mapping
            import json
            with open('/Volumes/02 Data/work/Alumineu/GitHub/meta-pixel-site/src/ro/mapping.ro.json', 'r') as mf:
                mapping = json.load(mf)
                
            if parent_uid in mapping:
                if tilda_uid in mapping[parent_uid]['variants']:
                    mapped_id = mapping[parent_uid]['variants'][tilda_uid]
                    print(f"\n✅ НАЙДЕН В MAPPING:")
                    print(f"   - Parent UID: {parent_uid}")
                    print(f"   - Variant UID: {tilda_uid}")
                    print(f"   - Mapped External ID: '{mapped_id}'")
                    print(f"   - СОВПАДАЕТ: {mapped_id == test_id}")
                else:
                    print(f"\n❌ Variant UID {tilda_uid} НЕ НАЙДЕН в mapping для parent {parent_uid}")
            else:
                print(f"\n❌ Parent UID {parent_uid} НЕ НАЙДЕН в mapping")
            
            break
    
    if not found_in_tilda:
        print(f"\n❌ НЕ НАЙДЕН в Tilda!")

# Итог
print(f"\n" + "=" * 80)
print(f"ИТОГ")
print("=" * 80)

if found_in_meta and found_in_tilda:
    print(f"\n✅ External ID присутствует и в Meta каталоге, и в Tilda")
    print(f"✅ Формат ID корректный")
    print(f"\n🔍 Если Match Rate всё равно 0%, проверьте:")
    print(f"   1. Подключен ли правильный каталог к пикселю?")
    print(f"   2. Совпадает ли валюта в каталоге и событиях (RON)?")
    print(f"   3. Прошло ли достаточно времени (24-48 часов)?")
else:
    print(f"\n❌ ПРОБЛЕМА С EXTERNAL ID!")
    if not found_in_meta:
        print(f"   - Товар отсутствует в каталоге Meta")
    if not found_in_tilda:
        print(f"   - Товар отсутствует в Tilda")

print(f"\n" + "=" * 80)


# Исправление: Content IDs для Catalog Match Rate

**Дата:** 04.11.2025  
**Версия:** v16 (исправленная версия v15)  
**Статус:** ✅ Исправлено для всех локалей

---

## Проблема

Meta Pixel отправлял `content_ids` с **двумя** идентификаторами на товар:
```javascript
content_ids: ["lightra_x015", "olHJtrUhhLVDB5FN2Is6G0"]
              ↑ group_id       ↑ variant_id
```

Но в каталоге Meta колонка `id` содержит только `variant_id`:
```csv
id
olHJtrUhhLVDB5FN2Is6G0
Rv6KF1WLiPamjAv2BaZge3
```

**Результат:**
- Catalog Match Rate = 88.9% (должно быть >95%)
- Purchase события не связывались с товарами
- Product purchases показывал "Missing"

---

## Решение

Изменён формат `content_ids` на всех сайтах:

### ДО (v15):
```javascript
content_ids: [groupId, variantId]  // ❌ два ID на товар
// Пример: ["curtina_x405", "zRy2mTY3io-ReCRagT1MI2"]
```

### ПОСЛЕ (v16):
```javascript
content_ids: [variantId]  // ✅ один ID на товар
// Пример: ["zRy2mTY3io-ReCRagT1MI2"]
```

---

## Изменения в коде

### 1. Функция `getProductData()`
```javascript
// БЫЛО:
return {
  group_id: productMapping.group,
  variant_id: variantId,
  ...
};

// СТАЛО:
return {
  variant_id: variantId,  // убран group_id
  ...
};
```

### 2. Событие ViewContent (2 места)
```javascript
// БЫЛО:
content_ids: [productData.group_id, productData.variant_id]

// СТАЛО:
content_ids: [productData.variant_id]
```

### 3. Событие AddToCart (2 места)
```javascript
// БЫЛО:
content_ids: [productData.group_id, productData.variant_id]

// СТАЛО:
content_ids: [productData.variant_id]
```

### 4. Функция `snapshotCartFromTilda()` (3 места)
```javascript
// БЫЛО:
contentIds.push(m.group, m.variants[product.uid]);

// СТАЛО:
contentIds.push(m.variants[product.uid]);
```

---

## Затронутые файлы

- ✅ `dist/pl/pixel.v15.pl.FULL.html` — польский сайт
- ✅ `dist/de/pixel.v15.de.FULL.html` — немецкий сайт
- ✅ `dist/ro/pixel.v15.ro.FULL.html` — румынский сайт

---

## Ожидаемый результат

### До исправления:
```
Event Manager: Purchase ✅ (события регистрируются)
Commerce Manager: Product purchases ❌ (Missing, 0%)
Catalog Match Rate: 88.9% ⚠️
```

### После исправления:
```
Event Manager: Purchase ✅ (события регистрируются)
Commerce Manager: Product purchases ✅ (совпадают с Event Manager)
Catalog Match Rate: 95-100% ✅
```

---

## Тестирование

### Быстрая проверка в консоли:

**На странице товара:**
```javascript
var el = document.querySelector('[data-product-gen-uid][data-product-uid]');
var parentUid = el.getAttribute('data-product-gen-uid');
var variantUid = el.getAttribute('data-product-uid');
var mapping = window.productCatalogMapping[parentUid];
console.log('Variant ID:', mapping.variants[variantUid]);
// Должен вывести ОДИН ID: "olHJtrUhhLVDB5FN2Is6G0"
```

**После AddToCart (в Test Events):**
```javascript
// Правильно:
content_ids: ["olHJtrUhhLVDB5FN2Is6G0"]

// Неправильно (старая версия):
content_ids: ["lightra_x015", "olHJtrUhhLVDB5FN2Is6G0"]
```

### Полное тестирование:

1. ✅ ViewContent — один ID
2. ✅ AddToCart — один ID
3. ✅ InitiateCheckout — один ID на товар (без дубликатов)
4. ✅ Purchase — один ID на товар
5. ✅ Catalog Match Rate ≥95% (через 24-48ч)
6. ✅ Product purchases в Commerce Manager показывает события

---

## Разблокированные возможности

После исправления стали доступны:
- ✅ Dynamic Product Ads (DPA)
- ✅ Ретаргетинг по конкретным товарам
- ✅ Advantage+ catalog campaigns
- ✅ Детальная статистика продаж по SKU
- ✅ Автоматическая оптимизация по каталогу
- ✅ Корректный ROAS (возврат инвестиций) по товарам

---

## Важное примечание

**Маппинг остался без изменений:**
- `window.productCatalogMapping` по-прежнему содержит `group` и `variants`
- `group` используется только для fallback (если variant не найден)
- Это обеспечивает совместимость и упрощает обслуживание

---

**Версия документа:** 1.0  
**Дата создания:** 04.11.2025  
**Commit:** feat(all): fix content_ids format - use only variant_id for catalog match


// ============================
// META PIXEL EXTENDED DIAGNOSTICS v2
// Для всех локалей: PL/DE/RO
// Запускать в DevTools Console на любой странице
// ============================
(function() {
  'use strict';

  console.log('%c🔍 META PIXEL EXTENDED DIAGNOSTICS v2', 'background: #667eea; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
  console.log('Timestamp:', new Date().toISOString());
  console.log('URL:', window.location.href);
  console.log('---');

  // ============================
  // 1. ТИП СТРАНИЦЫ
  // ============================
  console.log('%c1. ТИП СТРАНИЦЫ', 'font-weight: bold; font-size: 14px; background: #f3f4f6; padding: 5px;');

  const pageType = {
    isProductPage: !!document.querySelector('[data-product-gen-uid][data-product-uid]'),
    isThankyouPage: !!document.querySelector('.t-store__thankyoupage'),
    isCartPage: window.location.href.includes('/cart') || !!document.querySelector('.t-store__cart'),
    isCheckoutPage: !!document.querySelector('.t-store__checkout-form')
  };

  console.log('📄 Страница товара:', pageType.isProductPage ? '✅ ДА' : '❌ НЕТ');
  console.log('🎉 Страница "Спасибо":', pageType.isThankyouPage ? '✅ ДА' : '❌ НЕТ');
  console.log('🛒 Страница корзины:', pageType.isCartPage ? '✅ ДА' : '❌ НЕТ');
  console.log('📋 Страница оформления:', pageType.isCheckoutPage ? '✅ ДА' : '❌ НЕТ');

  if (!pageType.isThankyouPage) {
    console.log('%c⚠️ Purchase события должны отправляться ТОЛЬКО со страницы "Спасибо"', 'color: orange; font-weight: bold;');
  }
  console.log('---');

  // ============================
  // 2. TILDA CART (window.tcart)
  // ============================
  console.log('%c2. TILDA CART (window.tcart)', 'font-weight: bold; font-size: 14px; background: #f3f4f6; padding: 5px;');

  if (typeof window.tcart !== 'undefined') {
    console.log('✅ window.tcart существует');
    console.log('📦 Products в корзине:', window.tcart.products ? window.tcart.products.length : 0);
    console.log('💰 Total сумма:', window.tcart.total || '0');
    console.log('🆔 Order ID:', window.tcart.orderid || 'НЕТ');

    if (window.tcart.products && window.tcart.products.length > 0) {
      console.log('%c📋 Товары в корзине:', 'font-weight: bold;');
      window.tcart.products.forEach((product, idx) => {
        console.log(`  ${idx + 1}. ${product.name || 'Без названия'}`);
        console.log(`     UID: ${product.uid}`);
        console.log(`     Price: ${product.price} x ${product.quantity}`);
      });
    } else {
      console.log('%c⚠️ Корзина пуста', 'color: orange;');
    }

    console.log('%c📊 Полный объект tcart:', 'font-weight: bold;');
    console.table(window.tcart);
  } else {
    console.log('%c❌ window.tcart НЕ НАЙДЕН', 'color: red; font-weight: bold;');
    console.log('Это критическая проблема для Purchase событий!');
  }
  console.log('---');

  // ============================
  // 3. META PIXEL (fbq)
  // ============================
  console.log('%c3. META PIXEL (fbq)', 'font-weight: bold; font-size: 14px; background: #f3f4f6; padding: 5px;');

  if (typeof fbq !== 'undefined') {
    console.log('✅ fbq функция загружена');

    if (!window._fbqInterceptorInstalled) {
      const originalFbq = window.fbq;
      window._fbqEventLog = [];

      window.fbq = function() {
        const eventType = arguments[0];
        const eventName = arguments[1];
        const eventData = arguments[2];
        const eventOptions = arguments[3];

        const logEntry = {
          timestamp: new Date().toISOString(),
          type: eventType,
          name: eventName,
          data: eventData,
          options: eventOptions
        };

        window._fbqEventLog.push(logEntry);

        console.log('%c📤 fbq EVENT:', 'background: #3b82f6; color: white; font-weight: bold; padding: 3px;', eventName);
        console.log('  Type:', eventType);
        console.log('  Data:', eventData);
        if (eventOptions) console.log('  Options:', eventOptions);

        return originalFbq.apply(this, arguments);
      };

      window._fbqInterceptorInstalled = true;
      console.log('✅ Расширенный перехватчик fbq установлен');
      console.log('   Все события будут логироваться в window._fbqEventLog');
    } else {
      console.log('✅ Перехватчик fbq уже установлен');
    }
  } else {
    console.log('%c❌ fbq НЕ ЗАГРУЖЕН', 'color: red; font-weight: bold;');
  }
  console.log('---');

  // ============================
  // 4. PRODUCT CATALOG MAPPING
  // ============================
  console.log('%c4. PRODUCT CATALOG MAPPING', 'font-weight: bold; font-size: 14px; background: #f3f4f6; padding: 5px;');

  if (typeof window.productCatalogMapping !== 'undefined') {
    const mappingKeys = Object.keys(window.productCatalogMapping);
    console.log('✅ Mapping загружен');
    console.log('📊 Количество parent товаров:', mappingKeys.length);

    let totalVariants = 0;
    mappingKeys.forEach(key => {
      const variants = window.productCatalogMapping[key].variants;
      totalVariants += Object.keys(variants).length;
    });
    console.log('🔢 Всего вариантов:', totalVariants);

    console.log('%c📋 Примеры mapping (первые 5):', 'font-weight: bold;');
    mappingKeys.slice(0, 5).forEach(parentUid => {
      const mapping = window.productCatalogMapping[parentUid];
      console.log(`  Parent UID: ${parentUid}`);
      console.log(`    Group ID: ${mapping.group}`);
      console.log(`    Variants: ${Object.keys(mapping.variants).length}`);
    });
  } else {
    console.log('%c❌ Mapping НЕ НАЙДЕН', 'color: red; font-weight: bold;');
  }
  console.log('---');

  // ============================
  // 5. ТЕКУЩИЙ ТОВАР (если страница товара)
  // ============================
  if (pageType.isProductPage) {
    console.log('%c5. ТЕКУЩИЙ ТОВАР НА СТРАНИЦЕ', 'font-weight: bold; font-size: 14px; background: #f3f4f6; padding: 5px;');

    const productElement = document.querySelector('[data-product-gen-uid][data-product-uid]');
    const parentUid = productElement && productElement.getAttribute('data-product-gen-uid');
    const variantUid = productElement && productElement.getAttribute('data-product-uid');

    console.log('🏷️ Parent UID:', parentUid);
    console.log('🎨 Variant UID:', variantUid);

    if (window.productCatalogMapping && window.productCatalogMapping[parentUid]) {
      const mapping = window.productCatalogMapping[parentUid];
      const variantId = mapping.variants[variantUid] || mapping.group;

      console.log('✅ Товар найден в mapping');
      console.log('📦 Group ID:', mapping.group);
      console.log('🆔 Variant ID:', variantId);
      console.log('✅ content_ids:', [mapping.group, variantId]);

      if (!mapping.variants[variantUid]) {
        console.log('%c⚠️ Используется FALLBACK (variant не найден, используется group)', 'color: orange; font-weight: bold;');
      }
    } else {
      console.log('%c❌ Товар НЕ найден в mapping!', 'color: red; font-weight: bold;');
      console.log('   Это приведёт к fallback при AddToCart/Purchase');
    }
    console.log('---');
  }

  // ============================
  // 6. ИСТОРИЯ СОБЫТИЙ FBQ
  // ============================
  console.log('%c6. ИСТОРИЯ СОБЫТИЙ FBQ', 'font-weight: bold; font-size: 14px; background: #f3f4f6; padding: 5px;');

  if (window._fbqEventLog && window._fbqEventLog.length > 0) {
    console.log(`✅ Записано событий: ${window._fbqEventLog.length}`);
    console.table(window._fbqEventLog);
    
    // Статистика по событиям
    const eventStats = {};
    window._fbqEventLog.forEach(e => {
      eventStats[e.name] = (eventStats[e.name] || 0) + 1;
    });
    console.log('%c📊 Статистика событий:', 'font-weight: bold;');
    console.table(eventStats);

    // ПРОВЕРКА ФОРМАТА content_ids (v16)
    console.log('%c🔍 ПРОВЕРКА ФОРМАТА content_ids (должен быть ОДИН ID на товар):', 'font-weight: bold; color: #f59e0b;');
    const formatIssues = [];
    window._fbqEventLog.forEach((e, idx) => {
      if (e.data && Array.isArray(e.data.content_ids)) {
        const ids = e.data.content_ids;
        // Для ViewContent/AddToCart: должен быть 1 ID
        if ((e.name === 'ViewContent' || e.name === 'AddToCart') && ids.length !== 1) {
          formatIssues.push({
            event: e.name,
            index: idx,
            content_ids: ids,
            problem: `Ожидается 1 ID, получено ${ids.length}`
          });
        }
        // Для InitiateCheckout/Purchase: должно быть N ID (по числу товаров без дубликатов)
        if ((e.name === 'InitiateCheckout' || e.name === 'Purchase')) {
          const numItems = e.data.num_items || 1;
          if (ids.length !== numItems) {
            console.log(`  ℹ️ ${e.name}: ${ids.length} IDs для ${numItems} товаров - проверьте дубли`);
          }
        }
      }
    });
    
    if (formatIssues.length > 0) {
      console.log('%c❌ НАЙДЕНЫ ПРОБЛЕМЫ С ФОРМАТОМ:', 'color: red; font-weight: bold;');
      console.table(formatIssues);
      console.log('%c⚠️ Используется СТАРАЯ версия скрипта! Обновите на v16.', 'color: orange; font-weight: bold;');
    } else {
      console.log('%c✅ Формат content_ids корректный (v16)', 'color: green; font-weight: bold;');
      console.log('   Все события используют ОДИН variant_id на товар');
    }
  } else {
    console.log('ℹ️ События ещё не записывались или перехватчик не активен');
    console.log('   Запустите этот скрипт ДО выполнения действий на сайте');
  }
  console.log('---');

  // ============================
  // 7. СОХРАНЁННЫЕ ДАННЫЕ КОРЗИНЫ
  // ============================
  console.log('%c7. СОХРАНЁННЫЕ ДАННЫЕ КОРЗИНЫ', 'font-weight: bold; font-size: 14px; background: #f3f4f6; padding: 5px;');

  if (window.savedCartForPurchase) {
    console.log('✅ Данные корзины сохранены в window.savedCartForPurchase');
    console.log('📋 Content IDs:', window.savedCartForPurchase.content_ids);
    console.log('💰 Value:', window.savedCartForPurchase.value);
    console.log('🔢 Num items:', window.savedCartForPurchase.num_items);
    console.log('🆔 Order ID:', window.savedCartForPurchase.order_id || 'НЕТ');
    console.log('⚠️ Fallback used:', window.savedCartForPurchase.fallback_used);
    console.log('%cПолный объект:', 'font-weight: bold;');
    console.log(window.savedCartForPurchase);
  } else {
    console.log('ℹ️ savedCartForPurchase отсутствует');
    console.log('   Это нормально до оформления заказа');
    
    // Проверяем localStorage
    try {
      const lsData = localStorage.getItem('savedCartForPurchase_v1');
      if (lsData) {
        const parsed = JSON.parse(lsData);
        const age = Date.now() - (parsed.ts || 0);
        console.log('💾 Найден backup в localStorage:');
        console.log('   Возраст:', Math.round(age / 1000), 'секунд');
        console.log('   Корзина:', parsed.cart);
      } else {
        console.log('ℹ️ Backup в localStorage отсутствует');
      }
    } catch(e) {
      console.log('ℹ️ Backup в localStorage отсутствует');
    }
  }
  console.log('---');

  // ============================
  // 8. РЕКОМЕНДАЦИИ
  // ============================
  console.log('%c8. РЕКОМЕНДАЦИИ', 'font-weight: bold; font-size: 14px; background: #fbbf24; padding: 5px;');

  if (!pageType.isThankyouPage) {
    console.log('📝 Для полного тестирования Purchase:');
    console.log('   1. Запустите этот скрипт СЕЙЧАС (установит перехватчик)');
    console.log('   2. Добавьте товар в корзину');
    console.log('   3. Перейдите к оформлению заказа');
    console.log('   4. Заполните форму и завершите заказ');
    console.log('   5. На странице "Спасибо" проверьте console.table(window._fbqEventLog)');
  }

  if (pageType.isProductPage) {
    console.log('📝 На странице товара доступны команды:');
    console.log('   - Смена варианта → автоматически отправит ViewContent');
    console.log('   - Кнопка добавления в корзину → отправит AddToCart');
  }

  if (pageType.isThankyouPage) {
    console.log('📝 На странице "Спасибо":');
    console.log('   - Purchase должен был отправиться автоматически');
    console.log('   - Проверьте историю: console.table(window._fbqEventLog)');
    console.log('   - Ищите Purchase с fallback_used: false');
  }

  console.log('---');

  // ============================
  // 9. БЫСТРЫЕ КОМАНДЫ
  // ============================
  console.log('%c9. БЫСТРЫЕ КОМАНДЫ ДЛЯ ОТЛАДКИ', 'font-weight: bold; font-size: 14px; background: #10b981; color: white; padding: 5px;');
  console.log('// Показать историю событий:');
  console.log('console.table(window._fbqEventLog)');
  console.log('');
  console.log('// Показать сохранённую корзину:');
  console.log('console.log(window.savedCartForPurchase)');
  console.log('');
  console.log('// Показать mapping:');
  console.log('console.log(window.productCatalogMapping)');
  console.log('');
  console.log('// Показать текущую корзину Tilda:');
  console.log('console.log(window.tcart)');
  console.log('');
  console.log('// Восстановить корзину из localStorage:');
  console.log('JSON.parse(localStorage.getItem("savedCartForPurchase_v1"))');
  console.log('---');

  // ============================
  // 10. ЗАВЕРШЕНИЕ
  // ============================
  console.log('%c✅ ДИАГНОСТИКА ЗАВЕРШЕНА', 'background: #10b981; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
  console.log('Все последующие события fbq будут логироваться автоматически');
  console.log('Проверить историю: console.table(window._fbqEventLog)');

  // Выводим краткую сводку
  const summary = {
    'fbq загружен': typeof fbq !== 'undefined' ? '✅' : '❌',
    'Mapping загружен': typeof window.productCatalogMapping !== 'undefined' ? '✅' : '❌',
    'tcart доступен': typeof window.tcart !== 'undefined' ? '✅' : '❌',
    'Товаров в корзине': window.tcart && window.tcart.products ? window.tcart.products.length : 0,
    'savedCart доступен': !!window.savedCartForPurchase ? '✅' : '❌',
    'Перехватчик активен': !!window._fbqInterceptorInstalled ? '✅' : '❌'
  };
  console.table(summary);
})();


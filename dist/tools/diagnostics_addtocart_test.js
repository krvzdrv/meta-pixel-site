// ============================
// META PIXEL ADDTOCART DIAGNOSTICS - ENHANCED
// Специальный тест для отслеживания проблемы с AddToCart 0%
// Запускать в DevTools Console ПЕРЕД добавлением товара в корзину
// ============================
(function() {
  'use strict';

  console.clear();
  console.log('%c🔬 ADDTOCART DIAGNOSTICS - ENHANCED TEST', 'background: #dc2626; color: white; padding: 10px; font-size: 18px; font-weight: bold;');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('🌐 URL:', window.location.href);
  console.log('');

  // ============================
  // ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ ОТСЛЕЖИВАНИЯ
  // ============================
  window._atcTest = {
    allFbqCalls: [],
    addToCartEvents: [],
    duplicateDetected: false,
    tildaEventDetected: false,
    startTime: Date.now()
  };

  // ============================
  // 1. ПРОВЕРКА ОКРУЖЕНИЯ
  // ============================
  console.log('%c📋 1. ПРОВЕРКА ОКРУЖЕНИЯ', 'background: #3b82f6; color: white; padding: 5px; font-weight: bold;');
  
  const env = {
    fbqLoaded: typeof fbq !== 'undefined',
    mappingLoaded: typeof window.productCatalogMapping !== 'undefined',
    tcartAvailable: typeof window.tcart !== 'undefined',
    isProductPage: !!document.querySelector('[data-product-gen-uid][data-product-uid]')
  };

  console.table(env);

  if (!env.fbqLoaded) {
    console.log('%c❌ КРИТИЧНО: fbq не загружен!', 'color: red; font-weight: bold; font-size: 14px;');
    return;
  }

  if (!env.isProductPage) {
    console.log('%c⚠️ Вы НЕ на странице товара!', 'color: orange; font-weight: bold;');
    console.log('   Перейдите на страницу товара и запустите скрипт снова');
    return;
  }

  // ============================
  // 2. ИНФОРМАЦИЯ О ТЕКУЩЕМ ТОВАРЕ
  // ============================
  console.log('%c📦 2. ТЕКУЩИЙ ТОВАР', 'background: #3b82f6; color: white; padding: 5px; font-weight: bold;');
  
  const productElement = document.querySelector('[data-product-gen-uid][data-product-uid]');
  const parentUid = productElement.getAttribute('data-product-gen-uid');
  const variantUid = productElement.getAttribute('data-product-uid');

  console.log('Parent UID:', parentUid);
  console.log('Variant UID:', variantUid);

  let expectedExternalId = null;
  let expectedGroupId = null;
  let inCatalog = '❓ НЕИЗВЕСТНО';

  if (window.productCatalogMapping && window.productCatalogMapping[parentUid]) {
    const mapping = window.productCatalogMapping[parentUid];
    expectedExternalId = mapping.variants[variantUid] || mapping.group;
    expectedGroupId = mapping.group;
    
    console.log('%c✅ Товар найден в mapping', 'color: green; font-weight: bold;');
    console.log('Expected External ID:', expectedExternalId);
    console.log('Expected Group ID:', expectedGroupId);
    
    // Проверяем есть ли в каталоге Meta (по отчету)
    const metaCatalogIds = [
      'oo9OjTbNgZ8SJAWgghj610', 'Rv6KF1WLiPamjAv2BaZge3', 'olHJtrUhhLVDB5FN2Is6G0',
      'MzeeWUC0gyE9JJJLbz34v3', 'wDQZybWWgNkn2Zq49zPi30', 'e9yQf8rDjzi3XjGnnx3Iw3',
      'DKTDmwA2icCZL2vSUjXum3', 'vdjAWIcdhHNfZhVE150J92', 'eePmEHIghXucCCjWcE2zy3',
      'yUubMVw1hqQAZdBztKRgZ2', 'hSqFGvnTjaggVAymnovmh0', 'smfA9ADrg9P4AffHsiprN2',
      'Hxf-n56DhLa95Jq8oTmSb3', 'i3hGepcZiU3L8JqEJ2rtV0', 'jx2sQ0lhiTZsQVWNF9X2z0',
      '34WwfpBUjupvpuPa3EpLr3', 'zRy2mTY3io-ReCRagT1MI2', '9YYv8DXkjKpGTTDe3j99Y3',
      'M7K8jSGug5rmTO1txLm922', 'Rid7eYeaihDEYyuGmwIm10', 'hRYJaVIahB4Jg-O10ZpbV0',
      'QYtmUePthsfmVcpZ7LaHB2', 'jzysdA0nhEDukcRfamitz0', 'IxT7oD8zhIbrnn2LbGw2D0',
      'Y7mho3jShobDY2hUqkXX83', 'fxcs1s4Sg4i9usohMYyp11', 'DJNjCqquhcS8YMhhFUUT-3',
      'zA59TVMAiMOOTZf15BUvl2', 'CWpGaKdlgRQIwS9TWZI6n0', 'MP9kMK6mg9LT--ZPdvSbb1',
      'V3cnnvOSiRXwOxWDjbAgp3', 'uOmKNKiKhPZzh4UNscvrM3', '5Iae0Kl7jHu3J80n7k6Nu3',
      '5A33vrjxg2INi6FdYvYHV1', 'Zm1YLzGFjDyJzl5BQ2AZK2', 'jWf3YVZMj28oz3Vn9Ruwa1',
      'SVjKGGnNhIO8Ovbe-z0yF3', '5ET97eXngrRKDRbIJ4YhN2', 'yfcIPkXYi7hGeHi9sRjg51',
      'Z0jQpgcsgfNvDPq3zycpi1', '0tjwIdlUikOX0Ujz8iz0g0', 's3hlPBkThtLs9b-VgS5-72',
      'vdRmfjJniS9p1gOygMbDs0', '08Gs75cLiwndvRDfwZZkQ2', 'cJyPtbDhhRAmihZrojWDn0',
      'gtIKBLtJghv4WzA42yxPP1', 'EGXmtijjgeQdvXQSqdLGi3', 'YZTju3ikgOF1-Sj6ktK6e2',
      'eyVbkQihgGQtYR5EF0P4w0', 'cTT1GGAZj76alVXu4vaAe1', 'EeRJkcybhq5xX9vhB-xzv3',
      'xO7PAABriJTHSKVNGiuYl3', 'MyI2v2JMhnRtUrh6H58nz0', 'mCMAr4yQhDaPX-LNJ5RD73',
      'lxFpGXGnhGh-TPEwCLiEt2', 'rtBsri0AgIfzRs45xlYEo3', 'TTCe8rd4gfNWGALqZZ6XQ1',
      '5rGDU6PghnaCaAB4hbK363', '9DTMhoqug8m-s5umlvoUH2', 'A8KXwZGog4GTrG3uTcqe72',
      'OKOeFss5i43IMv6ZjYcRM3', 'iSRbWSLtitojIsPO0sI9x2', 'gA28ToLCggK3W8YPSsFkT1',
      'CkVvKhJbiGhhK2anvHdB33', 'PIsjk6JZiDyyFLIyu2lyU0', 'OGuLhFuVjSlwHsBusU5Sf1',
      'FWceQ5ETivN6fBl0i-tWJ2', 'LhsJi728gSt1-qEKriOWU2', 'JLVFDRdrgtcM9IORQDzXv0',
      'KmK1hPPBihH4KDyWNRaPo0', 'ryMNNy0Vjq1ciFgP2gUaK3', '6UZy5OEYgiU2cDd92z2R00',
      'AxdssG3zilcc0nq8IRQCg0', '63SkQfPpjSYcEKuuMh-YG2', 'Xo7o90pXhmhKf1FmlwptL2',
      'ysB7srkLhvaXhUm2B-WED1', 'rTvzIoD8go7VbGrUSWHeb2'
    ];
    
    inCatalog = metaCatalogIds.includes(expectedExternalId) ? '✅ ДА' : '❌ НЕТ';
    console.log('В каталоге Meta:', inCatalog);
    
    if (inCatalog === '❌ НЕТ') {
      console.log('%c⚠️ ВНИМАНИЕ: Этот товар ОТСУТСТВУЕТ в каталоге Meta!', 'background: #f59e0b; color: black; padding: 5px; font-weight: bold;');
      console.log('   Даже правильное событие даст 0% match rate!');
    }
  } else {
    console.log('%c❌ Товар НЕ найден в mapping!', 'color: red; font-weight: bold;');
  }

  console.log('');

  // ============================
  // 3. УСТАНОВКА ПЕРЕХВАТЧИКА FBQ
  // ============================
  console.log('%c🎣 3. УСТАНОВКА РАСШИРЕННОГО ПЕРЕХВАТЧИКА', 'background: #3b82f6; color: white; padding: 5px; font-weight: bold;');
  
  const originalFbq = window.fbq;
  let callCount = 0;

  window.fbq = function() {
    callCount++;
    const callId = callCount;
    const timestamp = Date.now();
    const relativeTime = timestamp - window._atcTest.startTime;
    
    const eventType = arguments[0];      // 'track', 'trackCustom', etc
    const eventName = arguments[1];      // 'AddToCart', 'ViewContent', etc
    const eventData = arguments[2];      // {content_ids: [...], ...}
    const eventOptions = arguments[3];   // {eventID: '...'}

    const logEntry = {
      callId: callId,
      timestamp: new Date(timestamp).toISOString(),
      relativeTime: `+${relativeTime}ms`,
      type: eventType,
      name: eventName,
      data: eventData ? JSON.parse(JSON.stringify(eventData)) : null,
      options: eventOptions ? JSON.parse(JSON.stringify(eventOptions)) : null,
      stack: new Error().stack
    };

    // Сохраняем ВСЕ вызовы
    window._atcTest.allFbqCalls.push(logEntry);

    // Детектируем AddToCart
    if (eventName === 'AddToCart') {
      window._atcTest.addToCartEvents.push(logEntry);
      
      const hasEventID = eventOptions && eventOptions.eventID;
      const hasContentIds = eventData && Array.isArray(eventData.content_ids) && eventData.content_ids.length > 0;
      const contentIds = hasContentIds ? eventData.content_ids : [];
      
      console.log(`%c🛒 AddToCart #${window._atcTest.addToCartEvents.length} [${relativeTime}ms]`, 'background: #10b981; color: white; font-weight: bold; padding: 3px;');
      console.log('  content_ids:', contentIds);
      console.log('  eventID:', hasEventID ? eventOptions.eventID : '❌ ОТСУТСТВУЕТ');
      console.log('  value:', eventData?.value);
      console.log('  currency:', eventData?.currency);
      
      // ПРОВЕРКА ПРАВИЛЬНОСТИ
      let issues = [];
      
      if (!hasEventID) {
        issues.push('❌ Нет eventID (может быть от Tilda)');
        window._atcTest.tildaEventDetected = true;
      }
      
      if (!hasContentIds) {
        issues.push('❌ Пустой content_ids');
      } else if (contentIds.length !== 1) {
        issues.push(`⚠️ content_ids содержит ${contentIds.length} элементов (должен быть 1)`);
      } else {
        // Проверяем правильность ID
        const actualId = contentIds[0];
        if (expectedExternalId && actualId === expectedExternalId) {
          issues.push('✅ content_ids ПРАВИЛЬНЫЙ');
        } else if (expectedExternalId) {
          issues.push(`❌ content_ids НЕПРАВИЛЬНЫЙ (ожидался ${expectedExternalId})`);
        }
      }
      
      if (window._atcTest.addToCartEvents.length > 1) {
        issues.push('⚠️ ДУБЛИКАТ! AddToCart уже был отправлен');
        window._atcTest.duplicateDetected = true;
      }
      
      console.log('%c  Проверки:', 'font-weight: bold;');
      issues.forEach(issue => console.log('    ' + issue));
      
      console.log('  Stack trace (откуда вызван):');
      const stackLines = logEntry.stack.split('\n').slice(1, 4);
      stackLines.forEach(line => console.log('    ' + line.trim()));
      console.log('');
    }

    // Вызываем оригинальный fbq
    return originalFbq.apply(this, arguments);
  };

  // Копируем свойства
  for (let prop in originalFbq) {
    if (originalFbq.hasOwnProperty(prop)) {
      window.fbq[prop] = originalFbq[prop];
    }
  }

  console.log('✅ Перехватчик установлен');
  console.log('   Все события fbq будут отслеживаться');
  console.log('');

  // ============================
  // 4. МОНИТОРИНГ TILDA СОБЫТИЙ
  // ============================
  console.log('%c👂 4. МОНИТОРИНГ TILDA СОБЫТИЙ', 'background: #3b82f6; color: white; padding: 5px; font-weight: bold;');
  
  document.addEventListener('tstore-cart-add', function(e) {
    console.log('%c📢 Tilda событие: tstore-cart-add', 'background: #8b5cf6; color: white; font-weight: bold; padding: 3px;');
    console.log('  Детали события:', e);
    console.log('  Время:', Date.now() - window._atcTest.startTime, 'ms от старта');
  }, true);

  console.log('✅ Listener для tstore-cart-add установлен');
  console.log('');

  // ============================
  // 5. ИНСТРУКЦИИ
  // ============================
  console.log('%c📝 5. ИНСТРУКЦИИ ДЛЯ ТЕСТА', 'background: #f59e0b; color: black; padding: 8px; font-weight: bold; font-size: 14px;');
  console.log('');
  console.log('СЕЙЧАС ВЫПОЛНИТЕ СЛЕДУЮЩИЕ ДЕЙСТВИЯ:');
  console.log('');
  console.log('1️⃣ Нажмите кнопку "ДОБАВИТЬ В КОРЗИНУ" на этой странице');
  console.log('   (Не переходите на другую страницу!)');
  console.log('');
  console.log('2️⃣ Подождите 2-3 секунды');
  console.log('');
  console.log('3️⃣ Выполните команду для просмотра результатов:');
  console.log('   %cshowAddToCartResults()', 'background: #10b981; color: white; padding: 2px 8px; font-weight: bold;');
  console.log('');

  // ============================
  // 6. ФУНКЦИЯ ДЛЯ ПРОСМОТРА РЕЗУЛЬТАТОВ
  // ============================
  window.showAddToCartResults = function() {
    console.log('');
    console.log('%c📊 РЕЗУЛЬТАТЫ ТЕСТА ADDTOCART', 'background: #dc2626; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
    console.log('⏰ Время теста:', Date.now() - window._atcTest.startTime, 'ms');
    console.log('');

    console.log('%c1. СТАТИСТИКА СОБЫТИЙ', 'background: #3b82f6; color: white; padding: 5px; font-weight: bold;');
    console.log('Всего вызовов fbq:', window._atcTest.allFbqCalls.length);
    console.log('Событий AddToCart:', window._atcTest.addToCartEvents.length);
    console.log('');

    if (window._atcTest.addToCartEvents.length === 0) {
      console.log('%c❌ КРИТИЧНО: AddToCart НЕ ОТПРАВЛЯЛСЯ!', 'background: #dc2626; color: white; padding: 8px; font-weight: bold; font-size: 14px;');
      console.log('');
      console.log('Возможные причины:');
      console.log('1. Кнопка "добавить в корзину" не была нажата');
      console.log('2. Обработчик события не сработал');
      console.log('3. Скрипт пикселя не загружен или не работает');
      console.log('');
      console.log('Все вызовы fbq за время теста:');
      console.table(window._atcTest.allFbqCalls);
      return;
    }

    console.log('%c2. ДЕТАЛЬНЫЙ АНАЛИЗ ADDTOCART СОБЫТИЙ', 'background: #3b82f6; color: white; padding: 5px; font-weight: bold;');
    console.log('');
    
    window._atcTest.addToCartEvents.forEach((event, idx) => {
      console.log(`%cСобытие #${idx + 1}:`, 'font-weight: bold; font-size: 13px;');
      console.log('  Время:', event.relativeTime);
      console.log('  content_ids:', event.data?.content_ids || '❌ ОТСУТСТВУЕТ');
      console.log('  eventID:', event.options?.eventID || '❌ ОТСУТСТВУЕТ');
      console.log('  value:', event.data?.value);
      console.log('  currency:', event.data?.currency);
      
      // АНАЛИЗ
      const hasEventID = event.options && event.options.eventID;
      const hasContentIds = event.data && Array.isArray(event.data.content_ids) && event.data.content_ids.length > 0;
      const isCorrectFormat = hasContentIds && event.data.content_ids.length === 1;
      const matchesExpected = hasContentIds && event.data.content_ids[0] === expectedExternalId;
      
      console.log('  %cАнализ:', 'font-weight: bold;');
      console.log('    EventID:', hasEventID ? '✅ Есть' : '❌ Нет (скорее всего от Tilda)');
      console.log('    Content IDs:', hasContentIds ? '✅ Есть' : '❌ Нет');
      console.log('    Формат:', isCorrectFormat ? '✅ Правильный (1 ID)' : '❌ Неправильный');
      if (expectedExternalId) {
        console.log('    Соответствие:', matchesExpected ? '✅ Правильный ID' : '❌ Неправильный ID');
      }
      
      console.log('  Stack trace (источник):');
      const stackLines = event.stack.split('\n').slice(2, 5);
      stackLines.forEach(line => console.log('    ' + line.trim()));
      console.log('');
    });

    console.log('%c3. ВЫВОДЫ И ДИАГНОЗ', 'background: #f59e0b; color: black; padding: 8px; font-weight: bold; font-size: 14px;');
    console.log('');

    if (window._atcTest.addToCartEvents.length === 1) {
      const event = window._atcTest.addToCartEvents[0];
      const hasEventID = event.options && event.options.eventID;
      const hasCorrectId = event.data?.content_ids?.[0] === expectedExternalId;
      
      if (hasEventID && hasCorrectId) {
        console.log('✅ ОТЛИЧНО: AddToCart отправлен ОДИН раз с правильными данными');
        console.log('✅ EventID присутствует (дедупликация работает)');
        console.log('✅ Content ID правильный');
        
        if (inCatalog === '✅ ДА') {
          console.log('✅ Товар ЕСТЬ в каталоге Meta');
          console.log('');
          console.log('%c🎯 ПРОБЛЕМА НЕ В КОДЕ!', 'background: #10b981; color: white; padding: 8px; font-weight: bold;');
          console.log('Событие отправлено правильно. Проверьте:');
          console.log('1. Meta Events Manager → Test Events (события приходят?)');
          console.log('2. Commerce Manager → Catalog → Settings → Event Sources (пиксель подключен?)');
          console.log('3. Подождите 24-48 часов для обновления Match Rate');
        } else {
          console.log('❌ Товар ОТСУТСТВУЕТ в каталоге Meta');
          console.log('');
          console.log('%c🎯 ПРОБЛЕМА: Товар не в каталоге!', 'background: #dc2626; color: white; padding: 8px; font-weight: bold;');
          console.log('Решение: Добавить этот товар в каталог Meta');
        }
      } else {
        console.log('⚠️ Событие отправлено, но есть проблемы:');
        if (!hasEventID) console.log('  ❌ Нет eventID');
        if (!hasCorrectId) console.log('  ❌ Неправильный content_ids');
      }
    } else if (window._atcTest.addToCartEvents.length > 1) {
      console.log('%c❌ ПРОБЛЕМА: ДУБЛИРОВАНИЕ СОБЫТИЙ!', 'background: #dc2626; color: white; padding: 8px; font-weight: bold;');
      console.log('');
      console.log(`AddToCart был отправлен ${window._atcTest.addToCartEvents.length} раза!`);
      console.log('');
      
      const withEventID = window._atcTest.addToCartEvents.filter(e => e.options?.eventID);
      const withoutEventID = window._atcTest.addToCartEvents.filter(e => !e.options?.eventID);
      
      console.log('С eventID (наши):', withEventID.length);
      console.log('Без eventID (Tilda?):', withoutEventID.length);
      console.log('');
      
      if (withoutEventID.length > 0) {
        console.log('🎯 ДИАГНОЗ: Tilda дублирует события AddToCart');
        console.log('');
        console.log('Tilda отправляет свои события без:');
        console.log('  • eventID');
        console.log('  • Или с пустым content_ids');
        console.log('');
        console.log('Это затирает наши правильные события → Match Rate 0%');
        console.log('');
        console.log('РЕШЕНИЕ:');
        console.log('1. Убедиться что v16.1 установлен (eventID должен помочь)');
        console.log('2. Возможно нужно отключить автоматические события Tilda в настройках');
      }
    }

    console.log('');
    console.log('%c4. ПОЛНАЯ ТАБЛИЦА СОБЫТИЙ', 'background: #3b82f6; color: white; padding: 5px; font-weight: bold;');
    console.table(window._atcTest.addToCartEvents.map(e => ({
      'Время': e.relativeTime,
      'content_ids': e.data?.content_ids?.join(', ') || 'НЕТ',
      'eventID': e.options?.eventID ? 'ДА' : 'НЕТ',
      'value': e.data?.value,
      'currency': e.data?.currency
    })));

    console.log('');
    console.log('%c✅ АНАЛИЗ ЗАВЕРШЁН', 'background: #10b981; color: white; padding: 8px; font-size: 14px; font-weight: bold;');
  };

  console.log('%c✅ ДИАГНОСТИКА ГОТОВА', 'background: #10b981; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
  console.log('');
  console.log('⏳ Ожидаю действия: Добавьте товар в корзину...');
  console.log('');
})();


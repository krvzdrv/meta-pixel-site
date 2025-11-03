// Diagnostics v2 — run in DevTools console
(function(){'use strict';
  console.log('%c🔍 META PIXEL EXTENDED DIAGNOSTICS v2','background:#667eea;color:#fff;padding:10px;font-size:16px;font-weight:bold;');
  console.log('Timestamp:', new Date().toISOString());
  console.log('URL:', window.location.href);
  const pageType={isProductPage:!!document.querySelector('[data-product-gen-uid][data-product-uid]'),isThankyouPage:!!document.querySelector('.t-store__thankyoupage'),isCartPage:location.href.includes('/cart')||!!document.querySelector('.t-store__cart'),isCheckoutPage:!!document.querySelector('.t-store__checkout-form')};
  console.log('📄 Product:',pageType.isProductPage?'✅':'❌');
  console.log('🎉 Thankyou:',pageType.isThankyouPage?'✅':'❌');
  if(typeof window.tcart!=='undefined'){console.log('✅ tcart OK');console.log('📦 items:',(window.tcart.products||[]).length,'💰 total:',window.tcart.total||0,'🆔 orderid:',window.tcart.orderid||'—');}else{console.log('❌ tcart missing');}
  if(typeof fbq!=='undefined'){
    if(!window._fbqInterceptorInstalled){const o=window.fbq;window._fbqEventLog=[];window.fbq=function(){const t=arguments[0],n=arguments[1],d=arguments[2];window._fbqEventLog.push({ts:new Date().toISOString(),type:t,name:n,data:d});console.log('%c📤 fbq EVENT:','background:#3b82f6;color:#fff;font-weight:bold;padding:3px;',n);console.log('  Type:',t);console.log('  Data:',d);return o.apply(this,arguments)};window._fbqInterceptorInstalled=true;console.log('✅ fbq interceptor installed');}else{console.log('✅ fbq interceptor already on');}
  } else {console.log('❌ fbq NOT loaded');}
  if(typeof window.productCatalogMapping!=='undefined'){const keys=Object.keys(window.productCatalogMapping);console.log('✅ Mapping loaded. Parents:',keys.length);let tv=0;keys.forEach(k=>{tv+=Object.keys(window.productCatalogMapping[k].variants).length});console.log('🔢 total variants:',tv)} else {console.log('❌ Mapping missing');}
  if(pageType.isProductPage){const el=document.querySelector('[data-product-gen-uid][data-product-uid]');const pu=el&&el.getAttribute('data-product-gen-uid');const vu=el&&el.getAttribute('data-product-uid');console.log('🏷️ parent:',pu,' variant:',vu);if(window.productCatalogMapping&&window.productCatalogMapping[pu]){const m=window.productCatalogMapping[pu];const vid=m.variants[vu]||m.group;console.log('✅ content_ids:',[m.group,vid]);}}
  if(window.savedCartForPurchase){console.log('✅ savedCartForPurchase:',window.savedCartForPurchase)} else {console.log('ℹ️ savedCartForPurchase not present yet');}
})();

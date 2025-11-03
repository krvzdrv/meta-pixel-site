# Meta Pixel Scripts for Alumineu (Tilda)

Production-ready Meta Pixel scripts for three locales (PL/DE/RO) with support for:
- ViewContent, AddToCart, InitiateCheckout (DOM + click), Purchase (submit/success/tstore/thankyou)
- Snapshot before Tilda clears `window.tcart` (popup-checkout)
- Local backup in `localStorage` with restore on Thank You
- Fallback mapping (variant → group), eventID uses `orderid` when present
- Auto-currency by domain (.pl PLN, .de EUR, .ro RON)

## Repository layout
- `dist/` — Ready-to-paste scripts per locale and tools
  - `dist/pl/pixel.v15.pl.js` — Polish site (alumineu.pl)
  - `dist/de/` — German site (placeholder)
  - `dist/ro/` — Romanian site (placeholder)
  - `dist/tools/diagnostics_v2.js` — Diagnostics (DevTools console)
- `src/` — Sources for future changes
  - `src/pl/` — Polish sources
  - `src/de/`, `src/ro/` — Placeholders for future scripts
  - `src/diagnostics/diagnostics_v2.js` — Diagnostics source

## Usage
1. Open Tilda → Site Settings → More → Additional HTML → paste the locale script into "Before </head>".
2. Use the Diagnostics script: open DevTools Console on product/checkout/thankyou pages and paste `dist/tools/diagnostics_v2.js` content to inspect events/mapping/cart.
3. Verify events in Events Manager → Test Events. Match Rate should stay ≥50% for Shops.

## Updating mapping
- Each locale may have different Tilda UIDs but the same Meta catalog External IDs.
- Edit the locale script under `src/<locale>/` and copy changes into `dist/<locale>/`.
- Keep the content_ids order: `[groupId, variantId]`.

## Roadmap
- Add `dist/de/pixel.v15.de.js` and `dist/ro/pixel.v15.ro.js` with locale currency and mapping.
- Optional: extract common helpers into `src/core/` and unify locale variants via small build script.

## License
MIT

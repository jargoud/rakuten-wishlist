# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres
to [Semantic Versioning](http://semver.org/).

## [1.2.0] - 2026-06-14

### Added

- Manifest V3 migration (`service_worker`, `scripting` API, `chrome.action`)
- XSS protection via `escHtml()` and `safeUrl()` helpers on all dynamic HTML
- `rel="noopener noreferrer"` on external links
- SRI integrity attribute on Bootstrap Icons CDN link
- `minProductsPlaceholder` i18n key (EN + FR)
- `openOrReloadWishlist` opens wishlist tab if not already open after adding product
- Guard against duplicate `onMessage` listener registration in `content.js`
- IIFE wrapper in `wishlist.js` to avoid global scope pollution

### Changed

- `removeProductFromWishlist` reads storage fresh instead of using stale in-memory wishlist
- `addSubmitButtonListener` reads storage fresh on submit
- `getProductsGroupedBySeller` now receives filters as parameter instead of reading DOM directly
- Seller URL built dynamically from product origin with `encodeURIComponent`
- Price filter changed from `>= maxPrice` to `> maxPrice` (inclusive boundary fix)
- `price.toFixed(2)` for consistent price display
- `element.textContent` instead of `innerHTML` for JSON parsing in `content.js`
- `defer` attribute added to wishlist script tag
- `lang="fr"` added to `<html>` tag

### Fixed

- Context menu items missing `contexts: ["page"]`
- `documentUrlPatterns` spread conditionally to avoid passing `undefined`
- Null-safe optional chaining on product data fields in `content.js`
- `chrome.runtime.lastError` checks on storage writes
- `viewWishlist` debounced with `viewWishlistPending` flag to prevent duplicate tabs

## [1.1.0] - 2025-02-13

### Added

- English translations
- French translations
- Duplicates filter switch

## [1.0.0] - 2025-02-12

Initial version.

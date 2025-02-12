# Rakuten Wishlist Extension

Rakuten Wishlist is a browser extension for Chrome and Firefox that allows users to save products from Rakuten into a
wishlist. The extension groups products by seller and provides filtering options by price.

## Features

- **Add products** from Rakuten product pages with one click
- **View wishlist** in a dedicated UI
- **Group products** by seller for easy comparison
- **Set a maximum price filter** to refine results

## Installation

### Chrome

1. Download the source code or clone the repository:
   ```sh
   git clone https://github.com/YOUR_GITHUB_USERNAME/rakuten-wishlist-extension.git
   ```
2. Open **chrome://extensions/** in Chrome.
3. Enable **Developer mode** (toggle in the top right corner).
4. Click **Load unpacked** and select the extension folder.
5. The Rakuten Wishlist extension is now installed!

### Firefox

1. Download the source code or clone the repository:
   ```sh
   git clone https://github.com/YOUR_GITHUB_USERNAME/rakuten-wishlist-extension.git
   ```
2. Open **about:debugging** in Firefox.
3. Click **This Firefox** (or **This Nightly**, depending on your version).
4. Click **Load Temporary Add-on...**.
5. Select the `manifest.json` file inside the extension folder.
6. The extension is now available for testing (note: temporary add-ons are removed when Firefox restarts).

## Usage

1. Navigate to a product page on Rakuten.
2. Right click in the page, then choose *Rakuten Wishlist > Add to wishlist*  in the contextual menu.
3. The product is added to your wishlist.
4. Click the **Rakuten Wishlist** icon in the browser toolbar or right click in the page, then choose *Rakuten
   Wishlist > Show wishlist*, to view your wishlist.
5. **Products list** tab shows all your listed products and **Sellers** tab allows you to search and filters products by
   seller.

## Permissions

This extension requires the following permissions:

- **Context menus**: To add a right-click menu for quick actions.
- **Storage**: To save the wishlist locally.
- **Active tab**: To interact with the currently active tab.

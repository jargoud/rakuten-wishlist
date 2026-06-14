/**
 * @returns {Object}
 */
function extractProductData() {
    const element = document.getElementById('ggrc');

    if (!element) {
        throw new Error('No product found.');
    }

    let data;
    try {
        data = JSON.parse(element.textContent);
    } catch (e) {
        throw new Error('Product data is malformed.');
    }

    return {
        mpn: data.mpn ?? '',
        sku: data.sku ?? '',
        name: data.name ?? '',
        brand: data.brand?.name ?? '',
        offers: data.offers?.offers ?? [],
        url: data.url ?? '',
    };
}

if (!window.__rakutenWishlistLoaded) {
    window.__rakutenWishlistLoaded = true;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "getProduct") {
            try {
                sendResponse({product: extractProductData()});
            } catch (e) {
                sendResponse({error: e.message});
            }
        }
    });
}

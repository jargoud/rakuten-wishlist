/**
 * @returns {Object}
 */
function extractProductData() {
    const element = document.getElementById('ggrc');

    if (!element) {
        throw new Error('No product found.');
    }

    const data = JSON.parse(element.innerHTML);

    return {
        mpn: data.mpn,
        sku: data.sku,
        name: data.name,
        brand: data.brand.name,
        offers: data.offers.offers,
        url: data.url,
    };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getProduct") {
        sendResponse(extractProductData());
    }
});

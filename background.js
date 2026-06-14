chrome.runtime.onInstalled.addListener(() => {
    const parentId = "wishlistMenu";

    createContextMenu({
        id: parentId,
        title: "Rakuten Wishlist",
        contexts: ["page"],
        documentUrlPatterns: ["*://*.shopping.rakuten.com/*"]
    });

    createContextMenu({
        id: "addToWishlist",
        title: chrome.i18n.getMessage('addToWishlist'),
        contexts: ["page"],
        parentId,
    });

    createContextMenu({
        id: "viewWishlist",
        title: chrome.i18n.getMessage('openWishlist'),
        contexts: ["page"],
        parentId,
    });
});

function createContextMenu({id, title, contexts, parentId = null, documentUrlPatterns = null}) {
    chrome.contextMenus.create({
        id,
        parentId,
        title,
        contexts,
        ...(documentUrlPatterns && {documentUrlPatterns}),
    });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "addToWishlist") {
        addToWishlist(tab);
    } else if (info.menuItemId === "viewWishlist") {
        viewWishlist();
    }
});

function addToWishlist(tab) {
    chrome.scripting.executeScript({target: {tabId: tab.id}, files: ["content.js"]}, () => {
        if (chrome.runtime.lastError) {
            console.error('Could not inject content script:', chrome.runtime.lastError);
            return;
        }

        chrome.tabs.sendMessage(tab.id, {action: "getProduct"}, (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }

            if (response?.error) {
                console.error('Could not extract product:', response.error);
                return;
            }

            const product = response?.product;

            if (product) {
                chrome.storage.local.get({wishlist: []}, (data) => {
                    const wishlist = data.wishlist;
                    const index = wishlist.findIndex((item) => item.sku === product.sku);

                    if (index >= 0) {
                        wishlist[index] = product;
                    } else {
                        wishlist.push(product);
                    }

                    chrome.storage.local.set({wishlist}, () => {
                        if (chrome.runtime.lastError) {
                            console.error('Failed to save wishlist:', chrome.runtime.lastError);
                            return;
                        }
                        openOrReloadWishlist();
                    });
                });
            }
        });
    });
}

let viewWishlistPending = false;

function viewWishlist() {
    if (viewWishlistPending) return;
    viewWishlistPending = true;

    chrome.tabs.query({}, (tabs) => {
        viewWishlistPending = false;
        const existingTab = getExistingTab(tabs);

        if (existingTab) {
            chrome.tabs.update(existingTab.id, {active: true});
        } else {
            chrome.tabs.create({url: getPopupUrl()});
        }
    });
}

function getPopupUrl() {
    return chrome.runtime.getURL("pages/wishlist.html");
}

function getExistingTab(tabs) {
    return tabs.find(tab => tab.url === getPopupUrl());
}

chrome.action.onClicked.addListener(() => {
    viewWishlist();
});

function openOrReloadWishlist() {
    chrome.tabs.query({}, (tabs) => {
        const existingTab = getExistingTab(tabs);

        if (existingTab) {
            chrome.tabs.reload(existingTab.id);
            chrome.tabs.update(existingTab.id, {active: true});
        } else {
            chrome.tabs.create({url: getPopupUrl()});
        }
    });
}

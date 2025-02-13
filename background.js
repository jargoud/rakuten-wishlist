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
        parentId,
    });

    createContextMenu({
        id: "viewWishlist",
        title: chrome.i18n.getMessage('openWishlist'),
        parentId,
    });
});

function createContextMenu({id, title, contexts, parentId = null, documentUrlPatterns = null}) {
    chrome.contextMenus.create({
        id,
        parentId,
        title,
        contexts,
        documentUrlPatterns,
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
    chrome.tabs.executeScript(tab.id, {file: "content.js"}, () => {
        chrome.tabs.sendMessage(tab.id, {action: "getProduct"}, (product) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }

            if (product) {
                chrome.storage.local.get({wishlist: []}, (data) => {
                    const wishlist = data.wishlist;
                    const index = wishlist.findIndex(
                        (item) => item.sku === product.sku
                    );

                    if (index >= 0) {
                        data.wishlist[index] = product;
                    } else {
                        wishlist.push(product);
                    }

                    chrome.storage.local.set({wishlist});

                    reloadTabIfOpened();
                });
            }
        });
    });
}

function viewWishlist() {
    chrome.tabs.query({}, (tabs) => {
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

chrome.browserAction.onClicked.addListener(() => {
    viewWishlist();
});

function reloadTabIfOpened() {
    chrome.tabs.query({}, (tabs) => {
        const existingTab = getExistingTab(tabs);

        if (existingTab) {
            chrome.tabs.reload(existingTab.id);
        }
    });
}

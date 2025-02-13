const HIDDEN_CLASS = 'visually-hidden';
const REMOVE_PRODUCT_BUTTON_CLASS = 'remove-product-button';

document.addEventListener("DOMContentLoaded", () => {
    addNavListeners();

    const wishlistContainer = document.getElementById("wishlist-container");

    chrome.storage.local.get({wishlist: []}, (data) => {
        const wishlist = data.wishlist;

        if (wishlist.length === 0) {
            wishlistContainer.innerHTML = `<p>${getMessage('emptyWishlist')}</p>`;
            return;
        }

        wishlistContainer.innerHTML = getWishlistTableDOM(wishlist, REMOVE_PRODUCT_BUTTON_CLASS);

        addRemoveProductButtonsListeners(wishlist);
        addClearProductsButtonListener();
        addSubmitButtonListener(wishlist);
    });

    loadTranslations();
});

function addNavListeners() {
    getNavLinks().forEach(button => {
        button.addEventListener('click', () => {
            hideAllSections();
            showSection(button.dataset.target);
            activateNavLink(button);
        })
    });
}

/**
 * @returns {NodeListOf<Element>}
 */
function getNavLinks() {
    return document.querySelectorAll('.nav-link');
}

function hideAllSections() {
    getNavLinks().forEach(button => {
        document.getElementById(button.dataset.target).classList.add(HIDDEN_CLASS);
    });
}

/**
 * @param {String} id
 */
function showSection(id) {
    document.getElementById(id).classList.remove(HIDDEN_CLASS);
}

/**
 * @param {Element} activeButton
 */
function activateNavLink(activeButton) {
    const ACTIVE_CLASS = 'active';

    getNavLinks().forEach(button => {
        button.classList.remove(ACTIVE_CLASS);
        button.removeAttribute('aria-current');
    });

    activeButton.classList.add(ACTIVE_CLASS);
    activeButton.setAttribute('aria-current', 'page');
}

/**
 *
 * @param {Array} wishlist
 * @param {string} removeProductButtonClass
 * @returns {string}
 */
function getWishlistTableDOM(wishlist, removeProductButtonClass) {
    return `${wishlist
        .sort((firstProduct, secondProduct) => firstProduct.name.localeCompare(secondProduct.name))
        .map(product => `<tr>
    <td>${product.mpn}</td>
    <td>${product.sku}</td>
    <td><em>${product.name}</em>, ${product.brand}</td>
    <td>
        <a href="${product.url}"
           target="_blank"
           class="btn btn-outline-primary"
           title="${getMessage('openProductPage')}">
            <i class="bi bi-box-arrow-up-right"></i>
        </a>
        <button class="btn btn-outline-primary ${removeProductButtonClass}"
                data-name="${product.name}"
                data-sku="${product.sku}"
                title="${getMessage('removeProductLabel')}"
                type="button"
        >
            <i class="bi bi-trash"></i>
        </button>
    </td>
</tr>`).join("")}`;
}

/**
 * @param {Array} wishlist
 */
function addRemoveProductButtonsListeners(wishlist) {
    document.querySelectorAll(`.${REMOVE_PRODUCT_BUTTON_CLASS}`).forEach(button => {
        button.addEventListener("click", () => {
            if (confirm(getMessage('removeProductConfirmationMessage', button.dataset.name))) {
                removeProductFromWishlist(wishlist, button.dataset.sku);
            }
        });
    });
}

function addClearProductsButtonListener() {
    document.getElementById("clear-products-button").addEventListener("click", () => {
        if (confirm(getMessage('clearWishlistConfirmationMessage'))) {
            clearWishlist();
        }
    });
}

function clearWishlist() {
    chrome.storage.local.set({wishlist: []}, () => {
        location.reload();
    });
}

function addSubmitButtonListener(wishlist) {
    document.getElementById("submit").addEventListener("click", (event) => {
        event.preventDefault();

        generateReport(wishlist);
    });
}

/**
 * @param {Array} wishlist
 * @param {string} sku
 */
function removeProductFromWishlist(wishlist, sku) {
    const newWishlist = wishlist.filter(product => product.sku !== sku);

    chrome.storage.local.set({wishlist: newWishlist}, () => {
        location.reload();
    });
}

/**
 * @param {Array} wishlist
 */
function generateReport(wishlist) {
    const reportContainer = document.getElementById("sellers-container");

    if (wishlist.length === 0) {
        reportContainer.innerHTML = `<p>${getMessage('emptyWishlist')}</p>`;
        return;
    }

    reportContainer.innerHTML = getReportDOM(wishlist);
}

/**
 * @param {Array} wishlist
 * @return {string}
 */
function getReportDOM(wishlist) {
    return `${getProductsGroupedBySeller(wishlist)
        .sort((firstSeller, secondSeller) => secondSeller.products.length - firstSeller.products.length)
        .map(seller => `<div class="card mb-3">
    <div class="card-body">
        <h2 class="card-title mb-3">
            ${getMessage('sellerCardTitle')}
            <a href="${seller.url}" target="_blank">${seller.name}</a>
            ${seller.type === 'Organization' ? `<i class="bi bi-star ms-2" title="${getMessage('professional')}"></i>` : ""}
        </h2>
        <ul class="list-group">
            ${seller
            .products
            .sort((firstProduct, secondProduct) => firstProduct.name.localeCompare(secondProduct.name))
            .map(product => `<li class="list-group-item d-flex justify-content-between align-items-center">
    <div class="me-auto">${product.name}</div>
    <span class="badge text-bg-secondary rounded-pill">${product.itemCondition}</span>
    <span class="badge text-bg-primary rounded-pill ms-2">${product.price} €</span>
</li>`).join('')}
        </ul>
    </div>
</div>`).join("")}`;
}

/**
 * @param {Array} wishlist
 * @return {Array}
 */
function getProductsGroupedBySeller(wishlist) {
    const maxPrice = parseFloat(document.getElementById("maxPrice").value);
    const minProducts = parseInt(document.getElementById("minProducts").value);
    const shouldFilterDuplicates = document.getElementById("filterDuplicates").checked;

    return Object.values(
        wishlist.reduce((acc, product) => {
            const indexes = {};

            product.offers.forEach(offer => {
                const price = parseFloat(offer.price);

                if (price >= maxPrice) {
                    return;
                }

                const key = offer.seller.name;

                if (typeof indexes[key] === 'number' && shouldFilterDuplicates) {
                    if (acc[key].products[indexes[key]].price > price) {
                        acc[key].products[indexes[key]].price = price;
                    }

                    return;
                }

                acc[key] ??= {
                    name: offer.seller.name,
                    type: offer.seller['@type'],
                    products: [],
                    url: `https://fr.shopping.rakuten.com/boutique/${offer.seller.name}`
                };

                indexes[key] = acc[key].products.length;

                acc[key].products.push({
                    mpn: product.mpn,
                    sku: product.sku,
                    name: product.name,
                    brand: product.brand.name,
                    url: product.url,
                    price: price,
                    itemCondition: offer.itemCondition,
                });
            })

            return acc;
        }, {}),
    ).filter(
        seller => seller.products.length >= minProducts,
    );
}

function loadTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(
        element => {
            element.textContent = getMessage(element.dataset.i18n);
        }
    )

    document.querySelectorAll('[data-i18n-placeholder]').forEach(
        element => {
            element.setAttribute(
                'placeholder',
                getMessage(element.dataset.i18nPlaceholder)
            );
        }
    )
}

/**
 * @param {string} key
 * @param {Array<string>} placeholders
 * @returns {string}
 */
function getMessage(key, ...placeholders) {
    return chrome.i18n.getMessage(key, ...placeholders);
}

// Shop for enloe.net. Loads products.json, renders cards, cart in localStorage.
// No prices or payment links are invented here: a product with
// price_cents === null or stripe_payment_link === "" is not purchasable,
// and checkout stays disabled until those are added to products.json.

const CART_KEY = "enloe-shop-cart-v1";
const CHECKOUT_DISABLED_TEXT = "Checkout opens once Stripe payment links and prices are added. Email me about a shirt in the meantime.";

let products = [];

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    // Storage unavailable (private mode, etc.). Cart still works in memory.
  }
}

let cart = loadCart();

function formatPriceCents(cents) {
  if (cents === null || cents === undefined) return null;
  return "$" + (cents / 100).toFixed(2);
}

function productById(id) {
  return products.find((p) => p.id === id);
}

function cartSubtotalCents() {
  let total = 0;
  for (const item of cart) {
    const product = productById(item.id);
    if (!product || product.price_cents === null || product.price_cents === undefined) return null;
    total += product.price_cents * item.qty;
  }
  return total;
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  grid.replaceChildren();

  if (products.length === 0) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "No shirts listed yet.";
    grid.appendChild(p);
    return;
  }

  for (const product of products) {
    const card = document.createElement("article");
    card.className = "shop-card";

    const visual = document.createElement("div");
    visual.className = "shop-visual";
    const label = document.createElement("span");
    label.className = "visual-label";
    label.textContent = "TIE-DYE · HAND-DYED";
    visual.appendChild(label);
    if (product.image) {
      const img = document.createElement("img");
      img.src = product.image;
      img.alt = product.name;
      visual.appendChild(img);
    }
    card.appendChild(visual);

    const meta = document.createElement("div");
    meta.className = "card-meta";
    const metaLeft = document.createElement("span");
    metaLeft.textContent = product.available ? "AVAILABLE" : "COMING SOON";
    const metaRight = document.createElement("span");
    metaRight.textContent = "100% COTTON";
    meta.appendChild(metaLeft);
    meta.appendChild(metaRight);
    card.appendChild(meta);

    const title = document.createElement("h3");
    title.textContent = product.name;
    card.appendChild(title);

    const desc = document.createElement("p");
    desc.textContent = product.description;
    card.appendChild(desc);

    const price = document.createElement("p");
    price.className = "shop-price";
    price.textContent = formatPriceCents(product.price_cents) || product.price_display || "Price coming tonight";
    card.appendChild(price);

    const controls = document.createElement("div");
    controls.className = "shop-controls";

    const sizeLabel = document.createElement("label");
    sizeLabel.textContent = "Size";
    const sizeSelect = document.createElement("select");
    sizeSelect.setAttribute("aria-label", "Size for " + product.name);
    for (const size of product.sizes || ["S", "M", "L", "XL"]) {
      const option = document.createElement("option");
      option.value = size;
      option.textContent = size;
      sizeSelect.appendChild(option);
    }
    sizeLabel.appendChild(sizeSelect);
    controls.appendChild(sizeLabel);

    const qtyLabel = document.createElement("label");
    qtyLabel.textContent = "Qty";
    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.max = "10";
    qtyInput.value = "1";
    qtyInput.setAttribute("aria-label", "Quantity for " + product.name);
    qtyLabel.appendChild(qtyInput);
    controls.appendChild(qtyLabel);
    card.appendChild(controls);

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "button button-primary shop-add";
    const purchasable = product.available && product.price_cents !== null && product.price_cents !== undefined;
    addButton.disabled = !purchasable;
    addButton.textContent = purchasable ? "Add to cart" : "Not available yet";
    addButton.addEventListener("click", () => {
      const qty = Math.max(1, Math.min(10, parseInt(qtyInput.value, 10) || 1));
      addToCart(product.id, sizeSelect.value, qty);
    });
    card.appendChild(addButton);

    grid.appendChild(card);
  }
}

function addToCart(id, size, qty) {
  const existing = cart.find((item) => item.id === id && item.size === size);
  if (existing) {
    existing.qty = Math.min(10, existing.qty + qty);
  } else {
    cart.push({ id, size, qty });
  }
  saveCart(cart);
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function updateQty(index, qty) {
  const value = Math.max(1, Math.min(10, parseInt(qty, 10) || 1));
  cart[index].qty = value;
  saveCart(cart);
  renderCart();
}

function renderCart() {
  const list = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("cart-subtotal");
  const checkoutButton = document.getElementById("checkout-button");
  const checkoutNote = document.getElementById("checkout-note");
  if (!list || !subtotalEl || !checkoutButton) return;
  list.replaceChildren();

  if (cart.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted cart-empty";
    empty.textContent = "Your cart is empty.";
    list.appendChild(empty);
  }

  cart.forEach((item, index) => {
    const product = productById(item.id);
    const row = document.createElement("div");
    row.className = "cart-item";

    const info = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = product ? product.name : item.id;
    info.appendChild(name);
    const detail = document.createElement("p");
    detail.className = "muted";
    const unit = product ? (formatPriceCents(product.price_cents) || product.price_display || "") : "";
    detail.textContent = "Size " + item.size + (unit ? " · " + unit : "");
    info.appendChild(detail);
    row.appendChild(info);

    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.max = "10";
    qtyInput.value = String(item.qty);
    qtyInput.setAttribute("aria-label", "Quantity");
    qtyInput.addEventListener("change", () => updateQty(index, qtyInput.value));
    row.appendChild(qtyInput);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "button button-quiet cart-remove";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeFromCart(index));
    row.appendChild(removeButton);

    list.appendChild(row);
  });

  const subtotal = cartSubtotalCents();
  subtotalEl.textContent = cart.length === 0 ? "$0.00" : (subtotal === null ? "TBD" : formatPriceCents(subtotal));

  // Checkout is only enabled when every cart item has a real Stripe
  // payment link and a real price. Today that is never true: the only
  // product has price_cents null and stripe_payment_link "".
  const allHaveLinks = cart.length > 0 && cart.every((item) => {
    const product = productById(item.id);
    return product && product.stripe_payment_link && product.price_cents !== null && product.price_cents !== undefined;
  });
  checkoutButton.disabled = !allHaveLinks;
  checkoutButton.textContent = allHaveLinks ? "Checkout" : CHECKOUT_DISABLED_TEXT;
  if (checkoutNote) {
    checkoutNote.hidden = allHaveLinks;
  }
}

function checkout() {
  if (cart.length === 0) return;
  const links = cart
    .map((item) => productById(item.id))
    .filter((product) => product && product.stripe_payment_link)
    .map((product) => product.stripe_payment_link);
  if (links.length === 0) return;
  // Each product carries its own Stripe Payment Link; with one product
  // in the cart this goes straight to its checkout.
  window.location.href = links[0];
}

async function initShop() {
  const grid = document.getElementById("product-grid");
  try {
    const response = await fetch("products.json");
    if (!response.ok) throw new Error("products.json not found");
    products = await response.json();
  } catch (e) {
    if (grid) {
      grid.replaceChildren();
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "Shirts could not be loaded right now. Try refreshing the page.";
      grid.appendChild(p);
    }
    products = [];
  }
  renderProducts();
  renderCart();
  const checkoutButton = document.getElementById("checkout-button");
  if (checkoutButton) checkoutButton.addEventListener("click", checkout);
}

document.addEventListener("DOMContentLoaded", initShop);

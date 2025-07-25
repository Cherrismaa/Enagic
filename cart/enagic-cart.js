const productMap = {
  jriv: { name: "Leveluk JR IV", price: 220000, img: "store/jr4.png", category: "machines" },
  sd501: { name: "Leveluk SD501", price: 277000, img: "store/SD501.png", category: "machines" },
  sd501dx: { name: "Leveluk SD501 DX", price: 311000, img: "store/sd501dx.jpg", category: "machines" },
  sd501platinum: { name: "Leveluk SD501 Platinum", price: 277000, img: "store/sd501platinum.jpg", category: "machines" },
  k8: { name: "Leveluk K8 Machine", price: 343000, img: "store/k8.png", category: "machines" },
  super501: { name: "Leveluk Super 501", price: 397000, img: "store/super501.png", category: "machines" },
  Anespadx: { name: "Anespa DX", price: 200000, img: "store/anespa.jpg", category: "machines" },

  fc1: { name: "FC1 Filter", price: 10500, img: "store/filter-fc1.png", category: "filters" },
  hg: { name: "HG Filter", price: 8000, img: "store/hg-super501-filter.jpg", category: "filters" },
  "anespa-external-filter": { name: "Anespa External Filter", price: 7000, img: "store/anespa_external_filter.png", category: "filters" },
  "anespa-ceramic-filter": { name: "Anespa Ceramic Filter", price: 18800, img: "store/anespa_ceramic_filter.png", category: "filters" },
  "fc1-30": { name: "FC1 Filters set of 30", price: 242537, img: "store/fc1-30.jpg", category: "filters" },
  "fc1-50": { name: "FC1 Filters set of 50", price: 393731, img: "store/fc1.jpg", category: "filters" },

  "1lt-water-bottle": { name: "1L Tritan Water Bottle", price: 1100, img: "store/new_water_bottle_1l_tritan.png", category: "supplies" },
  "2.2lt-water-bottle": { name: "2.2L PETG Water Bottle", price: 1650, img: "store/2.2l_petg_water_bottle.png", category: "supplies" },
  "water-bag": { name: "Water Bag", price: 1100, img: "store/water_bag.png", category: "supplies" },
  enhancer: { name: "Electrolysis Enhancer", price: 240, img: "store/electrolysis_enhancer.png", category: "supplies" },
  "e-cleaner-unitset": { name: "E-Cleaner Unit Set (old)", price: 2250, img: "store/eclennarunitset.jpg", category: "supplies" },
  "e-cleaner-unitset-new": { name: "E-Cleaner Unit Set New", price: 2250, img: "store/e-cleaner_unit_set_-_new.png", category: "supplies" }
};

const machineFreeItems = {
  super501: "hg",
  Anespadx: "anespa-external-filter",
  default: "fc1"
};

function showMessage(msg) {
  const el = document.createElement("div");
  el.className = "cart-message";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

async function loadCart() {
  const res = await fetch("http://localhost:5000/api/cart");
  const cartItems = await res.json();
  const tbody = document.getElementById("cart-body");
  const suggestions = document.getElementById("suggestions");
  const cartTable = document.getElementById("cart-table");
  const cartActions = document.getElementById("cart-actions");
  const cartCountEl = document.getElementById("cart-count");
  const grandTotalEl = document.getElementById("grand-total");
  const emptyCart = document.getElementById("cart-empty");

  // Reset all dynamic prices
  productMap["fc1"].price = 10500;
  productMap["hg"].price = 8000;
  productMap["anespa-external-filter"].price = 7000;
  productMap["1lt-water-bottle"].price = 1100;

  // Track state
  const cartIds = cartItems.map(i => i.productId);
  const machines = cartItems.filter(i => productMap[i.productId]?.category === "machines");
  const filterQty = cartItems.filter(i => productMap[i.productId]?.category === "filters")
                             .reduce((sum, i) => sum + i.quantity, 0);
  const hasBottle = cartIds.includes("1lt-water-bottle");

  tbody.innerHTML = "";
  suggestions.innerHTML = "";
  let totalItems = 0;
  let grandTotal = 0;

  // Auto-add free filters & bottles per machine
  for (const machine of machines) {
    const filterId = machineFreeItems[machine.productId] || machineFreeItems.default;
    if (!cartIds.includes(filterId)) await addFreeItem(filterId);
    if (!cartIds.includes("1lt-water-bottle")) await addFreeItem("1lt-water-bottle");
    productMap[filterId].price = 0;
    productMap["1lt-water-bottle"].price = 0;
    showMessage(`You added ${productMap[machine.productId].name}. So ${productMap[filterId].name} and Bottle are free.`);
  }

  // If bottle is there & not free, apply discount
  if (!machines.length && hasBottle) {
    if (filterQty >= 2) {
      productMap["1lt-water-bottle"].price = Math.round(1100 * 0.8);
      showMessage("1L Bottle is 20% off.");
    } else if (filterQty === 1) {
      productMap["1lt-water-bottle"].price = Math.round(1100 * 0.9);
      showMessage("1L Bottle is 10% off.");
    }
  }

  for (const item of cartItems) {
    const p = productMap[item.productId];
    if (!p) continue;
    const valid = typeof p.price === "number";
    const itemTotal = valid ? p.price * item.quantity : "Coming Soon";
    if (valid) grandTotal += itemTotal;
    totalItems += item.quantity;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${p.name}</td>
      <td><img src="${p.img}" class="cart-img"></td>
      <td>
        <div class="quantity-controls">
          <button onclick="updateQty('${item.productId}', -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="updateQty('${item.productId}', 1)">+</button>
        </div>
      </td>
      <td>${valid ? `₹${p.price.toLocaleString()}` : p.price}</td>
      <td>${valid ? `₹${itemTotal.toLocaleString()}` : p.price}</td>
      <td><button class="remove-btn" onclick="removeFromCart('${item.productId}')">Remove</button></td>
    `;
    tbody.appendChild(row);
  }

  if (cartItems.length === 0) {
    emptyCart.style.display = "block";
    cartTable.style.display = "none";
    cartActions.style.display = "none";
    cartCountEl.textContent = "0";
    return;
  }

  emptyCart.style.display = "none";
  cartTable.style.display = "table";
  cartActions.style.display = "flex";
  cartCountEl.textContent = totalItems;
  grandTotalEl.textContent = grandTotal.toLocaleString();

  suggestions.innerHTML = `
    <p>Would you like to explore more products?</p>
    <button onclick="window.location.href='store.html'">Go to Store</button>
  `;
}

async function addFreeItem(productId) {
  productMap[productId].price = 0;
  await fetch("http://localhost:5000/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity: 1 })
  });
}

async function updateQty(productId, delta) {
  const res = await fetch("http://localhost:5000/api/cart");
  const items = await res.json();
  const item = items.find(i => i.productId === productId);
  if (!item) return;
  const newQty = item.quantity + delta;
  if (newQty < 1) return;
  await fetch("http://localhost:5000/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity: newQty })
  });
  loadCart();
}

async function removeFromCart(productId) {
  await fetch(`http://localhost:5000/api/cart/${productId}`, { method: "DELETE" });
  loadCart();
}

async function clearCart() {
  const res = await fetch("http://localhost:5000/api/cart");
  const items = await res.json();
  for (const item of items) {
    await fetch(`http://localhost:5000/api/cart/${item.productId}`, { method: "DELETE" });
  }
  loadCart();
}

function proceedToCheckout() {
  alert("Proceeding to checkout...");
}

loadCart();

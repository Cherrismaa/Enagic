//store\store.js

const API_BASE = window.location.hostname.includes("localhost")
  ? "http://localhost:5000"
  : "https://enagic-kangen-backend.onrender.com";


window.addEventListener("scroll", () => {
const header = document.querySelector(".header");
if (window.scrollY > 10) {
    header.classList.add("scrolled");
} else {
    header.classList.remove("scrolled");
}
}); 

document.addEventListener("DOMContentLoaded", () => {
const menu = document.getElementById('mobileMenu');
const hamburger = document.getElementById('hamburger');

function toggleMenu() {
    const isOpen = menu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
}

hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
});

document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
    menu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
    }
});
});


const products = [
  { id: "jriv", name: "Leveluk JR IV", price: 220000, category: "machines", img: "../assets/store/jr4.webp" },
  { id: "sd501", name: "Leveluk SD501", price: 277000, category: "machines", img: "../assets/store/SD501.webp" },
  { id: "sd501dx", name: "Leveluk SD501 DX", price: 311000, category: "machines", img: "../assets/store/sd501dx.webp" },
  { id: "sd501platinum", name: "Leveluk SD501 Platinum", price: 277000, category: "machines", img: "../assets/store/sd501platinum.webp" },
  { id: "k8", name: "Leveluk K8 Machine", price: 343000, category: "machines", img: "../assets/store/k8.webp" },
  { id: "super501", name: "Leveluk Super 501", price: 397000, category: "machines", img: "../assets/store/super501.webp" },
  { id: "Anespadx", name: "Anespa DX", price: 200000, category: "machines", img: "../assets/store/anespa-dx.webp" },

  { id: "fc1", name: "FC1 Filter", price: "", category: "filters", img: "../assets/store/fc1-filter.webp" },
  { id: "hg", name: "HG Filter", price: "" , category: "filters", img: "../assets/store/hg-filter.webp" },
  { id: "anespa-external-filter", name: "Anespa External Filter", price: "", category: "filters", img: "../assets/store/anespa-external-filter.webp" },
  { id: "anespa-ceramic-filter", name: "Anespa Ceramic Filter", price: "", category: "filters", img: "../assets/store/anespa-ceramic-filter.webp" },

  { id: "fc1-30", name: "FC1 Filters set of 30", price: "", category: "filters", img: "../assets/store/fc1-30.webp" },
  { id: "fc1-50", name: "FC1 Filters set of 50 ", price: "", category: "filters", img: "../assets/store/fc1-50.webp" },

  { id: "1lt-water-bottle", name: "1L Tritan Water Bottle", price: 1100, category: "supplies", img: "../assets/store/water-bottle-1l-tritan.webp" },
  { id: "2.2lt-water-bottle", name: "2.2L PETG Water Bottle", price: 1650, category: "supplies", img: "../assets/store/2.2l-petg-water-bottle.webp" },

  { id: "water-bag", name: "Water Bag", price: 1100, category: "supplies", img: "../assets/store/water-bag.webp" },
  { id: "enhancer", name: "Electrolysis Enhancer", price: 240, category: "supplies", img: "../assets/store/electrolysis-enhancer.webp" },

  { id: "e-cleaner-unitset", name: "E-Cleaner Unit Set (old)", price: 2250, category: "supplies", img: "../assets/store/e-cleaner-unit-set.webp" },
  { id: "e-cleaner-unitset-new", name: "E-Cleaner Unit Set New", price: 2250, category: "supplies", img: "../assets/store/e-cleaner-unit-set-new.webp" } 
];

const qty = {};
const cartItems = {};
const productList = document.getElementById("product-list");

function renderProducts(list) {
  productList.innerHTML = "";
  list.forEach(product => {
    qty[product.id] = 1;
    cartItems[product.id] = cartItems[product.id] || false;

    const div = document.createElement("div");
    div.className = "product";
    div.id = `product-${product.id}`;

    div.innerHTML = `
      <img src="${product.img}" alt="${product.name}">
      <h3>${product.name}</h3>
      ${
        product.category === "filters"
          ? `<p class="connect-message">To purchase this item, please click below.</p>
            <div id="btn-container-${product.id}">
              <a href="../customer-contact/index.html" class="connect-now-btn">Connect Now</a>
            </div>`
          : `<p>₹${product.price.toLocaleString()}</p>
            <div class="quantity-box">
              <button onclick="changeQty('${product.id}', -1)">-</button>
              <span id="qty-${product.id}">1</span>
              <button onclick="changeQty('${product.id}', 1)">+</button>
            </div>
            <div id="btn-container-${product.id}">
              <button onclick="addToCart('${product.id}')">Add to Cart</button>
            </div>`
      }
    `;

    productList.appendChild(div);
  });
}

function filterProducts(type) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.filter-btn[onclick="filterProducts('${type}')"]`).classList.add('active');
  const filtered = type === "all" ? products : products.filter(p => p.category === type);
  renderProducts(filtered);
}

function changeQty(id, delta) {
  qty[id] = Math.max(1, qty[id] + delta);
  document.getElementById(`qty-${id}`).textContent = qty[id];
}

async function addToCart(productId) {
  const quantity = qty[productId];
  try {

    const res = await fetch(`${API_BASE}/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity })
    });

    const data = await res.json();
    alert("✅ Added to cart!");
    cartItems[productId] = true;
    showRemoveBtn(productId);
  } catch (err) {
    alert("❌ Failed to add to cart");
  }
}

async function removeFromCart(productId) {
  try {
    
    const res = await fetch(`${API_BASE}/api/cart/${productId}`, {
    method: "DELETE"
    });

    const data = await res.json();
    alert("🗑️ Removed from cart");
    cartItems[productId] = false;
    hideRemoveBtn(productId);
  } catch (err) {
    alert("❌ Failed to remove from cart");
  }
}

function showRemoveBtn(productId) {
  const container = document.getElementById(`btn-container-${productId}`);
  const existing = document.getElementById(`remove-btn-${productId}`);
  if (!existing) {
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove from Cart";
    removeBtn.className = "remove-btn";
    removeBtn.id = `remove-btn-${productId}`;
    removeBtn.onclick = () => removeFromCart(productId);
    container.appendChild(removeBtn);
  }
}

function hideRemoveBtn(productId) {
  const btn = document.getElementById(`remove-btn-${productId}`);
  if (btn) btn.remove();
}

// Initial load
renderProducts(products);

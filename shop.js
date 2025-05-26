document.addEventListener("DOMContentLoaded", () => {
  const cartSidebar = document.getElementById("cartSidebar");
  const cartBtn = document.getElementById("cartBtn");
  const cartBtnMobile = document.getElementById("cartBtnMobile");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutBtn = document.querySelector(".checkout-btn");
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartCountMobile = document.getElementById("cartCountMobile");

  const CartManager = {
    cart: JSON.parse(localStorage.getItem("cart")) || [],

    save() {
      localStorage.setItem("cart", JSON.stringify(this.cart));
    },

    addItem({ name, price, size, quantity }) {
      const existing = this.cart.find(item => item.name === name && item.size === size);
      if (existing) {
        existing.quantity += quantity;
      } else {
        this.cart.push({ name, price, size, quantity });
      }
      this.save();
      this.updateUI();
      showNotification(name);
    },

    increase(index) {
      this.cart[index].quantity++;
      this.save();
      this.updateUI();
    },

    decrease(index) {
      if (this.cart[index].quantity > 1) {
        this.cart[index].quantity--;
      } else {
        this.cart.splice(index, 1);
      }
      this.save();
      this.updateUI();
    },

    remove(index) {
      this.cart.splice(index, 1);
      this.save();
      this.updateUI();
    },

    updateUI() {
      cartItems.innerHTML = "";
      let total = 0;
      let totalItems = 0;

      this.cart.forEach((item, index) => {
        total += item.price * item.quantity;
        totalItems += item.quantity;

        const div = document.createElement("div");
        div.className = "flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded";
        div.innerHTML = `
          <div>
            <p><strong>${item.name} (${item.size})</strong></p>
            <p>₹${item.price} x ${item.quantity}</p>
          </div>
          <div class="flex items-center gap-2">
            <button aria-label="Decrease quantity" class="qty-btn bg-gray-300 px-2 rounded" data-action="decrease" data-index="${index}">-</button>
            <span>${item.quantity}</span>
            <button aria-label="Increase quantity" class="qty-btn bg-gray-300 px-2 rounded" data-action="increase" data-index="${index}">+</button>
            <button aria-label="Remove item" class="remove-btn text-red-600 ml-2" data-index="${index}">✕</button>
          </div>
        `;
        cartItems.appendChild(div);
      });

      cartTotal.textContent = `₹${total}`;
      if (cartCount) cartCount.textContent = totalItems;
      if (cartCountMobile) cartCountMobile.textContent = totalItems;
    }
  };

  // Sidebar Toggle
  const showCart = () => cartSidebar.classList.remove("hidden");
  const hideCart = () => cartSidebar.classList.add("hidden");

  cartBtn?.addEventListener("click", showCart);
  cartBtnMobile?.addEventListener("click", showCart);
  closeCartBtn?.addEventListener("click", hideCart);

  // Add to cart buttons
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", (e) => {
      const card = e.target.closest("[data-name]");
      const name = card.dataset.name;
      const price = Number(card.dataset.price);

      const sizeSelect = card.querySelector(".size-select");
      const size = sizeSelect?.value;
      if (!size) {
        alert("Please select a size!");
        return;
      }

      const qtyInput = card.querySelector(".qty-input");
      const quantity = Number(qtyInput?.value) || 1;

      CartManager.addItem({ name, price, size, quantity });

      // Reset size selection and quantity input
      if (sizeSelect) sizeSelect.value = "";
      if (qtyInput) qtyInput.value = "1";
    });
  });

  // Cart item controls using event delegation
  cartItems.addEventListener("click", (e) => {
    const target = e.target;
    const index = Number(target.dataset.index);

    if (target.matches(".qty-btn")) {
      const action = target.dataset.action;
      if (action === "increase") {
        CartManager.increase(index);
      } else if (action === "decrease") {
        CartManager.decrease(index);
      }
    }

    if (target.matches(".remove-btn")) {
      CartManager.remove(index);
    }
  });

  // Checkout button
  checkoutBtn?.addEventListener("click", () => {
    if (CartManager.cart.length === 0) {
      alert("Your cart is empty!");
    } else {
      window.location.href = "checkout.html";
    }
  });

  // Notification
  function showNotification(productName) {
    let note = document.getElementById("notification");
    if (!note) {
      note = document.createElement("div");
      note.id = "notification";
      note.className = "fixed top-4 right-4 z-50 hidden bg-green-600 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-500";
      document.body.appendChild(note);
    }

    note.textContent = `✅ ${productName} added to cart!`;
    note.classList.remove("hidden");
    note.style.opacity = "1";

    if (note.hideTimeout) clearTimeout(note.hideTimeout);
    note.hideTimeout = setTimeout(() => {
      note.style.opacity = "0";
      setTimeout(() => note.classList.add("hidden"), 500);
    }, 2000);
  }

  // Init
  CartManager.updateUI();
});

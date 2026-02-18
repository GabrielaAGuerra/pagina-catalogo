const CART_STORAGE_KEY = "cart";
let cart = [];

function syncCart() {
  try {
    cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    if (!Array.isArray(cart)) cart = [];
  } catch (error) {
    cart = [];
  }
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((acc, item) => acc + Number(item.precio) * Number(item.cantidad), 0);
}

function formatearPrecio(valor) {
  return Number(valor || 0).toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

function updateCartCount() {
  syncCart();
  const count = cart.reduce((acc, item) => acc + Number(item.cantidad || 0), 0);
  const cartCountElement = document.getElementById("cartCount");
  if (cartCountElement) {
    cartCountElement.textContent = String(count);
  }
}

function renderCartItems() {
  syncCart();

  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotalElement = document.getElementById("cartTotal");
  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Tu carrito esta vacio.</p>";
    if (cartTotalElement) cartTotalElement.textContent = "0";
    return;
  }

  cartItemsContainer.innerHTML = cart
    .map(
      (item, index) => `
      <article class="cart-item">
        <img class="cart-item-thumb" src="${item.imagen || "images/logo.png"}" alt="${item.nombre}">
        <div class="cart-item-info">
          <span class="cart-item-name">${item.nombre}</span>
          <span class="cart-item-meta">x${item.cantidad} - $${formatearPrecio(item.precio * item.cantidad)}</span>
        </div>
        <button type="button" class="btn-remove-item" data-index="${index}">Quitar</button>
      </article>
    `
    )
    .join("");

  if (cartTotalElement) {
    cartTotalElement.textContent = formatearPrecio(getCartTotal());
  }

  cartItemsContainer.querySelectorAll(".btn-remove-item").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const index = Number(event.currentTarget.dataset.index);
      removeFromCart(index);
    });
  });
}

function addToCart(nombre, precio, imagen = "", id = "") {
  syncCart();

  const key = id || nombre;
  const item = cart.find((p) => (p.id || p.nombre) === key);

  if (item) {
    item.cantidad += 1;
  } else {
    cart.push({ id: id || nombre, nombre, precio: Number(precio || 0), cantidad: 1, imagen });
  }

  saveCart();
  updateCartCount();
  renderCartItems();
}

function agregarAlCarrito(productId) {
  const listaProductos = Array.isArray(window.productos) ? window.productos : [];
  const producto = listaProductos.find((p) => p.id === productId);
  if (!producto) return;

  addToCart(producto.nombre, producto.precio, producto.imagen, producto.id);
}

function removeFromCart(index) {
  syncCart();
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  saveCart();
  updateCartCount();
  renderCartItems();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartCount();
  renderCartItems();
}

function toggleCart(forceOpen) {
  const panel = document.getElementById("cart");
  const overlay = document.getElementById("overlay");
  if (!panel || !overlay) return;

  if (forceOpen === true) {
    panel.classList.add("open");
    overlay.classList.add("show");
    renderCartItems();
    return;
  }

  const open = panel.classList.toggle("open");
  overlay.classList.toggle("show", open);
  if (open) renderCartItems();
}

function cerrarCarrito() {
  document.getElementById("cart")?.classList.remove("open");
  document.getElementById("overlay")?.classList.remove("show");
}

async function sendWhatsAppOrder() {
  syncCart();
  if (!cart.length) {
    alert("El carrito esta vacio");
    return;
  }

  const nombre = (document.getElementById("clienteNombre")?.value || "").trim();
  const whatsappCliente = (document.getElementById("clienteWhatsapp")?.value || "").trim();

  const numeroPedido = `LD-${Date.now().toString().slice(-6)}`;

  if (window.backendPedidos?.guardarPedidoCompletoEnNube) {
    await window.backendPedidos.guardarPedidoCompletoEnNube({
      nombre,
      whatsappCliente,
      numeroPedido,
      carrito: cart
    });
  }

  let mensaje = `Hola! Quiero hacer este pedido (${numeroPedido}):\n\n`;
  cart.forEach((item) => {
    mensaje += `- ${item.nombre} x${item.cantidad} - $${formatearPrecio(item.precio * item.cantidad)}\n`;
  });
  mensaje += `\nTotal: $${formatearPrecio(getCartTotal())}`;
  if (nombre) mensaje += `\nCliente: ${nombre}`;
  if (whatsappCliente) mensaje += `\nWhatsApp: ${whatsappCliente}`;

  const telefono = "5491173633880";
  window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, "_blank");

  clearCart();
  cerrarCarrito();
}

document.addEventListener("DOMContentLoaded", () => {
  syncCart();
  updateCartCount();
  renderCartItems();

  document.getElementById("openCart")?.addEventListener("click", () => toggleCart(true));
  document.getElementById("overlay")?.addEventListener("click", cerrarCarrito);
  document.getElementById("clearCartBtn")?.addEventListener("click", clearCart);

  document.getElementById("checkoutForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    sendWhatsAppOrder();
  });
});

window.agregarAlCarrito = agregarAlCarrito;
window.toggleCart = toggleCart;
window.cerrarCarrito = cerrarCarrito;

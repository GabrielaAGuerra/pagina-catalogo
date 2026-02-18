let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function syncCart() {
  cart = JSON.parse(localStorage.getItem('cart')) || [];
}

function getCartTotal() {
  return cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}

function addToCart(nombre, precio) {
  syncCart();
  const item = cart.find((p) => p.nombre === nombre);
  if (item) {
    item.cantidad += 1;
  } else {
    cart.push({ nombre, precio, cantidad: 1 });
  }
  saveCart();
  updateCartCount();
  renderDrawerCart();
  alert('Producto agregado');
}

function renderCart() {
  syncCart();
  const contenedor = document.getElementById('carrito');
  if (!contenedor) return;

  if (cart.length === 0) {
    contenedor.innerHTML = '<p>Tu carrito esta vacio.</p>';
    return;
  }

  const lines = cart.map((p) => `<p>${p.nombre} x${p.cantidad} - $${p.precio * p.cantidad}</p>`).join('');
  contenedor.innerHTML = `${lines}<h3>Total: $${getCartTotal()}</h3>`;
}

function sendWhatsApp() {
  syncCart();
  if (cart.length === 0) {
    alert('El carrito esta vacio');
    return;
  }

  let mensaje = 'Hola! Quiero hacer este pedido:%0A%0A';
  let total = 0;

  cart.forEach((p) => {
    mensaje += `- ${p.nombre} x${p.cantidad} - $${p.precio * p.cantidad}%0A`;
    total += p.precio * p.cantidad;
  });

  mensaje += `%0A Total: $${total}`;

  const telefono = '5491173633880';
  window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
}

function updateCartCount() {
  syncCart();
  const count = cart.reduce((acc, item) => acc + item.cantidad, 0);
  document.querySelectorAll('#cart-count').forEach((el) => {
    el.textContent = count;
  });
}

function removeFromCart(index) {
  syncCart();
  cart.splice(index, 1);
  saveCart();
  updateCartCount();
  renderDrawerCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartCount();
  renderDrawerCart();
  renderCart();
}

function ensureCartDrawer() {
  if (document.getElementById('cart-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'cart-overlay';
  overlay.className = 'cart-overlay';
  overlay.addEventListener('click', closeCartDrawer);

  const drawer = document.createElement('aside');
  drawer.id = 'cart-drawer';
  drawer.className = 'cart-drawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = `
    <div class="cart-drawer-header">
      <h3>Tu carrito</h3>
      <button type="button" class="cart-close" id="close-cart-btn">X</button>
    </div>
    <div class="cart-drawer-body" id="drawer-cart-items"></div>
    <div class="cart-drawer-footer">
      <button type="button" class="btn" id="drawer-send-wa">Enviar por WhatsApp</button>
      <button type="button" class="btn cart-clear" id="drawer-clear-cart">Vaciar carrito</button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  const closeBtn = document.getElementById('close-cart-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);

  const sendBtn = document.getElementById('drawer-send-wa');
  if (sendBtn) sendBtn.addEventListener('click', sendWhatsApp);

  const clearBtn = document.getElementById('drawer-clear-cart');
  if (clearBtn) clearBtn.addEventListener('click', clearCart);
}

function renderDrawerCart() {
  const container = document.getElementById('drawer-cart-items');
  if (!container) return;

  syncCart();
  if (cart.length === 0) {
    container.innerHTML = '<p>Tu carrito esta vacio.</p>';
    return;
  }

  const items = cart
    .map(
      (p, index) => `
      <div class="drawer-item">
        <div>
          <strong>${p.nombre}</strong>
          <p>x${p.cantidad} - $${p.precio * p.cantidad}</p>
        </div>
        <button type="button" class="remove-item" data-index="${index}">Quitar</button>
      </div>
    `
    )
    .join('');

  container.innerHTML = `${items}<h4 class="drawer-total">Total: $${getCartTotal()}</h4>`;

  container.querySelectorAll('.remove-item').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const i = Number(e.currentTarget.dataset.index);
      removeFromCart(i);
    });
  });
}

function openCartDrawer() {
  ensureCartDrawer();
  renderDrawerCart();

  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (!overlay || !drawer) return;

  overlay.classList.add('open');
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('cart-open');
}

function closeCartDrawer() {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (!overlay || !drawer) return;

  overlay.classList.remove('open');
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('cart-open');
}

function bindCartTriggers() {
  const selectors = [
    'a[href="carrito.html"]',
    'a[href="./carrito.html"]',
    'a[href$="/carrito.html"]'
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openCartDrawer();
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  bindCartTriggers();
  ensureCartDrawer();
  renderDrawerCart();
  renderCart();
});
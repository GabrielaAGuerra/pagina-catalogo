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

function addToCart(nombre, precio, imagen = '') {
  syncCart();
  const item = cart.find((p) => p.nombre === nombre);
  if (item) {
    item.cantidad += 1;
  } else {
    cart.push({ nombre, precio, cantidad: 1, imagen });
  }
  saveCart();
  updateCartCount();
  renderCartItems();
  alert('Producto agregado al carrito');
}

function renderCartItems() {
  syncCart();
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotalElement = document.getElementById('cartTotal');
  
  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="text-center text-gray-500">Tu carrito está vacío</p>'; 
    if (cartTotalElement) cartTotalElement.textContent = '0';
    return;
  }

  const itemsHTML = cart.map((item, index) => `
    <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex-1">
        <p class="font-semibold">${item.nombre}</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}</p>
      </div>
      <button type="button" class="remove-item-btn text-red-500 hover:text-red-700 font-bold" data-index="${index}">×</button>
    </div>
  `).join('');

  cartItemsContainer.innerHTML = itemsHTML;
  
  if (cartTotalElement) {
    cartTotalElement.textContent = getCartTotal().toFixed(2);
  }

  // Agregar event listeners a los botones de remover
  document.querySelectorAll('.remove-item-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = Number(e.target.dataset.index);
      removeFromCart(index);
    });
  });
}

function updateCartCount() {
  syncCart();
  const count = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const cartCountElement = document.getElementById('cartCount');
  
  if (cartCountElement) {
    cartCountElement.textContent = count;
    if (count > 0) {
      cartCountElement.classList.remove('hidden');
    } else {
      cartCountElement.classList.add('hidden');
    }
  }
}

function removeFromCart(index) {
  syncCart();
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    renderCartItems();
  }
}

function clearCart() {
  if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
    cart = [];
    saveCart();
    updateCartCount();
    renderCartItems();
    alert('Carrito vaciado');
  }
}

function sendWhatsAppOrder() {
  syncCart();
  if (cart.length === 0) {
    alert('El carrito está vacío');
    return;
  }

  const nombre = document.getElementById('clienteNombre')?.value || 'Cliente';
  const whatsapp = document.getElementById('clienteWhatsapp')?.value || '';

  let mensaje = 'Hola! Quiero hacer este pedido:%0A%0A';
  let total = 0;

  cart.forEach((item) => {
    mensaje += `- ${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}%0A`;
    total += item.precio * item.cantidad;
  });

  mensaje += `%0A Total: $${total.toFixed(2)}`;
  if (nombre) mensaje += `%0A%0A Cliente: ${nombre}`;
  if (whatsapp) mensaje += `%0A WhatsApp: ${whatsapp}`;

  const telefono = '5491173633880';
  window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
}

function toggleCart() {
  const cart = document.getElementById('cart');
  const overlay = document.getElementById('overlay');
  
  if (cart && overlay) {
    const isHidden = cart.classList.contains('hidden');
    if (isHidden) {
      cart.classList.remove('hidden');
      overlay.classList.remove('hidden');
      renderCartItems();
    } else {
      cart.classList.add('hidden');
      overlay.classList.add('hidden');
    }
  }
}

function cerrarCarrito() {
  const cart = document.getElementById('cart');
  const overlay = document.getElementById('overlay');
  if (cart && overlay) {
    cart.classList.add('hidden');
    overlay.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderCartItems();

  // Conectar evento del botón de carrito
  const openCartBtn = document.getElementById('openCart');
  if (openCartBtn) {
    openCartBtn.addEventListener('click', toggleCart);
  }

  // Conectar evento del formulario de checkout
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendWhatsAppOrder();
    });
  }

  // Conectar evento del botón de vaciar carrito
  const clearCartBtn = document.getElementById('clearCartBtn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
  }

  // Conectar evento del botón overlay
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.addEventListener('click', cerrarCarrito);
  }
});

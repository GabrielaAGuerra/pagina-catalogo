(function () {
  const productos = Array.isArray(window.productos) ? window.productos : [];

  const categoriasEl = document.getElementById('categoriasMain');
  const subcategoriasEl = document.getElementById('subcategorias');
  const gridEl = document.getElementById('grid-catalogo');
  const tituloEl = document.getElementById('catalogoTitulo');

  if (!categoriasEl || !subcategoriasEl || !gridEl) return;

  let categoriaActiva = '';
  let subcategoriaActiva = '';

  const fmtMoney = (v) => Number(v || 0).toLocaleString('es-AR');

  function esc(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCategorias() {
    const map = new Map();
    productos.forEach((p) => {
      const slug = p.categoriaPrincipal || p.categoria || 'general';
      const label = p.categoriaPrincipalLabel || p.categoriaLabel || 'General';
      if (!map.has(slug)) map.set(slug, label);
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], 'es'));
  }

  function getSubcategorias(cat) {
    const map = new Map();
    productos
      .filter((p) => !cat || (p.categoriaPrincipal || p.categoria) === cat)
      .forEach((p) => {
        const slug = p.subcategoria || 'general';
        const label = p.subcategoriaLabel || 'General';
        if (!map.has(slug)) map.set(slug, label);
      });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], 'es'));
  }

  function getFilteredProducts() {
    return productos.filter((p) => {
      const okCat = (p.categoriaPrincipal || p.categoria) === categoriaActiva;
      const okSub = (p.subcategoria || 'general') === subcategoriaActiva;
      return okCat && okSub;
    });
  }

  function renderCategorias() {
    const categorias = getCategorias();

    if (!categoriaActiva && categorias.length) {
      categoriaActiva = categorias[0][0];
    }

    const buttons = categorias
      .map(([slug, label]) => {
        const active = categoriaActiva === slug ? 'active' : '';
        return `<button type="button" class="cat ${active}" data-cat="${esc(slug)}">${esc(label)}</button>`;
      })
      .join('');

    categoriasEl.innerHTML = buttons;

    categoriasEl.querySelectorAll('.cat').forEach((btn) => {
      btn.addEventListener('click', () => {
        categoriaActiva = btn.dataset.cat || '';
        subcategoriaActiva = '';
        renderAll();
      });
    });
  }

  function renderSubcategorias() {
    const subs = getSubcategorias(categoriaActiva);

    if (!subcategoriaActiva && subs.length) {
      subcategoriaActiva = subs[0][0];
    }

    const buttons = subs
      .map(([slug, label]) => {
        const active = subcategoriaActiva === slug ? 'active' : '';
        return `<button type="button" class="subcat ${active}" data-sub="${esc(slug)}">${esc(label)}</button>`;
      })
      .join('');

    subcategoriasEl.innerHTML = buttons;

    subcategoriasEl.querySelectorAll('.subcat').forEach((btn) => {
      btn.addEventListener('click', () => {
        subcategoriaActiva = btn.dataset.sub || '';
        renderAll();
      });
    });
  }

  function renderGrid() {
    const items = getFilteredProducts();

    if (tituloEl) {
      tituloEl.textContent = `Catalogo (${items.length})`;
    }

    if (!items.length) {
      gridEl.innerHTML = '<p>No hay productos para los filtros seleccionados.</p>';
      return;
    }

    gridEl.innerHTML = items
      .map((p) => {
        const nombre = esc(p.nombre || 'Sticker');
        const imagen = esc(p.imagen || '');
        const precio = Number(p.precio || 0);
        return `
          <article class="card producto">
            <img src="${imagen}" alt="${nombre}" loading="lazy">
            <h3>${nombre}</h3>
            <p>$${fmtMoney(precio)}</p>
            <button type="button" class="js-add" data-name="${nombre}" data-price="${precio}">Agregar</button>
          </article>
        `;
      })
      .join('');

    gridEl.querySelectorAll('.js-add').forEach((btn) => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name') || 'Sticker';
        const price = Number(btn.getAttribute('data-price') || 0);
        if (typeof window.addToCart === 'function') {
          window.addToCart(name, price);
        }
      });
    });
  }

  function renderAll() {
    renderCategorias();
    renderSubcategorias();
    renderGrid();
  }

  renderAll();
})();

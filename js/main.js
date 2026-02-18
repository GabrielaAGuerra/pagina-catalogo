function normalizarCatalogo(listado) {
  if (!Array.isArray(listado)) return [];

  const vistos = new Set();
  const normalizados = [];

  listado.forEach((producto, index) => {
    if (!producto || !producto.imagen) return;

    const id = String(producto.id || `ST-AUTO-${index + 1}`);
    const clave = `${id}|${producto.imagen}`;

    if (vistos.has(clave)) {
      return;
    }

    vistos.add(clave);
    normalizados.push({
      ...producto,
      id,
      nombre: producto.nombre || `Sticker ${index + 1}`,
      precio: Number(producto.precio || 0)
    });
  });

  return normalizados;
}

document.addEventListener("DOMContentLoaded", () => {
  const catalogo = normalizarCatalogo(typeof productos !== "undefined" ? productos : []);
  window.productos = catalogo;

  initNav();
  renderCatalogo(catalogo);
});

// Sección "Pedidos que ya salieron" (23/10/2026), igual en las tres páginas.
// - provincias: a las que ya llegaron pedidos (verificado el 22/10). Sumar solo las que sean reales.
// - fotos: paquetes despachados de verdad, con nombre y dirección TAPADOS. Van en la raíz del repo
//   (ej. envio-01.jpg, 720x900) y se agregan acá: { src: 'envio-01.jpg', alt: 'Paquete despachado por Correo Argentino' }.
//   Mientras la lista esté vacía, la sección se ve sin fotos.
module.exports = {
  provincias: ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Salta', 'Formosa'],
  fotos: [],
};

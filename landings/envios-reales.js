// Sección "Pedidos que ya salieron" (23/10/2026), igual en las tres páginas.
// - provincias: 08/11/2026 él pidió mostrar TODAS las provincias y garantizó que se despacha a todas
//   ("sí despachamos a todas las provincias que hay, te lo garantizo yo"). Antes (22/10) solo estaban las 5 verificadas:
//   Buenos Aires, Córdoba, Santa Fe, Salta y Formosa. Son las 23 provincias + la Ciudad de Buenos Aires, en orden alfabético.
// - fotos: paquetes despachados de verdad, con nombre y dirección TAPADOS. Van en la raíz del repo
//   (ej. envio-01.jpg, 720x900) y se agregan acá: { src: 'envio-01.jpg', alt: 'Paquete despachado por Correo Argentino' }.
//   Mientras la lista esté vacía, la sección se ve sin fotos.
module.exports = {
  provincias: [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Ciudad de Buenos Aires', 'Córdoba', 'Corrientes', 'Entre Ríos',
    'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
    'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
  ],
  fotos: [],
};

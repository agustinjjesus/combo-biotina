// Arma las tres landings (Dúo, Biotina Pura y Combo) desde landings/plantilla.html y los
// datos de landings/productos/. Desde el 23/10/2026 las tres son la misma página con
// distinto producto: un arreglo en la plantilla queda en las tres.
//
//   node landings/generar.js
//
// No editar a mano shampoo-crema/index.html, biotina-pura.html ni combo-biotina.html:
// se pisan cada vez que se corre esto.
const fs = require('fs');
const path = require('path');

const P = require('./piezas');

const RAIZ = path.join(__dirname, '..');
const plantilla = fs.readFileSync(path.join(__dirname, 'plantilla.html'), 'utf8');
const envios = require('./envios-reales');

for (const nombre of ['duo', 'biotina', 'combo']) {
  const datos = Object.assign({}, require('./productos/' + nombre));
  // Lo que va igual en las tres páginas
  datos.ENVIOS_REALES = P.enviosReales(envios, datos.P);
  // Envío de 1 unidad: los $7.000 YA VAN SUMADOS en el precio (1 frasco $22.000 = $15.000 + $7.000), no se cobran aparte: se dice "incluido"
  // (08/11/2026: antes decía "$7.000" y parecía un cargo extra). El Combo, desde el 31/10/2026, va gratis a sucursal.
  if (!('ENVIO_X1' in datos)) datos.ENVIO_X1 = 'Incluido';
  if (!('ENVIO_X1_NOTA' in datos)) datos.ENVIO_X1_NOTA = 'Envío incluido en el precio — gratis llevando 2 o más';
  const html = plantilla.replace(/\{\{([A-Z0-9_]+)\}\}/g, (marca, clave) => {
    if (!(clave in datos)) throw new Error(`${nombre}: falta ${clave}`);
    return datos[clave];
  });
  fs.writeFileSync(path.join(RAIZ, datos.archivo), html, 'utf8');
  console.log(`${datos.archivo}: ${html.split('\n').length} líneas`);
}

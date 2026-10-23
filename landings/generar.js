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

const RAIZ = path.join(__dirname, '..');
const plantilla = fs.readFileSync(path.join(__dirname, 'plantilla.html'), 'utf8');

for (const nombre of ['duo', 'biotina', 'combo']) {
  const datos = require('./productos/' + nombre);
  const html = plantilla.replace(/\{\{([A-Z0-9_]+)\}\}/g, (marca, clave) => {
    if (!(clave in datos)) throw new Error(`${nombre}: falta ${clave}`);
    return datos[clave];
  });
  fs.writeFileSync(path.join(RAIZ, datos.archivo), html, 'utf8');
  console.log(`${datos.archivo}: ${html.split('\n').length} líneas`);
}

/**
 * excel-to-json.js
 * ----------------
 * Convierte el inventario de Excel (data/inventario.xlsx) a JSON
 * (src/data/products.json) para que la aplicación lo consuma.
 *
 * Se ejecuta automáticamente antes de `npm run dev` y `npm run build`
 * (ver scripts "predev" y "prebuild" en package.json), por lo que basta
 * con modificar el Excel y volver a arrancar/compilar para actualizar
 * el catálogo. También puede ejecutarse a mano: `npm run catalogo`.
 *
 * Columnas esperadas en la hoja "Inventario":
 *   ID | Marca | Nombre | Descripcion | Categoria | PrecioAnterior |
 *   Precio | Stock | Foto | Nuevo | Oferta | Activo
 *
 * Los campos Nuevo / Oferta / Activo aceptan: SI / NO (también sí, x, 1, true).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUTA_EXCEL = join(__dirname, '..', 'data', 'inventario.xlsx');
const RUTA_SALIDA = join(__dirname, '..', 'src', 'data', 'products.json');

// Marcas válidas y su carpeta de imágenes correspondiente
const CARPETAS_MARCA = {
  nice: 'nice',
  farmasi: 'farmasi',
  natura: 'natura',
};

/** Convierte valores tipo "SI/NO" a booleano de forma tolerante. */
function aBooleano(valor) {
  if (typeof valor === 'boolean') return valor;
  if (valor == null) return false;
  const texto = String(valor).trim().toLowerCase();
  return ['si', 'sí', 'x', '1', 'true', 'verdadero'].includes(texto);
}

/** Convierte a número, devolviendo un valor por defecto si no es válido. */
function aNumero(valor, porDefecto = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : porDefecto;
}

function convertir() {
  if (!existsSync(RUTA_EXCEL)) {
    console.error(`✖ No se encontró el Excel en: ${RUTA_EXCEL}`);
    console.error('  Coloca tu inventario en data/inventario.xlsx y vuelve a intentar.');
    process.exit(1);
  }

  const libro = XLSX.read(readFileSync(RUTA_EXCEL), { type: 'buffer' });
  const hoja = libro.Sheets['Inventario'] || libro.Sheets[libro.SheetNames[0]];
  const filas = XLSX.utils.sheet_to_json(hoja, { defval: '' });

  const errores = [];
  const productos = [];

  filas.forEach((fila, indice) => {
    const numFila = indice + 2; // +2: encabezado + índice base 1

    // Ignora filas completamente vacías o la fila de ejemplo del formato
    if (!fila.Nombre && !fila.ID) return;
    if (String(fila.ID).trim().toUpperCase() === 'EJEMPLO') return;

    const marca = String(fila.Marca || '').trim();
    const carpeta = CARPETAS_MARCA[marca.toLowerCase()];

    if (!carpeta) {
      errores.push(`Fila ${numFila}: marca desconocida "${marca}" (usa NICE, Farmasi o Natura).`);
      return;
    }
    if (!fila.Foto) {
      errores.push(`Fila ${numFila}: falta el nombre del archivo de la foto.`);
    }

    productos.push({
      id: aNumero(fila.ID, indice + 1),
      marca,
      nombre: String(fila.Nombre).trim(),
      descripcion: String(fila.Descripcion || '').trim(),
      categoria: String(fila.Categoria || 'General').trim(),
      precioAnterior: aNumero(fila.PrecioAnterior, 0) || null,
      precio: aNumero(fila.Precio, 0),
      stock: aNumero(fila.Stock, 0),
      foto: String(fila.Foto).trim(),
      // La ruta de la imagen se construye automáticamente según la marca
      imagen: `/imagenes/${carpeta}/${String(fila.Foto).trim()}`,
      nuevo: aBooleano(fila.Nuevo),
      oferta: aBooleano(fila.Oferta),
      activo: aBooleano(fila.Activo),
    });
  });

  if (errores.length) {
    console.warn('⚠ Avisos durante la conversión:');
    errores.forEach((e) => console.warn('  - ' + e));
  }

  mkdirSync(dirname(RUTA_SALIDA), { recursive: true });
  writeFileSync(RUTA_SALIDA, JSON.stringify(productos, null, 2), 'utf8');
  console.log(`✔ Catálogo generado: ${productos.length} productos → src/data/products.json`);
}

convertir();

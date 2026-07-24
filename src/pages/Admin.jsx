/**
 * Admin.jsx
 * ---------
 * Panel de administración (ruta #/admin). Permite, sin tocar el código:
 *  - Catálogo: activar/desactivar productos y marcar oferta/nuevo
 *  - Excel: subir un nuevo inventario (.xlsx) y actualizar el catálogo
 *  - Configuración: número de WhatsApp, nombre de la tienda y banner
 *  - Estadísticas: pedidos enviados y productos más agregados
 *
 * Los cambios se guardan en el navegador (localStorage) y se aplican de
 * inmediato en la tienda de este dispositivo. Para publicar cambios para
 * todos los clientes: reemplaza data/inventario.xlsx y vuelve a desplegar
 * (npm run build), o edita src/config/config.js.
 *
 * Este componente se carga de forma diferida (lazy) junto con la librería
 * xlsx, así los clientes de la tienda no descargan nada de esto.
 */

import { useEffect, useMemo, useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { CONFIG_BASE, guardarConfig, obtenerConfig } from '../config/config.js';
import {
  CLAVE_AJUSTES_ADMIN,
  CLAVE_CATALOGO_ADMIN,
  cargarCatalogoCompleto,
  leerAjustesAdmin,
} from '../services/products.js';
import { obtenerEstadisticas, reiniciarEstadisticas } from '../services/stats.js';
import { formatCurrency } from '../utils/formatCurrency.js';

const PESTANAS = [
  { id: 'catalogo', etiqueta: 'Catálogo' },
  { id: 'excel', etiqueta: 'Subir Excel' },
  { id: 'config', etiqueta: 'Configuración' },
  { id: 'stats', etiqueta: 'Estadísticas' },
];

/** Convierte valores "SI/NO" a booleano (misma regla que el script de Node). */
function aBooleano(valor) {
  if (typeof valor === 'boolean') return valor;
  if (valor == null) return false;
  return ['si', 'sí', 'x', '1', 'true', 'verdadero'].includes(String(valor).trim().toLowerCase());
}

/** Interruptor visual reutilizable. */
function Interruptor({ activo, onCambiar, etiqueta }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={onCambiar}
      className={`relative h-6 w-11 flex-none rounded-full transition
        ${activo ? 'bg-rosa-600' : 'bg-malva-300 dark:bg-malva-700'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all
          ${activo ? 'left-[1.375rem]' : 'left-0.5'}`}
      />
    </button>
  );
}

export default function Admin() {
  const { mostrarToast } = useToast();

  const [pestana, setPestana] = useState('catalogo');
  const [catalogo, setCatalogo] = useState([]);
  const [ajustes, setAjustes] = useState(leerAjustesAdmin);
  const [config, setConfig] = useState(obtenerConfig);
  const [stats, setStats] = useState(obtenerEstadisticas);
  const [hayExcelSubido, setHayExcelSubido] = useState(
    () => !!localStorage.getItem(CLAVE_CATALOGO_ADMIN)
  );

  // Carga el catálogo completo (incluye productos inactivos)
  const recargarCatalogo = () => cargarCatalogoCompleto().then(setCatalogo);
  useEffect(() => {
    recargarCatalogo();
  }, []);

  /** Cambia un indicador (activo/oferta/nuevo) de un producto y lo persiste. */
  const cambiarIndicador = (id, campo) => {
    const producto = catalogo.find((p) => p.id === id);
    if (!producto) return;
    const nuevosAjustes = {
      ...ajustes,
      [id]: { ...(ajustes[id] || {}), [campo]: !producto[campo] },
    };
    setAjustes(nuevosAjustes);
    localStorage.setItem(CLAVE_AJUSTES_ADMIN, JSON.stringify(nuevosAjustes));
    setCatalogo((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [campo]: !p[campo] } : p))
    );
  };

  /** Procesa un Excel subido desde el navegador y actualiza el catálogo. */
  const manejarArchivoExcel = async (evento) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    try {
      // Import dinámico: xlsx solo se descarga cuando de verdad se usa
      const XLSX = await import('xlsx');
      const datos = await archivo.arrayBuffer();
      const libro = XLSX.read(datos, { type: 'array' });
      const hoja = libro.Sheets['Inventario'] || libro.Sheets[libro.SheetNames[0]];
      const filas = XLSX.utils.sheet_to_json(hoja, { defval: '' });

      const carpetas = { nice: 'nice', farmasi: 'farmasi', natura: 'natura' };
      const productos = [];

      filas.forEach((fila, i) => {
        if (!fila.Nombre && !fila.ID) return;
        if (String(fila.ID).trim().toUpperCase() === 'EJEMPLO') return;
        const marca = String(fila.Marca || '').trim();
        const carpeta = carpetas[marca.toLowerCase()];
        if (!carpeta) return; // marca desconocida: se ignora la fila

        productos.push({
          id: Number(fila.ID) || i + 1,
          marca,
          nombre: String(fila.Nombre).trim(),
          descripcion: String(fila.Descripcion || '').trim(),
          categoria: String(fila.Categoria || 'General').trim(),
          precioAnterior: Number(fila.PrecioAnterior) || null,
          precio: Number(fila.Precio) || 0,
          stock: Number(fila.Stock) || 0,
          foto: String(fila.Foto).trim(),
          imagen: `/imagenes/${carpeta}/${String(fila.Foto).trim()}`,
          nuevo: aBooleano(fila.Nuevo),
          oferta: aBooleano(fila.Oferta),
          activo: aBooleano(fila.Activo),
        });
      });

      if (!productos.length) {
        mostrarToast('El Excel no contiene productos válidos.', 'error');
        return;
      }

      localStorage.setItem(CLAVE_CATALOGO_ADMIN, JSON.stringify(productos));
      localStorage.removeItem(CLAVE_AJUSTES_ADMIN); // los ajustes viejos ya no aplican
      setAjustes({});
      setHayExcelSubido(true);
      await recargarCatalogo();
      mostrarToast(`Catálogo actualizado: ${productos.length} productos.`);
    } catch (e) {
      console.error(e);
      mostrarToast('No se pudo leer el Excel. Revisa el formato.', 'error');
    } finally {
      evento.target.value = ''; // permite volver a subir el mismo archivo
    }
  };

  /** Vuelve al catálogo original generado desde data/inventario.xlsx. */
  const restaurarCatalogoOriginal = async () => {
    localStorage.removeItem(CLAVE_CATALOGO_ADMIN);
    localStorage.removeItem(CLAVE_AJUSTES_ADMIN);
    setAjustes({});
    setHayExcelSubido(false);
    await recargarCatalogo();
    mostrarToast('Catálogo original restaurado.', 'info');
  };

  /** Guarda la configuración editada (WhatsApp, banner, nombre). */
  const guardarCambiosConfig = () => {
    const limpio = { ...config, whatsapp: config.whatsapp.replace(/\D/g, '') };
    guardarConfig(limpio);
    setConfig(limpio);
    mostrarToast('Configuración guardada.');
  };

  // Estadísticas derivadas
  const resumen = useMemo(() => {
    const activos = catalogo.filter((p) => p.activo);
    const top = Object.entries(stats.agregados)
      .map(([id, veces]) => ({
        producto: catalogo.find((p) => p.id === Number(id)),
        veces,
      }))
      .filter((x) => x.producto)
      .sort((a, b) => b.veces - a.veces)
      .slice(0, 5);

    return {
      totalProductos: catalogo.length,
      activos: activos.length,
      agotados: activos.filter((p) => p.stock <= 0).length,
      valorInventario: activos.reduce((s, p) => s + p.precio * p.stock, 0),
      top,
    };
  }, [catalogo, stats]);

  return (
    <div className="min-h-screen bg-[#FBF8F7] dark:bg-malva-950">
      {/* Encabezado del panel */}
      <header className="border-b border-malva-100 bg-white dark:border-malva-800 dark:bg-malva-900">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
          <h1 className="font-display text-xl font-semibold">Panel de administración</h1>
          <a href="#" className="boton-secundario ml-auto !px-4 !py-1.5 text-xs">
            ← Volver a la tienda
          </a>
        </div>

        {/* Pestañas */}
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 sm:px-6">
          {PESTANAS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setPestana(t.id);
                if (t.id === 'stats') setStats(obtenerEstadisticas());
              }}
              className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition
                ${
                  pestana === t.id
                    ? 'border-rosa-600 text-rosa-700 dark:text-rosa-400'
                    : 'border-transparent text-malva-500 hover:text-malva-800 dark:hover:text-malva-200'
                }`}
            >
              {t.etiqueta}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* ---------- Pestaña: Catálogo ---------- */}
        {pestana === 'catalogo' && (
          <section className="animate-aparecer">
            <p className="mb-4 text-sm text-malva-500 dark:text-malva-400">
              Activa o desactiva productos y modifica promociones. Los cambios se aplican al
              instante en la tienda de este navegador.
            </p>
            <div className="overflow-x-auto rounded-3xl bg-white shadow-tarjeta dark:bg-malva-900">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-malva-100 text-xs uppercase tracking-wider text-malva-500 dark:border-malva-800">
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3 text-center">Activo</th>
                    <th className="px-4 py-3 text-center">Oferta</th>
                    <th className="px-4 py-3 text-center">Nuevo</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogo.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-malva-50 last:border-0 dark:border-malva-800/60"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{p.nombre}</p>
                        <p className="text-xs text-malva-400">{p.marca}</p>
                      </td>
                      <td className="px-4 py-3">{formatCurrency(p.precio)}</td>
                      <td className="px-4 py-3">{p.stock}</td>
                      {['activo', 'oferta', 'nuevo'].map((campo) => (
                        <td key={campo} className="px-4 py-3 text-center">
                          <Interruptor
                            activo={p[campo]}
                            etiqueta={`${campo} de ${p.nombre}`}
                            onCambiar={() => cambiarIndicador(p.id, campo)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ---------- Pestaña: Subir Excel ---------- */}
        {pestana === 'excel' && (
          <section className="animate-aparecer max-w-2xl space-y-5">
            <div className="rounded-3xl bg-white p-6 shadow-tarjeta dark:bg-malva-900">
              <h2 className="font-display text-lg font-semibold">Actualizar catálogo</h2>
              <p className="mt-2 text-sm text-malva-500 dark:text-malva-400">
                Sube tu archivo <strong>.xlsx</strong> con las columnas: ID, Marca, Nombre,
                Descripcion, Categoria, PrecioAnterior, Precio, Stock, Foto, Nuevo, Oferta,
                Activo. El catálogo se actualiza de inmediato en este navegador.
              </p>
              <label className="boton-primario mt-4 cursor-pointer">
                Elegir archivo Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={manejarArchivoExcel}
                />
              </label>

              {hayExcelSubido && (
                <div className="mt-4 rounded-2xl bg-rosa-50 p-4 text-sm dark:bg-rosa-950/30">
                  <p>
                    Estás viendo un catálogo subido desde el navegador. Puedes volver al
                    original cuando quieras.
                  </p>
                  <button
                    type="button"
                    onClick={restaurarCatalogoOriginal}
                    className="boton-secundario mt-3 !px-4 !py-1.5 text-xs"
                  >
                    Restaurar catálogo original
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 text-sm leading-relaxed shadow-tarjeta dark:bg-malva-900">
              <h3 className="font-display text-base font-semibold">
                ¿Quieres publicar los cambios para todos tus clientes?
              </h3>
              <p className="mt-2 text-malva-500 dark:text-malva-400">
                Reemplaza el archivo <code>data/inventario.xlsx</code> del proyecto, ejecuta{' '}
                <code>npm run build</code> y vuelve a desplegar en Vercel o Netlify. El sitio
                convierte el Excel a catálogo automáticamente en cada compilación.
              </p>
            </div>
          </section>
        )}

        {/* ---------- Pestaña: Configuración ---------- */}
        {pestana === 'config' && (
          <section className="animate-aparecer max-w-2xl space-y-5">
            <div className="rounded-3xl bg-white p-6 shadow-tarjeta dark:bg-malva-900">
              <h2 className="font-display text-lg font-semibold">Tienda</h2>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Número de WhatsApp</label>
                  <input
                    type="text"
                    className="campo"
                    placeholder="Ej. 529991234567"
                    value={config.whatsapp}
                    onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-malva-400">
                    Formato internacional sin "+" ni espacios (México: 52 + 10 dígitos).
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Nombre de la tienda</label>
                  <input
                    type="text"
                    className="campo"
                    value={config.nombreTienda}
                    onChange={(e) => setConfig({ ...config, nombreTienda: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-tarjeta dark:bg-malva-900">
              <h2 className="font-display text-lg font-semibold">Banner principal</h2>
              <div className="mt-4 space-y-3">
                {[
                  ['titulo', 'Título'],
                  ['subtitulo', 'Subtítulo'],
                  ['textoBoton', 'Texto del botón'],
                  ['imagen', 'Imagen (ruta o URL)'],
                ].map(([campo, etiqueta]) => (
                  <div key={campo}>
                    <label className="mb-1 block text-sm font-medium">{etiqueta}</label>
                    <input
                      type="text"
                      className="campo"
                      value={config.banner[campo]}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          banner: { ...config.banner, [campo]: e.target.value },
                        })
                      }
                    />
                  </div>
                ))}
                <p className="text-xs text-malva-400">
                  Coloca imágenes de banner en <code>public/imagenes/banners/</code> y usa una
                  ruta como <code>/imagenes/banners/principal.jpg</code>, o pega una URL externa.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={guardarCambiosConfig} className="boton-primario">
                Guardar cambios
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfig(CONFIG_BASE);
                  guardarConfig(CONFIG_BASE);
                  mostrarToast('Configuración restaurada.', 'info');
                }}
                className="boton-secundario"
              >
                Restaurar valores originales
              </button>
            </div>
          </section>
        )}

        {/* ---------- Pestaña: Estadísticas ---------- */}
        {pestana === 'stats' && (
          <section className="animate-aparecer space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Productos en catálogo', resumen.totalProductos],
                ['Productos activos', resumen.activos],
                ['Agotados', resumen.agotados],
                ['Valor del inventario', formatCurrency(resumen.valorInventario)],
                ['Pedidos enviados (este navegador)', stats.pedidosEnviados],
                ['Monto estimado de pedidos', formatCurrency(stats.totalVendidoEstimado)],
              ].map(([etiqueta, valor]) => (
                <div
                  key={etiqueta}
                  className="rounded-3xl bg-white p-5 shadow-tarjeta dark:bg-malva-900"
                >
                  <p className="text-xs uppercase tracking-wider text-malva-400">{etiqueta}</p>
                  <p className="mt-2 font-display text-2xl font-semibold">{valor}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-tarjeta dark:bg-malva-900">
              <h2 className="font-display text-lg font-semibold">Más agregados al carrito</h2>
              {resumen.top.length === 0 ? (
                <p className="mt-3 text-sm text-malva-500">Aún no hay actividad registrada.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {resumen.top.map(({ producto, veces }) => (
                    <li
                      key={producto.id}
                      className="flex items-center justify-between rounded-2xl bg-malva-50 px-4 py-2.5 text-sm dark:bg-malva-800"
                    >
                      <span>
                        {producto.nombre}{' '}
                        <span className="text-xs text-malva-400">· {producto.marca}</span>
                      </span>
                      <span className="font-semibold text-rosa-700 dark:text-rosa-400">
                        {veces} {veces === 1 ? 'vez' : 'veces'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => {
                  reiniciarEstadisticas();
                  setStats(obtenerEstadisticas());
                  mostrarToast('Estadísticas reiniciadas.', 'info');
                }}
                className="boton-secundario mt-5 !px-4 !py-1.5 text-xs"
              >
                Reiniciar estadísticas
              </button>
            </div>

            <p className="text-xs leading-relaxed text-malva-400">
              Nota: al no usar base de datos, las estadísticas se guardan en el navegador donde
              ocurre la actividad. Reflejan el uso de este dispositivo.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

/**
 * Home.jsx
 * --------
 * Página principal de la tienda. Orquesta:
 *   Header (logo, buscador, carrito) -> Banner -> Destacados/Nuevos/Ofertas
 *   -> Filtros -> Catálogo (scroll infinito) -> Footer
 * más el carrito lateral y el modal de detalle de producto.
 *
 * La lógica pesada (búsqueda, filtros, orden) vive en services/products.js;
 * aquí solo se conecta el estado con los componentes y se memoiza el
 * resultado para no recalcular en cada render.
 */

import { useMemo, useState } from 'react';
import Banner from '../components/Banner.jsx';
import BrandFilter from '../components/BrandFilter.jsx';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ProductModal from '../components/ProductModal.jsx';
import SidebarCart from '../components/SidebarCart.jsx';
import { useFavorites } from '../hooks/useFavorites.js';
import { useProducts } from '../hooks/useProducts.js';
import { obtenerConfig } from '../config/config.js';
import {
  buscarProductos,
  filtrarProductos,
  ordenarProductos,
} from '../services/products.js';

const FILTROS_INICIALES = {
  marca: 'Todos',
  precio: 'todos',
  disponibles: false,
  ofertas: false,
  nuevos: false,
};

/** Carrusel horizontal reutilizable para Destacados / Nuevos / Ofertas. */
function FilaDestacada({ titulo, productos, esFavorito, onAlternarFavorito, onVerDetalle }) {
  if (!productos.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <h2 className="font-display text-2xl font-semibold">{titulo}</h2>
      <div className="-mx-4 mt-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {productos.map((p) => (
          <div key={p.id} className="w-56 flex-none snap-start sm:w-64">
            <ProductCard
              producto={p}
              esFavorito={esFavorito(p.id)}
              onAlternarFavorito={onAlternarFavorito}
              onVerDetalle={onVerDetalle}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  // Configuración vigente (nombre, banner, WhatsApp)
  const config = useMemo(obtenerConfig, []);

  // Datos y estado de UI
  const { productos, cargando, error } = useProducts();
  const { esFavorito, alternarFavorito } = useFavorites();

  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [orden, setOrden] = useState('recientes');
  const [productoDetalle, setProductoDetalle] = useState(null);

  // Pipeline memoizado: búsqueda -> filtros -> orden
  const resultado = useMemo(() => {
    const encontrados = buscarProductos(productos, busqueda);
    const filtrados = filtrarProductos(encontrados, filtros);
    return ordenarProductos(filtrados, orden);
  }, [productos, busqueda, filtros, orden]);

  // Secciones destacadas (solo se muestran sin búsqueda ni filtros activos)
  const sinFiltros =
    !busqueda.trim() && JSON.stringify(filtros) === JSON.stringify(FILTROS_INICIALES);

  const destacados = useMemo(
    () => productos.filter((p) => (p.oferta || p.nuevo) && p.stock > 0).slice(0, 8),
    [productos]
  );
  const nuevos = useMemo(() => productos.filter((p) => p.nuevo).slice(0, 8), [productos]);
  const ofertas = useMemo(() => productos.filter((p) => p.oferta).slice(0, 8), [productos]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        nombreTienda={config.nombreTienda}
        eslogan={config.eslogan}
        busqueda={busqueda}
        onBuscar={setBusqueda}
      />

      <main className="flex-1">
        <Banner banner={config.banner} />

        {/* Secciones destacadas */}
        {sinFiltros && !cargando && (
          <>
            <FilaDestacada
              titulo="Destacados"
              productos={destacados}
              esFavorito={esFavorito}
              onAlternarFavorito={alternarFavorito}
              onVerDetalle={setProductoDetalle}
            />
            <FilaDestacada
              titulo="Recién llegados"
              productos={nuevos}
              esFavorito={esFavorito}
              onAlternarFavorito={alternarFavorito}
              onVerDetalle={setProductoDetalle}
            />
            <FilaDestacada
              titulo="En oferta"
              productos={ofertas}
              esFavorito={esFavorito}
              onAlternarFavorito={alternarFavorito}
              onVerDetalle={setProductoDetalle}
            />
          </>
        )}

        {/* Catálogo completo */}
        <section id="catalogo" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-12 sm:px-6">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-2xl font-semibold">Catálogo</h2>
            {!cargando && (
              <p className="text-sm text-malva-500 dark:text-malva-400">
                {resultado.length} {resultado.length === 1 ? 'producto' : 'productos'}
              </p>
            )}
          </div>

          <BrandFilter
            filtros={filtros}
            onCambiarFiltros={setFiltros}
            orden={orden}
            onCambiarOrden={setOrden}
          />

          <div className="mt-6">
            {error ? (
              <div className="rounded-3xl bg-white py-16 text-center shadow-tarjeta dark:bg-malva-900">
                <p className="font-display text-xl">Algo salió mal</p>
                <p className="mt-2 text-sm text-malva-500">{error}</p>
              </div>
            ) : (
              <ProductGrid
                productos={resultado}
                cargando={cargando}
                esFavorito={esFavorito}
                onAlternarFavorito={alternarFavorito}
                onVerDetalle={setProductoDetalle}
              />
            )}
          </div>
        </section>
      </main>

      <Footer nombreTienda={config.nombreTienda} whatsapp={config.whatsapp} />

      {/* Superposiciones */}
      <SidebarCart />
      <ProductModal
        producto={productoDetalle}
        productos={productos}
        onCerrar={() => setProductoDetalle(null)}
        onVerDetalle={setProductoDetalle}
      />
    </div>
  );
}

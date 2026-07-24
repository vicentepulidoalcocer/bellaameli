/**
 * ProductGrid.jsx
 * ---------------
 * Cuadrícula del catálogo con:
 * - Skeletons durante la carga inicial
 * - Scroll infinito: muestra productos por lotes y carga más cuando el
 *   "centinela" del final entra en pantalla (IntersectionObserver)
 * - Estado vacío cuando la búsqueda/filtros no arrojan resultados
 *
 * Nota sobre reconciliación:
 * Cada tarjeta guarda estado propio (cantidad, si su imagen falló). Para que
 * al cambiar de marca/filtro ninguna tarjeta reutilice la imagen o el estado
 * de la vista anterior, la cuadrícula se identifica con una "firma" derivada
 * de los IDs visibles y se vuelve a montar cuando esa firma cambia.
 */

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import ProductCard from './ProductCard.jsx';
import SkeletonCard from './SkeletonCard.jsx';

const LOTE = 8; // productos que se agregan en cada "página" del scroll infinito

function ProductGrid({ productos, cargando, esFavorito, onAlternarFavorito, onVerDetalle }) {
  // Firma estable del conjunto actual (marca + búsqueda + orden se reflejan
  // en qué IDs llegan y en qué posición). Si cambia, reiniciamos la paginación
  // y remontamos la cuadrícula.
  const firma = useMemo(() => productos.map((p) => p.id).join('-'), [productos]);

  const [visibles, setVisibles] = useState(LOTE);
  const centinelaRef = useRef(null);

  // Ref siempre actualizada para que el observador nunca lea datos obsoletos.
  const totalRef = useRef(productos.length);
  totalRef.current = productos.length;

  // Al cambiar el contenido (búsqueda/filtros/orden), se reinicia la paginación.
  useEffect(() => {
    setVisibles(LOTE);
  }, [firma]);

  // Observa el centinela del final para cargar el siguiente lote.
  useEffect(() => {
    const centinela = centinelaRef.current;
    if (!centinela) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas[0].isIntersecting) {
          setVisibles((v) => Math.min(v + LOTE, totalRef.current));
        }
      },
      { rootMargin: '300px' } // empieza a cargar un poco antes de llegar al final
    );

    observador.observe(centinela);
    return () => observador.disconnect();
  }, [firma, visibles]);

  // Carga inicial: skeletons
  if (cargando) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Sin resultados
  if (!productos.length) {
    return (
      <div className="rounded-3xl bg-white py-16 text-center shadow-tarjeta dark:bg-malva-900">
        <p className="font-display text-xl">No encontramos productos</p>
        <p className="mt-2 text-sm text-malva-500 dark:text-malva-400">
          Prueba con otra palabra o quita algún filtro.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* La "key" con la firma fuerza un remonte limpio al cambiar de vista,
          evitando que una tarjeta conserve la imagen/estado de otra marca. */}
      <div
        key={firma}
        className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4"
      >
        {productos.slice(0, visibles).map((producto) => (
          <ProductCard
            key={producto.id}
            producto={producto}
            esFavorito={esFavorito(producto.id)}
            onAlternarFavorito={onAlternarFavorito}
            onVerDetalle={onVerDetalle}
          />
        ))}
      </div>

      {/* Centinela del scroll infinito */}
      {visibles < productos.length && (
        <div ref={centinelaRef} className="flex justify-center py-8">
          <span className="text-sm text-malva-400">Cargando más productos…</span>
        </div>
      )}
    </>
  );
}

export default memo(ProductGrid);

/**
 * SkeletonCard.jsx
 * ----------------
 * Tarjeta "fantasma" que se muestra mientras carga el catálogo.
 * Replica la silueta de ProductCard para evitar saltos de diseño.
 */

import { memo } from 'react';

function SkeletonCard() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-tarjeta dark:bg-malva-900"
      aria-hidden
    >
      <div className="skeleton aspect-square w-full !rounded-none" />
      <div className="space-y-2.5 p-4">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-5 w-20" />
        <div className="flex gap-2 pt-2">
          <div className="skeleton h-9 w-24 !rounded-full" />
          <div className="skeleton h-9 flex-1 !rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default memo(SkeletonCard);

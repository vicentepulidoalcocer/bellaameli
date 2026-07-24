# Bella Esencia — Tienda catálogo (NICE · Farmasi · Natura)

Aplicación web tipo catálogo construida con **React + Vite + TailwindCSS** (JavaScript).
Los clientes ven, buscan y filtran productos, arman su carrito y envían el pedido
completo por **WhatsApp**. No hay pagos en línea ni base de datos: el inventario
vive en un archivo de **Excel**.

---

## Arranque rápido

```bash
npm install
npm run dev
```

Abre http://localhost:5173

- **Tienda:** `/`
- **Panel de administración:** `/#/admin`

Para producción:

```bash
npm run build      # genera la carpeta dist/ lista para publicar
npm run preview    # prueba local de la versión de producción
```

> Antes de `dev` y `build` se ejecuta automáticamente `npm run catalogo`,
> que convierte `data/inventario.xlsx` en `src/data/products.json`.
> **Solo edita el Excel y el catálogo se actualiza.**

---

## Cómo actualizar el catálogo (Excel)

1. Abre `data/inventario.xlsx` (hoja **Inventario**; la hoja *Instrucciones* explica cada columna).
2. Edita, agrega o elimina filas. Columnas:

| Columna        | Descripción                                                        |
|----------------|--------------------------------------------------------------------|
| ID             | Número único por producto                                          |
| Marca          | Exactamente `NICE`, `Farmasi` o `Natura`                           |
| Nombre         | Nombre del producto                                                |
| Descripcion    | Texto que se muestra en la vista de detalle                        |
| Categoria      | Ej. Perfumería, Maquillaje, Bisutería…                             |
| PrecioAnterior | Opcional; se muestra tachado si es mayor que el precio actual      |
| Precio         | Precio actual                                                      |
| Stock          | Existencias (`0` = aparece como **Agotado**)                       |
| Foto           | Solo el nombre del archivo, ej. `kaiak.jpg`                        |
| Nuevo          | `SI` / `NO` → etiqueta **Nuevo**                                   |
| Oferta         | `SI` / `NO` → etiqueta **Oferta**                                  |
| Activo         | `SI` / `NO` → `NO` oculta el producto de la tienda                 |

3. Guarda el archivo y ejecuta `npm run dev` (o `npm run build` para publicar).

### Imágenes

```
public/
  imagenes/
    nice/       ← fotos de productos NICE
    farmasi/    ← fotos de productos Farmasi
    natura/     ← fotos de productos Natura
    banners/    ← imágenes del banner principal
```

En el Excel escribe **solo el nombre del archivo** (`kaiak.jpg`); la ruta se
construye sola según la marca: `/imagenes/natura/kaiak.jpg`.
Las imágenes incluidas son de muestra: reemplázalas por tus fotos reales
usando el mismo nombre de archivo (ideal: cuadradas, ~800×800 px).

---

## Número de WhatsApp

Edita `src/config/config.js`:

```js
whatsapp: '529991234567', // formato internacional SIN "+" (México: 52 + 10 dígitos)
```

Ahí mismo puedes cambiar el nombre de la tienda y los textos del banner.
También puede cambiarse desde el panel de administración (ver abajo).

---

## Panel de administración (`/#/admin`)

Sin tocar el código puedes:

- **Catálogo:** activar/desactivar productos y marcar Oferta / Nuevo.
- **Subir Excel:** cargar un nuevo `inventario.xlsx` y actualizar el catálogo al instante.
- **Configuración:** cambiar número de WhatsApp, nombre de la tienda y banner.
- **Estadísticas:** pedidos enviados, monto estimado y productos más agregados.

**Importante:** al no existir servidor ni base de datos, estos cambios se guardan
en el navegador (localStorage) del dispositivo donde se hacen. Para publicar
cambios **para todos tus clientes**: actualiza `data/inventario.xlsx` (o
`src/config/config.js`), ejecuta `npm run build` y vuelve a desplegar.

---

## Publicar en Vercel o Netlify

El proyecto es un sitio estático estándar de Vite:

- **Comando de build:** `npm run build`
- **Carpeta de salida:** `dist`

Sube el repositorio a GitHub, conéctalo a Vercel/Netlify y usa esos dos valores.
Cada vez que subas un Excel nuevo al repositorio y se redepliegue, el catálogo
se regenera automáticamente.

---

## Estructura del proyecto

```
data/inventario.xlsx        ← ÚNICA fuente del catálogo
scripts/excel-to-json.js    ← convierte el Excel a JSON (Node + SheetJS)
public/imagenes/            ← fotos por marca + banners
src/
  components/               ← Header, SearchBar, BrandFilter, ProductCard,
                              ProductGrid, ProductModal, SidebarCart,
                              CheckoutForm, Banner, Footer, Skeleton, Icons
  pages/                    ← Home (tienda) y Admin (panel, carga diferida)
  hooks/                    ← useCart, useProducts, useFavorites, useTheme
  context/                  ← CartContext (carrito), ToastContext (avisos)
  services/                 ← products (búsqueda/filtros/orden), stats
  utils/                    ← formatCurrency, whatsapp (mensaje del pedido)
  config/config.js          ← WhatsApp, nombre de tienda, banner
```

## Características incluidas

Carrito persistente (localStorage) · búsqueda en vivo con coincidencias parciales
y sin acentos · filtros por marca, precio, disponibles, ofertas y nuevos ·
orden por precio, nombre y recientes · scroll infinito · skeleton loading ·
lazy loading de imágenes · modo claro/oscuro · favoritos · compartir producto ·
toast al agregar · productos destacados/nuevos/en oferta · productos relacionados ·
formulario de datos del cliente · mensaje de WhatsApp agrupado por marca ·
code splitting (el panel admin y la librería de Excel se cargan aparte) ·
diseño responsivo con estética femenina y elegante.

## Evolución futura

La separación en servicios/hooks/contextos permite crecer sin rehacer nada:
para migrar a una base de datos bastaría reemplazar `services/products.js`
por llamadas a una API; el resto de la aplicación no cambia. Lo mismo aplica
para autenticación, pagos en línea o gestión de pedidos.

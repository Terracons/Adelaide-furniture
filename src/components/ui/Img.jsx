/* eslint-disable @next/next/no-img-element */
/**
 * Plain <img> wrapper.
 *
 * We deliberately avoid next/image: this app is a static export, so there is
 * no image optimiser at runtime, and the shipped artwork is SVG (already
 * resolution-independent and tiny). Swapping in your own JPGs later needs no
 * code change - just drop them in /public/images and update the data.
 */
export default function Img({ src, alt = '', className = '', loading = 'lazy', ...rest }) {
  return (
    <img
      src={src || '/images/products/sena-ribbed-vase-1.svg'}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
      {...rest}
    />
  );
}

/*
 * lucide-react doesn't ship per-icon type declarations, but we import icons via deep paths so
 * that this package's CommonJS build doesn't retain the entire icon set in downstream bundles.
 */
declare module 'lucide-react/dist/esm/icons/*' {
  import { LucideIcon } from 'lucide-react';

  const Icon: LucideIcon;
  export default Icon;
}

import { useState } from 'react';

let nextId = 0;

/**
 * Generates a stable, page-unique string suitable for wiring up ARIA attributes (`id`,
 * `aria-controls`, `aria-labelledby`, etc.). Uses a module-level counter rather than
 * `crypto.randomUUID()` because the latter is only available in secure contexts (HTTPS or
 * localhost) and throws on plain HTTP.
 *
 * @privateRemarks Retire in favour of `React.useId` after upgrading to React 18+
 */
export function useAriaId(): string {
  const [id] = useState(() => {
    nextId += 1;
    return `aria-id-${nextId}`;
  });
  return id;
}

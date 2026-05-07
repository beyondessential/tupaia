import { useState } from 'react';

/** @privateRemarks Retire in favour of `React.useId` after upgrading to React 18+ */
export function useId(): string {
  const [id] = useState(() => crypto.randomUUID());
  return id;
}

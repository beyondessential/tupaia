/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useLocation } from 'react-router-dom';

function hasFrom(state: unknown): state is { from: string } {
  if (state !== null && typeof state === 'object' && 'from' in state) {
    return typeof state.from === 'string';
  }
  return false;
}

export function useFromLocation() {
  const location = useLocation();
  return hasFrom(location.state) ? location.state.from : undefined;
}

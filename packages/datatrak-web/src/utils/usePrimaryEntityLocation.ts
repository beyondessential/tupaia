/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useLocation } from 'react-router-dom';

function hasPrimaryEntity(state: unknown): state is { primaryEntityCode: string } {
  if (state !== null && typeof state === 'object' && 'primaryEntityCode' in state) {
    return typeof state.primaryEntityCode === 'string';
  }
  return false;
}

export function usePrimaryEntityLocation() {
  const location = useLocation();
  return hasPrimaryEntity(location.state) ? location.state.primaryEntityCode : undefined;
}

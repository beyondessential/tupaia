/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useLocation } from 'react-router-dom';

function hasPrimaryEntity(state: unknown): state is { primaryEntity: string } {
  if (state !== null && typeof state === 'object' && 'primaryEntity' in state) {
    return typeof state.primaryEntity === 'string';
  }
  return false;
}

export function usePrimaryEntityLocation() {
  const location = useLocation();
  return hasPrimaryEntity(location.state) ? location.state.primaryEntity : undefined;
}

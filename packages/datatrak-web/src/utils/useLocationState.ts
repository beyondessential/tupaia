/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { useLocation } from 'react-router-dom';

function hasProperty<T extends string>(state: unknown, property: T): state is Record<T, string> {
  if (state !== null && typeof state === 'object' && property in state) {
    return typeof (state as Record<T, unknown>)[property] === 'string';
  }
  return false;
}

function useLocationState(property: 'primaryEntityCode' | 'from'): string | undefined {
  const location = useLocation();
  return hasProperty(location.state, property) ? location.state[property] : undefined;
}

export function usePrimaryEntityLocation() {
  return useLocationState('primaryEntityCode');
}

export function useFromLocation() {
  return useLocationState('from');
}

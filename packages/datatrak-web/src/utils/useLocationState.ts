import { useLocation } from 'react-router-dom';

function hasProperty<T extends string>(state: unknown, property: T): state is Record<T, string> {
  if (state !== null && typeof state === 'object' && property in state) {
    return typeof (state as Record<T, unknown>)[property] === 'string';
  }
  return false;
}

function useLocationState(property: 'from'): string | undefined {
  const location = useLocation();
  return hasProperty(location.state, property) ? location.state[property] : undefined;
}

export function useFromLocation() {
  return useLocationState('from');
}

/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useCallback } from 'react';

export const getRuntimeParameters = (additionalParameters = []) => {
  return Object.fromEntries(
    additionalParameters.map(p => [
      p.name,
      p?.config?.hasDefaultValue ? p?.config?.defaultValue : undefined,
    ]),
  );
};

export const useRuntimeParameters = ({ runtimeParameters, setRuntimeParameters }) => {
  const upsertRuntimeParameter = useCallback((key, value) => {
    const newRuntimeParameters = { ...runtimeParameters };
    newRuntimeParameters[key] = value;
    setRuntimeParameters(newRuntimeParameters);
  });

  const removeRuntimeParameter = useCallback(keyToRemove => {
    const newRuntimeParameters = Object.fromEntries(
      Object.entries(runtimeParameters).filter(([key]) => key !== keyToRemove),
    );
    setRuntimeParameters(newRuntimeParameters);
  });

  const renameRuntimeParameter = useCallback((oldName, newName) => {
    const value = runtimeParameters[oldName];
    removeRuntimeParameter(oldName);
    upsertRuntimeParameter(newName, value);
  });

  return {
    upsertRuntimeParameter,
    removeRuntimeParameter,
    renameRuntimeParameter,
  };
};

import { useCallback } from 'react';

export const useRuntimeParams = ({ runtimeParams, setRuntimeParams }) => {
  const upsertRuntimeParam = useCallback((key, value) => {
    const newRuntimeParams = { ...runtimeParams };
    newRuntimeParams[key] = value;
    setRuntimeParams(newRuntimeParams);
  });

  const removeRuntimeParam = useCallback(keyToRemove => {
    const newRuntimeParams = Object.fromEntries(
      Object.entries(runtimeParams).filter(([key]) => key !== keyToRemove),
    );
    setRuntimeParams(newRuntimeParams);
  });

  const renameRuntimeParam = useCallback((oldName, newName) => {
    const value = runtimeParams[oldName];
    removeRuntimeParam(oldName);
    upsertRuntimeParam(newName, value);
  });

  return {
    upsertRuntimeParam,
    removeRuntimeParam,
    renameRuntimeParam,
  };
};

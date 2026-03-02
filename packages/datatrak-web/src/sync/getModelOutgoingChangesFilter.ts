export const getModelOutgoingChangesFilter = <T extends number>(since: T) => {
  return {
    updated_at_sync_tick: {
      comparator: '>' as const,
      comparisonValue: since as T,
    },
  };
};

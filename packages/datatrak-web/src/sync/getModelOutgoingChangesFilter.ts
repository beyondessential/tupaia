export const getModelOutgoingChangesFilter = (since: number) => {
  return {
    updated_at_sync_tick: {
      comparator: '>',
      comparisonValue: since,
    },
  };
};

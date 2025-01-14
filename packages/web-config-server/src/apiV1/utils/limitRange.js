import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

export const limitRange = (datum, [floor, ceiling]) => {
  if (datum === NO_DATA_AVAILABLE) {
    return NO_DATA_AVAILABLE;
  }
  return datum < floor ? Math.max(datum, floor) : Math.min(datum, ceiling);
};

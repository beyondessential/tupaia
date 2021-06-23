/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

// can be passed to sort to order chart config by legend order
export const compareLegendOrder = (cfg1 = {}, cfg2 = {}) => {
  if (Number.isNaN(cfg1.legendOrder) && Number.isNaN(cfg2.legendOrder)) return 0;
  if (Number.isNaN(cfg1.legendOrder)) return -1;
  if (Number.isNaN(cfg2.legendOrder)) return 1;
  return cfg1.legendOrder - cfg2.legendOrder;
};

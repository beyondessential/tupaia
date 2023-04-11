/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { pascalCaseToWords } from './string';

/**
 * @param {string} model e.g. 'DashboardItem'
 * @param {boolean} [plural]
 * @returns {string} e.g. 'Dashboard Item'
 */
export const humanFriendlyModelName = (model, plural = false) => {
  const words = pascalCaseToWords(model);
  if (!plural) return words;

  switch (model) {
    case 'Entity':
      return 'Entities';
    case 'EntityHierarchy':
      return 'Entity Hierarchies';
    default:
      return `${words}s`;
  }
};

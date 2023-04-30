/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { SECTION_FIELD_TYPE } from '../editor/constants';

// This function is used to explode fields that are nested in sections
export const getExplodedFields = items => {
  return items.reduce((result, item) => {
    if (item.type === SECTION_FIELD_TYPE) return [...result, ...item.fields];
    return [...result, item];
  }, []);
};

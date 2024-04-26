/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { SECTION_FIELD_TYPE } from '../editor/constants';

/**
 * Used to explode fields that are nested in sections.
 */
export const getExplodedFields = items => {
  const fields = [];
  for (const item of items) {
    fields.push(item.type === SECTION_FIELD_TYPE ? item.fields : item);
  }

  return fields;
};

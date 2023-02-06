/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const DATA_ELEMENT_DESCRIPTORS = {
  DE_1: {
    id: 'de1',
    code: 'DE_1',
    valueType: 'TEXT',
  },
  DE_2: {
    id: 'de2',
    code: 'DE_2',
    valueType: 'TEXT',
    options: { x: 'X-ray', y: 'Y-ray' },
  },
} as const;

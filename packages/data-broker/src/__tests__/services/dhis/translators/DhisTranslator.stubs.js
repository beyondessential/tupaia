/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import { DATA_ELEMENTS, DATA_ELEMENTS_BY_GROUP, DATA_GROUPS } from './DhisTranslator.fixtures';

export const createModelsStub = () => {
  return baseCreateModelsStub({
    dataElement: {
      records: Object.values(DATA_ELEMENTS),
      extraMethods: {
        getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
        getDhisDataTypes: () => ({ DATA_ELEMENT: 'DataElement', INDICATOR: 'Indicator' }),
      },
    },
    dataGroup: {
      records: Object.values(DATA_GROUPS),
      extraMethods: {
        getDataElementsInDataGroup: async groupCode => DATA_ELEMENTS_BY_GROUP[groupCode],
      },
    },
  });
};

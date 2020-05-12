/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 **/

import {
  ObjectValidator,
  hasContent,
  constructIsEmptyOr,
  constructIsOneOf,
  constructThisOrThatHasContent,
  isPlainObject,
} from '../../validation';
import { ENTITY_TYPES } from '../../database';

const ENTITY_FIELD_VALIDATORS = {
  parent_code: [constructThisOrThatHasContent('district')],
  district: [constructThisOrThatHasContent('parent_code')],
  sub_district: [],
  code: [hasContent],
  name: [hasContent],
  entity_type: [
    hasContent,
    cellValue => {
      const checkIsOneOf = constructIsOneOf(Object.values(ENTITY_TYPES));
      checkIsOneOf(cellValue);
    },
  ],
  attributes: [constructIsEmptyOr(isPlainObject)],
};

const SPECIFIC_ENTITY_TYPE_VALIDATORS = {
  [ENTITY_TYPES.FACILITY]: {
    facility_type: [
      hasContent,
      cellValue => {
        const checkIsOneOf = constructIsOneOf(['1', '2', '3', '4']);
        checkIsOneOf(cellValue.substring(0, 1));
      },
    ],
  },
};

export function getEntityObjectValidator(entityType) {
  const validators = {
    ...ENTITY_FIELD_VALIDATORS,
    ...SPECIFIC_ENTITY_TYPE_VALIDATORS[entityType],
  };
  return new ObjectValidator(validators);
}

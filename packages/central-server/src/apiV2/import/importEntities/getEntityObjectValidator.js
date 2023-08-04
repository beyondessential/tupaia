/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import {
  ObjectValidator,
  hasContent,
  constructIsEmptyOr,
  constructIsOneOf,
  isPlainObject,
  constructIsValidEntityType,
} from '@tupaia/utils';

const constructEntityFieldValidators = models => ({
  parent_code: [],
  district: [],
  sub_district: [],
  code: [hasContent],
  name: [hasContent],
  entity_type: [hasContent, constructIsValidEntityType(models.entity)],
  attributes: [constructIsEmptyOr(isPlainObject)],
  data_service_entity: [constructIsEmptyOr(isPlainObject)],
});

const constructSpecificEntityTypeValidators = (entityType, models) => {
  switch (entityType) {
    case models.entity.types.FACILITY:
      return {
        facility_type: [
          hasContent,
          cellValue => {
            const checkIsOneOf = constructIsOneOf(['1', '2', '3', '4']);
            checkIsOneOf(cellValue.substring(0, 1));
          },
        ],
      };
    default:
      return null;
  }
};

export function getEntityObjectValidator(entityType, models) {
  const validators = {
    ...constructEntityFieldValidators(models),
    ...constructSpecificEntityTypeValidators(entityType, models),
  };
  return new ObjectValidator(validators);
}

import {
  ObjectValidator,
  hasContent,
  constructIsEmptyOr,
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

// `entityType` is retained in the signature for callers, but there are no
// longer any entity-type-specific column validators — `facility_type` was the
// only one and facility classification is no longer imported (it only wrote to
// the deprecated `clinic` table; see updateCountryEntities).
export function getEntityObjectValidator(entityType, models) {
  return new ObjectValidator(constructEntityFieldValidators(models));
}

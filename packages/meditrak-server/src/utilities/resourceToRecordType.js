/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import Case from 'case';
import { singularise } from '@tupaia/utils';
import { TYPES } from '@tupaia/database';

// For those endpoints that do not make sense using the table name, we can provide a translation
const RESOURCE_TRANSLATIONS = {
  user: TYPES.USER_ACCOUNT,
  facilities: TYPES.FACILITY,
  facility: TYPES.FACILITY,
  dashboard_group: TYPES.DASHBOARD_GROUP, // because of camel case table name
  dashboard_report: TYPES.DASHBOARD_REPORT,  // because of camel case table name
  map_overlay: TYPES.MAP_OVERLAY,  // because of camel case table name
};

// This utility function takes in a resource, or endpoint, and converts it to the record type we
// should be retrieving from the database. Resources look like the camel case form of the record
// type, and in pluarl form if it is a GET of multiple rather than a single record (i.e. is not
// followed by a /{recordId})
// Examples of conversions:
//    survey -> survey
//    surveyResponse -> survey_response
//    surveyResponses -> survey_response
//    countries -> country
export function resourceToRecordType(resource) {
  const singular = singularise(Case.snake(resource));
  return RESOURCE_TRANSLATIONS[singular] || singular;
}

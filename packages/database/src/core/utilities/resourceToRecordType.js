import Case from 'case';
import { singularise } from '@tupaia/utils';
import { RECORDS } from '../records';

// For those endpoints that do not make sense using the table name, we can provide a translation
const RESOURCE_TRANSLATIONS = {
  user: RECORDS.USER_ACCOUNT,
  facilities: RECORDS.FACILITY,
  facility: RECORDS.FACILITY,
};

// This utility function takes in a resource, or endpoint, and converts it to the record type we
// should be retrieving from the database. Resources look like the camel case form of the record
// type, and in plural form if it is a GET of multiple rather than a single record (i.e. is not
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

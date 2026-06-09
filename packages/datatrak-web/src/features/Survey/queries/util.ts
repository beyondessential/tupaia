import { Country, Survey, SurveyGroup } from '@tupaia/types';
import { DatatrakWebModelRegistry } from '../../../types';

export async function getSurveyCountryNames(
  models: DatatrakWebModelRegistry,
  surveyIds: Survey['id'][],
  options: { enabled?: boolean } = { enabled: true },
): Promise<Record<Survey['id'], Country['name'][]>> {
  if (!options.enabled) return {};
  return await models.survey.getCountryNamesBySurveyId(surveyIds);
}

export async function getSurveyCountryCodes(
  models: DatatrakWebModelRegistry,
  surveyIds: Survey['id'][],
  options: { enabled?: boolean } = { enabled: true },
): Promise<Record<Survey['id'], Country['code'][]>> {
  if (!options.enabled) return {};
  return await models.survey.getCountryCodesBySurveyId(surveyIds);
}

export async function getSurveyGroupNames(
  models: DatatrakWebModelRegistry,
  surveyIds: Survey['id'][],
  options: { enabled?: boolean } = { enabled: true },
): Promise<Record<Survey['id'], SurveyGroup['name'] | null>> {
  if (!options.enabled) return {};
  return await models.survey.getSurveyGroupNamesBySurveyId(surveyIds);
}

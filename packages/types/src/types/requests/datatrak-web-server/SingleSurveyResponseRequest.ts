import { Country, Entity, Survey, SurveyResponse } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export interface Params {
  id: string;
}

export interface ResBody extends KeysToCamelCase<Omit<SurveyResponse, 'data_time' | 'end_time'>> {
  answers: Record<string, string>;
  countryName: Country['name'];
  entityName: Entity['name'];
  entityId: Entity['id'];
  surveyName: Survey['name'];
  surveyCode: Survey['code'];
  countryCode: Country['code'];
  /** ISO9075 format */
  dataTime: string;
  /** ISO8601 format */
  endTime: string;
  entityParentName: Entity['name'];
}
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;

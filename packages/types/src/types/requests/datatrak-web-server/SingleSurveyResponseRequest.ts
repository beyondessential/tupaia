import { KeysToCamelCase } from '../../../utils/casing';
import { ISO8601Timestamp, ISO9075Timestamp } from '../../../utils/datetime';
import { Country, Entity, Question, Survey, SurveyResponse } from '../../models';

export interface Params {
  id: string;
}

type Answer = string | number | boolean | null | undefined | { name: string; id: string };

export interface ResBody extends KeysToCamelCase<Omit<SurveyResponse, 'data_time' | 'end_time'>> {
  answers: Record<Question['id'], Answer>;
  countryName: Country['name'];
  entityName: Entity['name'];
  entityId: Entity['id'];
  surveyName: Survey['name'];
  surveyCode: Survey['code'];
  countryCode: Country['code'];
  dataTime: ISO9075Timestamp;
  endTime: ISO8601Timestamp;
  entityParentName: Entity['name'];
}
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;

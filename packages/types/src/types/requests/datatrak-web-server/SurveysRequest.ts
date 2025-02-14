import { Question, Survey } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export type Params = Record<string, never>;

type SurveyResponse = KeysToCamelCase<Survey> & {
  surveyGroupName?: string | null;
  questions?: KeysToCamelCase<Question>[];
  countryNames?: string[];
};

export type ResBody = SurveyResponse[];
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  fields?: string[];
}

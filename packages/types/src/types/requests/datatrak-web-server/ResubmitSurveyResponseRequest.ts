import { Entity } from '../../models';
import {
  ResBody as SubmitSurveyResponseRequestResBody,
  ReqBody as SubmitSurveyResponseRequestBody,
} from './SubmitSurveyResponseRequest';

export type Params = { originalSurveyResponseId: string };
export type ResBody = SubmitSurveyResponseRequestResBody;
export type ReqBody = SubmitSurveyResponseRequestBody & {
  entityId?: Entity['id'];
};
export type ReqQuery = Record<string, never>;

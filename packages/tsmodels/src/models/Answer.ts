import { AnswerModel as BaseAnswerModel, AnswerRecord as BaseAnswerRecord } from '@tupaia/database';
import { Answer } from '@tupaia/types';
import { Model } from './types';

export interface AnswerRecord extends Answer, BaseAnswerRecord {}

export interface AnswerModel extends Model<BaseAnswerModel, Answer, AnswerRecord> {}

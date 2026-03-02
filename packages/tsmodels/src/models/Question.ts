import {
  QuestionModel as BaseQuestionModel,
  QuestionRecord as BaseQuestionRecord,
} from '@tupaia/database';
import { Question } from '@tupaia/types';
import { Model } from './types';

export interface QuestionRecord extends Question, BaseQuestionRecord {}

export interface QuestionModel extends Model<BaseQuestionModel, Question, QuestionRecord> {}

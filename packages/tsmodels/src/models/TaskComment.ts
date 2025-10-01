import {
  TaskCommentRecord as BaseTaskCommentRecord,
  TaskCommentModel as BaseTaskCommentModel,
} from '@tupaia/database';
import { TaskComment } from '@tupaia/types';
import { Model } from './types';

export interface TaskCommentRecord extends TaskComment, BaseTaskCommentRecord {}

export interface TaskCommentModel
  extends Model<BaseTaskCommentModel, TaskComment, TaskCommentRecord> {}

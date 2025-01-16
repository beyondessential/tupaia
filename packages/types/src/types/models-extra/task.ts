import { Task } from '../models';

export enum SystemCommentSubType {
  update = 'update',
  create = 'create',
  overdue = 'overdue',
  complete = 'complete',
}

export type TaskUpdateCommentTemplateVariables = {
  type: SystemCommentSubType.update;
  originalValue?: string | number;
  newValue?: string | number;
  field?: string;
};

export type TaskCreateCommentTemplateVariables = {
  type: SystemCommentSubType.create;
};

export type TaskCompletedCommentTemplateVariables = {
  type: SystemCommentSubType.complete;
  taskId?: Task['id'];
};

export type TaskCommentTemplateVariables =
  | TaskUpdateCommentTemplateVariables
  | TaskCreateCommentTemplateVariables
  | TaskCompletedCommentTemplateVariables;

export type RepeatSchedule = Record<string, unknown> & {
  freq?: number;
  interval?: number;
  bymonthday?: number | number[] | null;
  bysetpos?: number | number[] | null;
  dtstart?: Date | null;
};

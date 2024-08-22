import { Task } from '../models';

/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

export enum SystemCommentSubType {
  update = 'update',
  create = 'create',
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

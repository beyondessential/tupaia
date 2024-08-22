import { Task } from '../models';

/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

export enum SystemCommentType {
  update = 'update',
  create = 'create',
  complete = 'complete',
}

export type TaskUpdateCommentTemplateVariables = {
  type: SystemCommentType.update;
  originalValue?: string | number;
  newValue?: string | number;
  field?: string;
};

export type TaskCreateCommentTemplateVariables = {
  type: SystemCommentType.create;
};

export type TaskCompletedCommentTemplateVariables = {
  type: SystemCommentType.complete;
  taskId?: Task['id'];
};

export type TaskCommentTemplateVariables =
  | TaskUpdateCommentTemplateVariables
  | TaskCreateCommentTemplateVariables
  | TaskCompletedCommentTemplateVariables;

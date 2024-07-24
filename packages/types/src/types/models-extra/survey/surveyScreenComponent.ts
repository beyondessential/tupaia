/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Entity, EntityType, PermissionGroup, Question, Survey, UserAccount } from '../../models';

export type CodeGeneratorQuestionConfig = {
  type: 'shortid' | 'mongoid';
  prefix?: string;
  length?: number;
  chunkLength?: number;
  alphabet?: string;
};

export type AutocompleteQuestionConfig = {
  createNew?: boolean;
  attributes?: {
    [key: string]: { questionId: Question['id'] };
  };
};

export type ConditionQuestionConfig = {
  conditions: {
    [key: string]: {
      formula: string;
      defaultValues?: Record<Question['id'], any>;
    };
  };
};

export type EntityQuestionConfigFields = keyof Omit<
  Entity,
  'region' | 'bounds' | 'point' | 'parent_id'
>;
type QuestionValue = { questionId: Question['id'] };

/**
 * @description This is the possible field key type for the `fields` object in the entity question config. In the case of the `parentId` field, the key will be camel-cased instead, so that is why we have to explicitly include it in the `FieldKey` type and also in the `FieldValue` type.
 */
export type EntityQuestionConfigFieldKey = EntityQuestionConfigFields | 'parentId';
export type EntityQuestionConfigFieldValue =
  | Entity[EntityQuestionConfigFields]
  | QuestionValue
  | Entity['parent_id'];

export type EntityQuestionConfig = {
  createNew?: boolean;
  fields?: Partial<Record<EntityQuestionConfigFieldKey, EntityQuestionConfigFieldValue>>;
  filter?: {
    type?: EntityType[] | EntityType;
    grandparentId?: QuestionValue;
    parentId?: QuestionValue;
    attributes?: Record<string, QuestionValue>;
  };
  // This is needed to support the old format of the entity question config
  [key: string]: any;
};

export type ArithmeticQuestionConfig = {
  formula: string;
  defaultValues?: Record<Question['id'], any>;
  answerDisplayText?: string;
  valueTranslation?: Record<
    Question['id'],
    {
      [key: string]: string | number;
    }
  >;
};

export type UserQuestionConfig = {
  /**
   * @description If this is a question value, the user list will be filtered by the value of the question.  If this is a permission group name, the user list will be filtered by the permission group.
   */
  filter: {
    permissionGroup: QuestionValue | PermissionGroup['name'];
  };
};

export type TaskQuestionConfig = {
  /**
   * @description If this is a boolean value, a task will be created if the value is true. If this is a question value, a task will be created if the value of the question is true.
   */
  shouldCreateTask: QuestionValue | boolean;
  /**
   * @description If this is a question value, the task will be created with the value of the question as the task entity. If this is a string, the task will be created with the entity code as the task entity.
   */
  entityCode: QuestionValue | Entity['code'];
  /**
   * @description If this is a question value, the task will be created with the value of the question as the task survey. If this is a string, the task will be created with the survey code as the task survey.
   */
  surveyCode: QuestionValue | Survey['code'];
  /**
   * @description If this is a question value, the task will be created with the value of the question as the task due date. If this is a string, the task will be created with the string as the task due date.
   */
  dueDate: QuestionValue | string;
  /**
   * @description If this is a question value, the task will be created with the value of the question as the task assignee. If this is a string, the task will be created with the user id as the task assignee.
   */
  assignee: QuestionValue | UserAccount['id'];
};

export type SurveyScreenComponentConfig = {
  codeGenerator?: CodeGeneratorQuestionConfig;
  autocomplete?: AutocompleteQuestionConfig;
  entity?: EntityQuestionConfig;
  condition?: ConditionQuestionConfig;
  arithmetic?: ArithmeticQuestionConfig;
  user?: UserQuestionConfig;
  task?: TaskQuestionConfig;
};

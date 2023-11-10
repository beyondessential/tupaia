/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Question } from '../../models';

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

export type EntityQuestionConfig = {
  createNew?: boolean;
  fields?: Record<string, string | { questionId: Question['id'] }>;
  filter?: {
    type?: string[] | string;
    grandparentId?: { questionId: Question['id'] };
    parentId?: { questionId: Question['id'] };
    attributes?: {
      [key: string]: { questionId: Question['id'] };
    };
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

export type SurveyScreenComponentConfig = {
  codeGenerator?: CodeGeneratorQuestionConfig;
  autocomplete?: AutocompleteQuestionConfig;
  entity?: EntityQuestionConfig;
  condition?: ConditionQuestionConfig;
  arithmetic?: ArithmeticQuestionConfig;
};

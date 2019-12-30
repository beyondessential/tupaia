/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 **/

import { ANSWER_TYPES } from '../../../../database/models/Answer';
import { BaseValidator } from '../BaseValidator';
import { IsEmptyValidator } from './IsEmptyValidator';
import { CodeGeneratorConfigValidator } from './CodeGeneratorConfigValidator';
import { EntityConfigValidator } from './EntityConfigValidator';

const { CODE_GENERATOR, ENTITY, PRIMARY_ENTITY } = ANSWER_TYPES;

export class ConfigValidator extends BaseValidator {
  async validate(rowIndex) {
    const questionType = this.getQuestion(rowIndex).type;
    const Validator = this.getValidator(questionType);

    return new Validator(this.questions).validate(rowIndex);
  }

  getValidator = questionType => {
    switch (questionType) {
      case ENTITY:
      case PRIMARY_ENTITY:
        return EntityConfigValidator;
      case CODE_GENERATOR:
        return CodeGeneratorConfigValidator;
      default:
        return IsEmptyValidator;
    }
  };
}

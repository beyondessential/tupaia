/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { constructIsNotPresentOr, constructIsValidEntityType, hasContent } from '@tupaia/utils';
import { validateIsYesOrNo } from '../../validatorFunctions';
import { ANSWER_TYPES } from '../../../../../database/models/Answer';
import { isEmpty, isYes } from '../../utilities';
import { JsonFieldValidator } from '../JsonFieldValidator';

const { ENTITY, PRIMARY_ENTITY } = ANSWER_TYPES;

const isEntityQuestion = ({ type }) => [ENTITY, PRIMARY_ENTITY].includes(type);

const hasContentIfCanCreateNew = (value, object, key) => {
  const canCreateNew = isYes(object.createNew);
  if (canCreateNew) {
    if (isEmpty(value)) {
      throw new Error('Should not be empty if createNew is Yes');
    }
  } else if (object.hasOwnProperty(key)) {
    throw new Error('Can only be present if createNew is Yes');
  }

  return true;
};

export class EntityConfigValidator extends JsonFieldValidator {
  constructor(questions, models) {
    super(questions);
    this.models = models;
  }

  static fieldName = 'config';

  getFieldValidators(rowIndex) {
    const pointsToAnotherQuestion = this.constructPointsToAnotherQuestion(rowIndex);
    const pointsToPrecedingEntityQuestion = this.constructPointsToPrecedingEntityQuestion(rowIndex);
    const pointsToValidPrecedingEntityQuestion = constructIsNotPresentOr(
      (...params) =>
        hasContent(...params) &&
        pointsToAnotherQuestion(...params) &&
        pointsToPrecedingEntityQuestion(...params),
    );

    return {
      type: [hasContent, constructIsValidEntityType(this.models.entity)],
      createNew: [constructIsNotPresentOr(validateIsYesOrNo)],
      code: [hasContentIfCanCreateNew, constructIsNotPresentOr(pointsToAnotherQuestion)],
      name: [hasContentIfCanCreateNew, constructIsNotPresentOr(pointsToAnotherQuestion)],
      parent: [pointsToValidPrecedingEntityQuestion],
      grandparent: [pointsToValidPrecedingEntityQuestion],
      'attributes.type': [constructIsNotPresentOr(pointsToAnotherQuestion)],
    };
  }

  constructPointsToPrecedingEntityQuestion(rowIndex) {
    return value => {
      const questionCode = value;
      const question = this.findOtherQuestion(questionCode, rowIndex, rowIndex);

      if (!isEntityQuestion(question)) {
        throw new Error(`Should reference a preceding entity question`);
      }

      return true;
    };
  }
}

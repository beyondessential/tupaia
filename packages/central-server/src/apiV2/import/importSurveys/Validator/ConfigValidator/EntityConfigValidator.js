import {
  ValidationError,
  constructIsNotPresentOr,
  constructIsValidEntityType,
  constructIsValidEntityTypes,
  hasContent,
} from '@tupaia/utils';
import { validateIsYesOrNo } from '../../validatorFunctions';
import { ANSWER_TYPES } from '../../../../../database/models/Answer';
import { convertCellToJson, isEmpty, isYes } from '../../utilities';
import { JsonFieldValidator } from '../JsonFieldValidator';

const { ENTITY, PRIMARY_ENTITY } = ANSWER_TYPES;

const isEntityQuestion = ({ type }) => [ENTITY, PRIMARY_ENTITY].includes(type);

const isNotPresentIfNotCreateNew = (value, object, key) => {
  const canCreateNew = isYes(object.createNew);
  if (!canCreateNew) {
    if (object.hasOwnProperty(key)) {
      throw new Error('Can only be present if createNew is Yes');
    }
  }
  return true;
};

const isNotPresentIfCreateNew = (value, object, key) => {
  const canCreateNew = isYes(object.createNew);
  if (canCreateNew) {
    if (object.hasOwnProperty(key)) {
      throw new Error('Can not be present if createNew is Yes');
    }
  }
  return true;
};

const hasContentOnlyIfCanCreateNew = (value, object, key) => {
  const canCreateNew = isYes(object.createNew);
  if (canCreateNew) {
    if (isEmpty(value)) {
      throw new Error('Should not be empty if createNew is Yes');
    }
  }

  return isNotPresentIfNotCreateNew(value, object, key);
};

const hasContentOnlyIfNotCreateNew = (value, object, key) => {
  const canCreateNew = isYes(object.createNew);
  if (!canCreateNew) {
    if (isEmpty(value)) {
      throw new Error('Should not be empty if createNew is No');
    }
  }

  return isNotPresentIfCreateNew(value, object, key);
};

const hasContentIfCanCreateNew = (value, object) => {
  const canCreateNew = isYes(object.createNew);
  if (canCreateNew) {
    if (isEmpty(value)) {
      throw new Error('Should not be empty if createNew is Yes');
    }
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

    const pointsToMandatoryCodeGeneratorQuestion =
      this.constructPointsToMandatoryCodeGeneratorQuestion(rowIndex);

    const pointsToAnotherMandatoryQuestion = this.constructPointsToMandatoryQuestion(rowIndex);

    return {
      allowScanQrCode: [constructIsNotPresentOr(validateIsYesOrNo)],
      createNew: [constructIsNotPresentOr(validateIsYesOrNo)],
      hideParentName: [constructIsNotPresentOr(validateIsYesOrNo)],
      generateQrCode: [isNotPresentIfNotCreateNew, constructIsNotPresentOr(validateIsYesOrNo)],
      'attributes.type': [constructIsNotPresentOr(pointsToAnotherQuestion)],
      'fields.code': [
        hasContentOnlyIfCanCreateNew,
        constructIsNotPresentOr(pointsToMandatoryCodeGeneratorQuestion),
      ],
      'fields.name': [
        hasContentIfCanCreateNew,
        constructIsNotPresentOr(pointsToAnotherMandatoryQuestion),
      ],
      'fields.parent': [pointsToValidPrecedingEntityQuestion],
      'fields.grandparent': [pointsToValidPrecedingEntityQuestion],
      'fields.type': [
        hasContentIfCanCreateNew,
        constructIsNotPresentOr(constructIsValidEntityType(this.models.entity)),
      ],
      'fields.attributes.type': [constructIsNotPresentOr(pointsToAnotherQuestion)],
      'filter.parent': [pointsToValidPrecedingEntityQuestion],
      'filter.grandparent': [pointsToValidPrecedingEntityQuestion],
      'filter.type': [
        hasContentOnlyIfNotCreateNew,
        constructIsNotPresentOr(constructIsValidEntityTypes(this.models.entity)),
      ],
      'filter.attributes.type': [constructIsNotPresentOr(pointsToAnotherQuestion)],
    };
  }

  constructPointsToMandatoryCodeGeneratorQuestion(rowIndex) {
    return value => {
      const questionCode = value;
      const question = this.findOtherQuestion(questionCode, rowIndex, this.questions.length);

      if (!question) {
        throw new ValidationError(`Should reference another code generator question in the survey`);
      }

      if (question.type !== 'CodeGenerator') {
        throw new ValidationError(`Referenced question should be a code generator question`);
      }

      return true;
    };
  }

  constructPointsToMandatoryQuestion(rowIndex) {
    return value => {
      const questionCode = value;
      const question = this.findOtherQuestion(questionCode, rowIndex, this.questions.length);

      if (!question) {
        throw new ValidationError(`Should reference another question in the survey`);
      }

      if (!question.validationCriteria) {
        throw new ValidationError(`Referenced question should be mandatory`);
      }

      const { validationCriteria } = question;
      const parsedValidationCriteria = convertCellToJson(validationCriteria);

      if (!parsedValidationCriteria.mandatory || parsedValidationCriteria.mandatory !== 'true') {
        throw new ValidationError(`Referenced question should be mandatory`);
      }

      return true;
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

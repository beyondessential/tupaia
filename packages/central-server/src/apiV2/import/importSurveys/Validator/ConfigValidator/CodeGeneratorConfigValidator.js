import { constructIsNotPresentOr, constructIsOneOf, isNumber } from '@tupaia/utils';
import { JsonFieldValidator } from '../JsonFieldValidator';
import { CODE_GENERATORS } from '../../codeGenerators';

export class CodeGeneratorConfigValidator extends JsonFieldValidator {
  static fieldName = 'config';

  getFieldValidators(rowIndex) {
    const pointsToAnotherQuestion = this.constructPointsToAnotherQuestion(rowIndex);

    return {
      type: [constructIsNotPresentOr(constructIsOneOf(Object.values(CODE_GENERATORS)))],
      alphabet: [() => true],
      length: [constructIsNotPresentOr(isNumber)],
      chunkLength: [constructIsNotPresentOr(isNumber)],
      prefix: [() => true],
      dynamicPrefix: [constructIsNotPresentOr(pointsToAnotherQuestion)],
      'dynamicPrefix.entityField': [() => true],
      'dynamicPrefix.entityAttribute': [() => true],
    };
  }
}

import { constructIsNotPresentOr, constructIsOneOf, isNumber } from '../../../../validation';
import { JsonFieldValidator } from '../JsonFieldValidator';
import { CODE_GENERATORS } from '../../codeGenerators';

export class CodeGeneratorConfigValidator extends JsonFieldValidator {
  static fieldName = 'config';

  getFieldValidators = () => ({
    type: [constructIsNotPresentOr(constructIsOneOf(Object.values(CODE_GENERATORS)))],
    alphabet: [() => true],
    length: [constructIsNotPresentOr(isNumber)],
    chunkLength: [constructIsNotPresentOr(isNumber)],
    prefix: [() => true],
  });
}

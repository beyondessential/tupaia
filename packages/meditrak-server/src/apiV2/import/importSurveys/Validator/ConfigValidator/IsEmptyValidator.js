import { isEmpty } from '../../utilities';
import { BaseValidator } from '../BaseValidator';

export class IsEmptyValidator extends BaseValidator {
  async validate(rowIndex, fieldName) {
    const field = this.getField(rowIndex, fieldName);
    if (!isEmpty(field)) {
      const questionType = this.getQuestion(rowIndex).type;
      throw new Error(`Questions of type ${questionType} do not support config`);
    }

    return true;
  }
}

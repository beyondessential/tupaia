import { isNotPresent, ObjectValidator } from '@tupaia/utils';
import { convertCellToJson } from '../utilities';
import { BaseValidator } from './BaseValidator';

export class JsonFieldValidator extends BaseValidator {
  static fieldName = null;

  /**
   * @param {number} rowIndex
   * @param {function} constructError
   */
  async validate(rowIndex, constructError) {
    const config = this.getConfig(rowIndex);

    const fieldValidators = this.getFieldValidators(rowIndex);
    const otherFieldValidators = this.getOtherFieldValidators();

    await new ObjectValidator(fieldValidators, otherFieldValidators).validate(
      config,
      constructError,
    );

    return true;
  }

  getConfig(rowIndex) {
    const fieldName = this.getFieldName();
    const field = this.getField(rowIndex, fieldName);
    return this.parseField(field);
  }

  getFieldName() {
    const { fieldName } = this.constructor;
    if (!fieldName) {
      throw new Error('Any subclass of JsonFieldValidator must define a "fieldName" property');
    }

    return fieldName;
  }

  parseField = convertCellToJson;

  /**
   * @abstract
   */
  getFieldValidators() {
    throw new Error(
      'Any subclass of JsonFieldValidator must implement the "getFieldValidators" method',
    );
  }

  getOtherFieldValidators = () => isNotPresent;
}

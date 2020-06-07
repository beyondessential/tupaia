/* eslint-disable class-methods-use-this */

import { isNotPresent, ObjectValidator } from '@tupaia/utils';
import { convertCellToJson } from '../utilities';
import { BaseValidator } from './BaseValidator';

export class JsonFieldValidator extends BaseValidator {
  static fieldName = null;

  /**
   * @param {number} rowIndex
   */
  async validate(rowIndex) {
    const fieldName = this.getFieldName();
    const field = this.getField(rowIndex, fieldName);
    const config = this.parseField(field);

    const fieldValidators = this.getFieldValidators(rowIndex);
    const otherFieldValidators = this.getOtherFieldValidators();
    await new ObjectValidator(fieldValidators, otherFieldValidators).validate(config);

    return true;
  }

  getFieldName() {
    const fieldName = this.constructor.fieldName;
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

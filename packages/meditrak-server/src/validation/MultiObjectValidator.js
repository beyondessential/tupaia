/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ObjectValidator } from './ObjectValidator';
import { ValidationError } from '../errors';

export class MultiObjectValidator {
  constructor(fieldValidators, defaultValidators) {
    this.validator = new ObjectValidator(fieldValidators, defaultValidators);
  }

  async validateOne(object) {
    if (!object) throw new ValidationError('Every object being validated should exist');
    return this.validator.validate(object);
  }

  async validate(objects) {
    return Promise.all(
      objects.map(async (o, i) => {
        try {
          await this.validateOne(o);
          return null;
        } catch (e) {
          return { row: i, error: e.message };
        }
      }),
    );
  }
}

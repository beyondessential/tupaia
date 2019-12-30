/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { KeyValueCellBuilder } from './KeyValueCellBuilder';

export class CodeGeneratorConfigCellBuilder extends KeyValueCellBuilder {
  // disable class-methods-use-this for functions that are overriding parent methods
  /*eslint-disable class-methods-use-this */
  extractRelevantObject({ codeGenerator }) {
    return codeGenerator;
  }
  /*eslint-enable class-methods-use-this */
}

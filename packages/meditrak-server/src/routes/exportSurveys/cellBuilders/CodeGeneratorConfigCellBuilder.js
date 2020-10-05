/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { KeyValueCellBuilder } from './KeyValueCellBuilder';

export class CodeGeneratorConfigCellBuilder extends KeyValueCellBuilder {
  extractRelevantObject({ codeGenerator }) {
    return codeGenerator;
  }
}

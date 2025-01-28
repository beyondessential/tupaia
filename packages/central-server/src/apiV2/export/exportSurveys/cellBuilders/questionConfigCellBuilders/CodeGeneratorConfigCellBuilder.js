import { KeyValueCellBuilder } from '../KeyValueCellBuilder';

export class CodeGeneratorConfigCellBuilder extends KeyValueCellBuilder {
  extractRelevantObject({ codeGenerator }) {
    return codeGenerator;
  }
}

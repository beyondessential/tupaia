import { KeyValueCellBuilder } from '../KeyValueCellBuilder';

export class CodeGeneratorConfigCellBuilder extends KeyValueCellBuilder {
  individualFieldProcessors = {
    dynamicPrefix: async (models, dynamicPrefixObject = {}) => {
      const processedEntries = await Promise.all(
        Object.entries(dynamicPrefixObject).map(async ([subField, value]) => {
          const field = `dynamicPrefix.${subField}`;
          if (subField === 'questionId') {
            const code = await this.fetchQuestionCode({ questionId: value });
            return `dynamicPrefix: ${code}`;
          }
          return `${field}: ${value}`;
        }),
      );
      return processedEntries.join('\r\n');
    },
  };

  extractRelevantObject({ codeGenerator }) {
    return codeGenerator;
  }
}

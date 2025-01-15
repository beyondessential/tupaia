import { KeyValueCellBuilder } from './KeyValueCellBuilder';

export class VisibilityCriteriaCellBuilder extends KeyValueCellBuilder {
  async processField(criterionKey) {
    // criterionKey is usually a questionId, but is sometimes "_conjunction" etc.
    const question = await this.models.question.findById(criterionKey);
    return question ? question.code : criterionKey;
  }

  async processValue(value) {
    return Array.isArray(value) ? value.join(', ') : value;
  }
}

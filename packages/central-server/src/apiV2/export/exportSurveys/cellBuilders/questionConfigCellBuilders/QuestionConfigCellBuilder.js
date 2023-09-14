/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ANSWER_TYPES } from '../../../../../database/models/Answer';
import { ArithmeticConfigCellBuilder } from './ArithmeticConfigCellBuilder';
import { AutocompleteConfigCellBuilder } from './AutocompleteConfigCellBuilder';
import { CodeGeneratorConfigCellBuilder } from './CodeGeneratorConfigCellBuilder';
import { ConditionConfigCellBuilder } from './ConditionConfigCellBuilder';
import { EntityConfigCellBuilder } from './EntityConfigCellBuilder';

const {
  CODE_GENERATOR,
  ARITHMETIC,
  CONDITION,
  AUTOCOMPLETE,
  ENTITY,
  PRIMARY_ENTITY,
} = ANSWER_TYPES;

export class QuestionConfigCellBuilder {
  constructor(models) {
    this.models = models;

    this.configCellBuilders = {
      [AUTOCOMPLETE]: new AutocompleteConfigCellBuilder(models),
      [CODE_GENERATOR]: new CodeGeneratorConfigCellBuilder(models),
      [CONDITION]: new ConditionConfigCellBuilder(models),
      [ARITHMETIC]: new ArithmeticConfigCellBuilder(models),
      [ENTITY]: new EntityConfigCellBuilder(models),
      [PRIMARY_ENTITY]: new EntityConfigCellBuilder(models),
    };
  }

  async build(config, questionType) {
    const builder = this.configCellBuilders[questionType];
    return builder ? builder.build(config) : '';
  }
}

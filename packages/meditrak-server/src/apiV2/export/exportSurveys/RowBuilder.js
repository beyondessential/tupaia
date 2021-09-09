/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { strictJsonParseValue } from '@tupaia/utils';

import {
  AutocompleteConfigCellBuilder,
  CodeGeneratorConfigCellBuilder,
  EntityConfigCellBuilder,
  KeyValueCellBuilder,
  VisibilityCriteriaCellBuilder,
} from './cellBuilders';

export class RowBuilder {
  constructor(models, rawRows) {
    this.models = models;
    this.rawRows = rawRows;
    this.validationCriteriaCellBuilder = new KeyValueCellBuilder(models);
    this.visibilityCriteriaCellBuilder = new VisibilityCriteriaCellBuilder(models);
    const entityConfigCellBuilder = new EntityConfigCellBuilder(models);
    this.configCellBuilders = {
      Autocomplete: new AutocompleteConfigCellBuilder(models),
      CodeGenerator: new CodeGeneratorConfigCellBuilder(models),
      Entity: entityConfigCellBuilder,
      PrimaryEntity: entityConfigCellBuilder,
    };
    this.build = this.build.bind(this);
  }

  async buildConfigCell(questionType, config) {
    const builder = this.configCellBuilders[questionType];
    return builder ? builder.build(config) : '';
  }

  async build(rowData, index) {
    const {
      id,
      options,
      screen_number: screenNumber,
      visibility_criteria: visibilityCriteria,
      validation_criteria: validationCriteria,
      option_set_id: optionSetId,
      question_label: questionLabel,
      detail_label: detailLabel,
      config,
      ...restOfRowData
    } = rowData;
    const optionSetObject = optionSetId && (await this.models.optionSet.findById(optionSetId));
    const optionLabels = [];
    const optionColors = [];
    const processedOptions = [];
    options.forEach((option, optionIndex) => {
      try {
        const { value, label, color } = strictJsonParseValue(option);

        // Do not export any options for Binary questions because they have fixed options (Yes/No)
        if (restOfRowData.type !== 'Binary') {
          processedOptions[optionIndex] = value;
        }

        if (label) {
          optionLabels[optionIndex] = label;
        }

        if (color) {
          optionColors[optionIndex] = color;
        }
      } catch (error) {
        processedOptions[optionIndex] = option;
      }
    });

    let newScreen = 'Yes';
    if (index > 0 && this.rawRows[index - 1].screen_number === screenNumber) {
      newScreen = '';
    }

    return {
      ...restOfRowData,
      newScreen,
      config: await this.buildConfigCell(restOfRowData.type, config),
      options: processedOptions.join('\r\n'),
      optionLabels: optionLabels.join('\r\n'),
      optionColors: optionColors.join('\r\n'),
      visibilityCriteria: await this.visibilityCriteriaCellBuilder.build(visibilityCriteria),
      validationCriteria: await this.validationCriteriaCellBuilder.build(validationCriteria),
      optionSet: optionSetObject && optionSetObject.name,
      questionLabel,
      detailLabel,
    };
  }
}

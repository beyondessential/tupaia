import { strictJsonParseValue } from '@tupaia/utils';

import {
  KeyValueCellBuilder,
  VisibilityCriteriaCellBuilder,
  QuestionConfigCellBuilder,
} from './cellBuilders';

export class RowBuilder {
  constructor(models, rawRows) {
    this.models = models;
    this.rawRows = rawRows;
    this.validationCriteriaCellBuilder = new KeyValueCellBuilder(models);
    this.visibilityCriteriaCellBuilder = new VisibilityCriteriaCellBuilder(models);
    this.questionConfigCellBuilder = new QuestionConfigCellBuilder(models);
    this.build = this.build.bind(this);
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
      config: await this.questionConfigCellBuilder.build(restOfRowData.type, config),
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

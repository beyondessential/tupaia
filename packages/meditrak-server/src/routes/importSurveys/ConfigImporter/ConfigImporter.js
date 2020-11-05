/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { ANSWER_TYPES } from '../../../database/models/Answer';
import { convertCellToJson } from '../utilities';
import { ConfigValidator } from '../Validator/ConfigValidator';
import { processCodeGeneratorConfig } from './processCodeGeneratorConfig';
import { processAutocompleteConfig } from './processAutocompleteConfig';
import { processEntityConfig } from './processEntityConfig';

const { CODE_GENERATOR, AUTOCOMPLETE, ENTITY, PRIMARY_ENTITY } = ANSWER_TYPES;

export class ConfigImporter {
  parse = convertCellToJson;

  isConfigEmpty = config => Object.entries(config).length === 0;

  constructor(models, questions) {
    this.models = models;
    this.questions = questions;
    this.validator = new ConfigValidator(questions, models);
    this.rowIndexToComponentId = {};
  }

  /**
   * @public
   *
   * @param {number} rowIndex
   * @param {string} componentId
   * @throws {Error}
   */
  async add(rowIndex, componentId) {
    await this.validator.validate(rowIndex);
    this.rowIndexToComponentId[rowIndex] = componentId;
  }

  /**
   * @public
   */
  async import() {
    return Promise.all(
      Object.entries(this.rowIndexToComponentId).map(async ([rowIndex, componentId]) =>
        this.importOne(rowIndex, componentId),
      ),
    );
  }

  async importOne(rowIndex, componentId) {
    const question = this.questions[rowIndex];
    const config = this.parse(question.config);
    if (this.isConfigEmpty(config)) {
      return null;
    }

    const processedConfig = await this.process(config, question.type);
    return this.updateComponentConfig(componentId, processedConfig);
  }

  process = async (config, questionType) => {
    switch (questionType) {
      case CODE_GENERATOR: {
        const codeGeneratorConfig = processCodeGeneratorConfig(config);
        return { codeGenerator: codeGeneratorConfig };
      }
      case AUTOCOMPLETE: {
        const autocompleteConfig = await processAutocompleteConfig(this.models, config);
        return { autocomplete: autocompleteConfig };
      }
      case ENTITY:
      case PRIMARY_ENTITY: {
        const entityConfig = await processEntityConfig(this.models, config);
        return { entity: entityConfig };
      }
      default:
        return {};
    }
  };

  async updateComponentConfig(componentId, config) {
    const component = await this.models.surveyScreenComponent.findById(componentId);
    const visibilityCriteria = JSON.parse(component.visibility_criteria);

    if (!visibilityCriteria.hasOwnProperty('hidden') && config.entity && config.entity.createNew) {
      visibilityCriteria.hidden = true;
    }

    component.config = JSON.stringify(config);
    component.visibility_criteria = JSON.stringify(visibilityCriteria);

    return component.save();
  }
}

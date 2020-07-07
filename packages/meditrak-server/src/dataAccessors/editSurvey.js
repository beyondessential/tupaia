/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getDataGroupsThatIncludeElement } from '../database';
import { NON_DATA_ELEMENT_ANSWER_TYPES } from '../database/models/Answer';

const areBothDefinedAndDifferent = (oldValue, newValue) =>
  oldValue !== undefined && newValue !== undefined && oldValue !== newValue;

const getDhis2ServerName = config => `${config.isDataRegional ? '' : 'non '}regional`;

class SurveyEditor {
  constructor(models) {
    this.models = models;
  }

  async edit(recordId, updatedFields) {
    this.survey = await this.models.survey.findById(recordId);
    this.dataGroup = await this.survey.dataGroup();
    this.updatedFieldsByDbType = this.getUpdatedFieldsByDbType(updatedFields);

    // Check for performance reasons
    if (this.shouldUpdateDataGroupsAndElements()) {
      await this.updateDataGroupAndElements();
    }
    await this.updateSurvey();
  }

  getUpdatedFieldsByDbType = updatedFields => {
    const {
      'data_source.service_type': serviceType,
      'data_source.config': config,
      ...updatedSurveyFields
    } = updatedFields;

    return {
      [this.models.dataSource.databaseType]: { service_type: serviceType, config },
      [this.models.survey.databaseType]: updatedSurveyFields,
    };
  };

  getUpdatedFieldsForModel = model => {
    return this.updatedFieldsByDbType[model.databaseType];
  };

  shouldUpdateDataGroupsAndElements = () => {
    const updatedFields = this.getUpdatedFieldsForModel(this.dataGroup);
    return Object.values(updatedFields).some(field => field !== undefined);
  };

  updateDataGroupAndElements = async () => {
    const existingDataElements = await this.fetchDataElementsInGroup(this.dataGroup.code);

    await this.updateDataElements(existingDataElements);
    await this.updateDataGroup();
    await this.createMissingDataElements(existingDataElements);
    await this.createMissingDataElementToGroupAssociations();
  };

  fetchDataElementsInGroup = async () => {
    // TODO Use `this.model.dataSource.getDataElementsInGroup()` method instead
    // when tupaia-backlog#663 is implemented
    const questions = await this.survey.questions();

    return this.models.dataSource.find({
      code: questions.map(({ code }) => code),
      type: this.models.dataSource.getTypes().DATA_ELEMENT,
    });
  };

  updateDataElements = async dataElements => {
    const updateDataElement = async dataElement => {
      await this.assertDataElementCanBeUpdated(dataElement);
      await this.updateResource(dataElement);
    };
    return Promise.all(dataElements.map(updateDataElement));
  };

  assertDataElementCanBeUpdated = async dataElement => {
    const { service_type: newServiceType, config: newConfig = {} } = this.getUpdatedFieldsForModel(
      dataElement,
    );

    const dataGroups = await getDataGroupsThatIncludeElement(this.models, dataElement.code);
    const otherDataGroups = dataGroups.filter(({ id }) => id !== this.dataGroup.id);
    otherDataGroups.forEach(otherDataGroup => {
      const { service_type: serviceType, config } = otherDataGroup;

      if (areBothDefinedAndDifferent(serviceType, newServiceType)) {
        throw new Error(
          `Cannot update service type to '${newServiceType}': question '${
            dataElement.code
          }' is included in survey '${otherDataGroup.code}', which uses a different service type`,
        );
      }

      if (areBothDefinedAndDifferent(config.isDataRegional, newConfig.isDataRegional)) {
        throw new Error(
          `Cannot update DHIS server to ${getDhis2ServerName(config)}, since question '${
            dataElement.code
          }' is included in survey '${otherDataGroup.code}', which uses the ${getDhis2ServerName(
            newConfig,
          )} server`,
        );
      }
    });
  };

  createMissingDataElements = async existingDataElements => {
    // TODO delete this method when tupaia-backlog#663 is implemented
    const questionCodeCondition =
      existingDataElements.length > 0
        ? ` AND q.code NOT IN (${existingDataElements.map(() => '?')})`
        : '';

    const missingDataElements = await this.models.database.executeSql(
      `
      SELECT q.code, 'dataElement' AS type, ds.service_type, ds.config
      FROM question q
      JOIN survey_screen_component ssc ON ssc.question_id = q.id
      JOIN survey_screen ss ON ss.id = ssc.screen_id 
      JOIN survey s ON s.id = ss.survey_id
      JOIN data_source ds ON ds.id = s.data_source_id
      WHERE
        ds.code = ? AND
        ds.type = 'dataGroup' AND
        q.type NOT IN (${NON_DATA_ELEMENT_ANSWER_TYPES.map(type => `'${type}'`).join(',')})
        ${questionCodeCondition}
    `,
      [this.dataGroup.code, ...existingDataElements.map(({ code }) => code)],
    );

    const createMissingDataElement = async dataElement => {
      const { id } = await this.models.dataSource.create(dataElement);
      await this.models.question.update({ code: dataElement.code }, { data_source_id: id });
    };
    return Promise.all(missingDataElements.map(createMissingDataElement));
  };

  createMissingDataElementToGroupAssociations = async () => {
    // TODO delete this method when tupaia-backlog#663 is implemented
    const dataElements = await this.fetchDataElementsInGroup();

    const createAssociation = dataElement =>
      this.models.dataElementDataGroup.findOrCreate({
        data_element_id: dataElement.id,
        data_group_id: this.dataGroup.id,
      });
    return Promise.all(dataElements.map(createAssociation));
  };

  updateDataGroup = async () => {
    return this.updateResource(this.dataGroup);
  };

  updateSurvey = async () => {
    return this.updateResource(this.survey);
  };

  /**
   * @param {DatabaseModel} model - mutated
   */
  updateResource = async model => {
    const updatedFields = this.getUpdatedFieldsForModel(model);
    Object.entries(updatedFields).forEach(([fieldName, fieldValue]) => {
      // eslint-disable-next-line no-param-reassign
      model[fieldName] = fieldValue;
    });
    return model.save();
  };
}

export const editSurvey = async (models, id, updatedFields) => {
  return models.wrapInTransaction(async transactingModels => {
    const surveyEditor = new SurveyEditor(transactingModels);
    return surveyEditor.edit(id, updatedFields);
  });
};

/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { assertCanAddDataElementInGroup } from '../database';
import { NON_DATA_ELEMENT_ANSWER_TYPES } from '../database/models/Answer';

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
    const updatedFields = this.updatedFieldsByDbType[this.models.dataSource.databaseType];

    const updateDataElement = async dataElement => {
      await assertCanAddDataElementInGroup(
        this.models,
        dataElement.code,
        this.dataGroup.code,
        updatedFields,
      );
      await this.updateResource(dataElement);
    };
    return Promise.all(dataElements.map(updateDataElement));
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
    const isDataSource = model.databaseType === this.models.dataSource.databaseType;

    Object.entries(updatedFields).forEach(([fieldName, fieldValue]) => {
      if (isDataSource && (fieldName === 'config' || fieldValue === undefined)) {
        // Handle config last since its value depends on other fields
        // For the same reason, do not set model fields to `undefined`
        // so that the actual record values can be used for config calculation
        return;
      }
      // eslint-disable-next-line no-param-reassign
      model[fieldName] = fieldValue;
    });
    if (isDataSource) {
      this.updateDataSourceConfig(model, updatedFields);
    }

    return model.save();
  };

  /**
   * @param {DatabaseModel} model - mutated
   */
  updateDataSourceConfig = (model, updatedFields) => {
    if ('config' in updatedFields) {
      // Retain existing fields in data source config
      // eslint-disable-next-line no-param-reassign
      model.config = { ...model.config, ...updatedFields.config };
    }
    model.sanitizeConfig();
  };
}

export const editSurvey = async (models, id, updatedFields) => {
  return models.wrapInTransaction(async transactingModels => {
    const surveyEditor = new SurveyEditor(transactingModels);
    return surveyEditor.edit(id, updatedFields);
  });
};

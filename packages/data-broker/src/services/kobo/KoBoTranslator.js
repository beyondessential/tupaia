/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';

export class KoBoTranslator {
  constructor(models) {
    this.models = models;
  }

  async fetchEntityInfoFromKoBoAnswer(koboEntityCode) {
    const entityMapping = await this.models.dataServiceEntity.findOne({
      'config->>koboId': koboEntityCode,
    });
    const entity = await this.models.entity.findOne({ code: entityMapping.entity_code });
    return { orgUnit: entity.code, orgUnitName: entity.name };
  }

  async translateKoBoDataValues(dataValues) {
    const dataSources = await this.models.dataSource.find({
      code: Object.keys(dataValues),
      service_type: 'kobo',
    });
    const dataSourceByKoBoCode = keyBy(dataSources, 'code');
    const translatedValues = {};
    for (const [key, value] of Object.entries(dataValues)) {
      if (dataSourceByKoBoCode[key]) {
        translatedValues[dataSourceByKoBoCode[key].config.internalQuestionCode] = value;
      } else {
        translatedValues[key] = value; // Should we keep these or drop them?
      }
    }
    return translatedValues;
  }

  async translateSingleKoBoResult(result, entityQuestion) {
    const {
      _id: event,
      _submission_time: eventDate,
      [entityQuestion]: koboEntityCode,
      ...restOfFields
    } = result;

    const { orgUnit, orgUnitName } = await this.fetchEntityInfoFromKoBoAnswer(koboEntityCode);
    const dataValues = await this.translateKoBoDataValues(restOfFields);

    return {
      event,
      eventDate,
      orgUnit,
      orgUnitName,
      dataValues,
    };
  }

  async translateKoBoResults(results, entityQuestion) {
    // TODO: Swap this to fetch all at once
    return Promise.all(
      results.map(result => this.translateSingleKoBoResult(result, entityQuestion)),
    );
  }
}
